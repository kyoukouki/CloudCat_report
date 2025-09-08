import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useMemo, useState } from 'react'
import { toCSV, download } from '@/utils/csv'

export default function DispatchPage() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('confirm')

  const [name, setName] = useState('')
  const [prev, setPrev] = useState(0)
  const [topup, setTopup] = useState(0)
  const [spend, setSpend] = useState(0)
  const [bonus, setBonus] = useState(0)
  const balance = useMemo(() => Number(prev||0) + Number(topup||0) + Number(bonus||0) - Number(spend||0), [prev, topup, bonus, spend])
  const [members, setMembers] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { location.href = '/signin'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      setRole(p?.role || null)
      if (!['DISPATCH','ADMIN'].includes(p?.role)) {
        alert('需要 DISPATCH 或 ADMIN 角色'); location.href = '/'
      } else { refreshOrders(); refreshMembers() }
    })
  }, [])

  async function refreshOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }
  async function refreshMembers() {
    const { data } = await supabase.from('members').select('*').order('updated_at', { ascending: false })
    setMembers(data || [])
  }

  async function confirmOrder(id) {
    const { error } = await supabase.from('orders').update({ status: 'CONFIRMED' }).eq('id', id)
    if (!error) refreshOrders()
  }
  async function deleteOrder(id) {
    if (!confirm('确认删除该订单？')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (!error) refreshOrders()
  }

  async function upsertMember(e) {
    e.preventDefault(); setMsg('')
    if (!name.trim()) return setMsg('请填写会员名称')
    const { error } = await supabase.from('members').upsert({
      name: name.trim(),
      prev_balance: Number(prev||0),
      topup: Number(topup||0),
      spend: Number(spend||0),
      bonus: Number(bonus||0),
      balance
    }, { onConflict: 'name' })
    if (error) setMsg(error.message)
    else { setName(''); setPrev(0); setTopup(0); setSpend(0); setBonus(0); setMsg('已保存会员余额记录 ✅'); refreshMembers() }
  }

  const pending = orders.filter(o => o.status === 'PENDING')
  const confirmed = orders.filter(o => o.status === 'CONFIRMED')

  return (
    <div>
      <Nav />
      <div className="container">
        <h2>派单 / 客服</h2>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className={tab==='confirm'?'':'ghost'} onClick={()=>setTab('confirm')}>派单确认</button>
          <button className={tab==='prepaid'?'':'ghost'} onClick={()=>setTab('prepaid')}>预存客户维护</button>
          <button className={tab==='confirmed'?'':'ghost'} onClick={()=>setTab('confirmed')}>已确认订单</button>
        </div>

        {tab === 'confirm' && (
          <div className="card">
            <h3>待确认订单（{pending.length}）</h3>
            <table className="table">
              <thead><tr>
                <th>下单时间</th><th>老板</th><th>陪玩</th><th>项目</th><th>开始-结束</th><th>时长(h)</th><th>单价</th><th>总价</th><th>操作</th>
              </tr></thead>
              <tbody>
                {pending.map(o => (
                  <tr key={o.id}>
                    <td>{o.created_at?.replace('T',' ').slice(0,16)}</td>
                    <td>{o.boss}</td>
                    <td>{o.companion_name}</td>
                    <td>{o.project}</td>
                    <td>{o.start_at?.replace('T',' ').slice(0,16)} → {o.end_at?.replace('T',' ').slice(0,16)}</td>
                    <td>{o.hours}</td><td>{o.unit_price}</td><td>{o.total_price}</td>
                    <td><button onClick={()=>confirmOrder(o.id)}>确认</button> <button className="danger" onClick={()=>deleteOrder(o.id)}>删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:10}}>
              <button className="ghost" onClick={()=>download(`orders-pending.csv`, toCSV(pending))}>导出 CSV</button>
            </div>
          </div>
        )}

        {tab === 'confirmed' && (
          <div className="card">
            <h3>已确认订单（{confirmed.length}）</h3>
            <table className="table">
              <thead><tr>
                <th>下单时间</th><th>老板</th><th>陪玩</th><th>项目</th><th>开始-结束</th><th>时长(h)</th><th>单价</th><th>总价</th>
              </tr></thead>
              <tbody>
                {confirmed.map(o => (
                  <tr key={o.id}>
                    <td>{o.created_at?.replace('T',' ').slice(0,16)}</td>
                    <td>{o.boss}</td>
                    <td>{o.companion_name}</td>
                    <td>{o.project}</td>
                    <td>{o.start_at?.replace('T',' ').slice(0,16)} → {o.end_at?.replace('T',' ').slice(0,16)}</td>
                    <td>{o.hours}</td><td>{o.unit_price}</td><td>{o.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:10}}>
              <button className="ghost" onClick={()=>download(`orders-confirmed.csv`, toCSV(confirmed))}>导出 CSV</button>
            </div>
          </div>
        )}

        {tab === 'prepaid' && (
          <div className="card">
            <h3>预存客户维护（新增/更新）</h3>
            <form className="grid grid-2" onSubmit={upsertMember}>
              <label>会员名称<input className="input" value={name} onChange={e=>setName(e.target.value)} /></label>
              <label>原有余额<input className="input" type="number" value={prev} onChange={e=>setPrev(e.target.value)} /></label>
              <label>充值金额<input className="input" type="number" value={topup} onChange={e=>setTopup(e.target.value)} /></label>
              <label>本次消费<input className="input" type="number" value={spend} onChange={e=>setSpend(e.target.value)} /></label>
              <label>充值赠送<input className="input" type="number" value={bonus} onChange={e=>setBonus(e.target.value)} /></label>
              <label>卡内余额<input className="input" value={balance} readOnly /></label>
              <div style={{gridColumn:'1/-1', display:'flex', justifyContent:'flex-end', gap:8}}>
                <button type="submit">保存</button>
              </div>
              {msg && <p className="alert" style={{gridColumn:'1/-1'}}>{msg}</p>}
            </form>

            <h3 style={{marginTop:16}}>会员余额一览（{members.length}）</h3>
            <table className="table">
              <thead><tr><th>会员名称</th><th>原有余额</th><th>充值金额</th><th>本次消费</th><th>充值赠送</th><th>卡内余额</th><th>更新时间</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.prev_balance}</td>
                    <td>{m.topup}</td>
                    <td>{m.spend}</td>
                    <td>{m.bonus}</td>
                    <td>{m.balance}</td>
                    <td>{m.updated_at?.replace('T',' ').slice(0,16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:10}}>
              <button className="ghost" onClick={()=>download(`members.csv`, toCSV(members))}>导出 CSV</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
