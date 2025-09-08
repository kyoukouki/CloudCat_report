import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useMemo, useState } from 'react'
import { toCSV, download } from '@/utils/csv'

const fmtYMD = (d) => new Date(d).toISOString().slice(0,10)

export default function FinancePage() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [orders, setOrders] = useState([])
  const [members, setMembers] = useState([])
  const [from, setFrom] = useState(fmtYMD(Date.now() - 7*86400000))
  const [to, setTo] = useState(fmtYMD(Date.now()))
  const [onlyConfirmed, setOnlyConfirmed] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { location.href = '/signin'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      setRole(p?.role || null)
      if (!['FINANCE','ADMIN'].includes(p?.role)) {
        alert('需要 FINANCE 或 ADMIN 角色')
        location.href = '/'
      } else {
        refresh()
      }
    })
  }, [])

  async function refresh() {
    const { data: m } = await supabase.from('members').select('*').order('updated_at', { ascending: false })
    setMembers(m || [])

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    const fromISO = new Date(from).toISOString()
    const toISO = new Date(new Date(to).getTime() + 86400000).toISOString()
    query = query.gte('created_at', fromISO).lte('created_at', toISO)
    if (onlyConfirmed) query = query.eq('status', 'CONFIRMED')
    const { data: o } = await query
    setOrders(o || [])
  }

  const byCompanion = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.companion_name
      const prev = map.get(key) || { orders: 0, hours: 0, total: 0 }
      prev.orders += 1
      prev.hours += Number(o.hours)
      prev.total += Number(o.total_price)
      map.set(key, prev)
    }
    return Array.from(map, ([name, v]) => ({ name, orders: v.orders, hours: +v.hours.toFixed(2), total: +v.total.toFixed(2) }))
  }, [orders])

  const totalSum = useMemo(() => orders.reduce((s, o) => s + Number(o.total_price), 0), [orders])

  return (
    <div>
      <Nav />
      <div className="container">
        <h2>财务 · 汇总</h2>
        <div className="card" style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:12, alignItems:'end'}}>
          <label>开始日期<input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
          <label>结束日期<input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
          <label style={{display:'flex', alignItems:'center', gap:6}}>
            <input type="checkbox" checked={onlyConfirmed} onChange={e=>setOnlyConfirmed(e.target.checked)} />仅统计已确认
          </label>
          <button className="ghost" onClick={refresh}>刷新</button>
          <div className="kpi"><div>总收入：<b>¥ {totalSum.toFixed(2)}</b></div></div>
        </div>

        <div className="card">
          <h3>按陪玩汇总</h3>
          <table className="table">
            <thead><tr><th>陪玩</th><th>订单数</th><th>总时长(h)</th><th>总金额(¥)</th></tr></thead>
            <tbody>{byCompanion.map(r => (<tr key={r.name}><td>{r.name}</td><td>{r.orders}</td><td>{r.hours}</td><td>{r.total}</td></tr>))}</tbody>
          </table>
          <div style={{marginTop:10}}>
            <button className="ghost" onClick={()=>download(`finance-orders.csv`, toCSV(orders))}>导出订单明细 CSV</button>
            <button className="ghost" onClick={()=>download(`finance-summary.csv`, toCSV(byCompanion))}>导出陪玩汇总 CSV</button>
            <button className="ghost" onClick={()=>download(`members.csv`, toCSV(members))}>导出会员余额 CSV</button>
          </div>
        </div>

        <div className="card">
          <h3>会员余额（只读）</h3>
          <table className="table">
            <thead><tr><th>会员名称</th><th>余额</th><th>上次更新</th></tr></thead>
            <tbody>{members.map(m => (<tr key={m.id}><td>{m.name}</td><td>{m.balance}</td><td>{m.updated_at?.replace('T',' ').slice(0,16)}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
