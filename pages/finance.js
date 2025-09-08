import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRoleGate } from '@/utils/guard'

/** 工具函数 */
const fmt = (n) => (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ymd = (d) => new Date(d).toISOString().slice(0,10)
const toCSV = (rows) => {
  if (!rows?.length) return ''
  const cols = Object.keys(rows[0])
  const head = cols.join(',')
  const body = rows.map(r => cols.map(c => {
    const v = r[c] ?? ''
    return /[,"\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : v
  }).join(',')).join('\n')
  return head + '\n' + body
}

export default function Finance() {
  const ok = useRoleGate(['财务','管理'])
  if (!ok) return null

  // 过滤条件
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const [from, setFrom] = useState(ymd(firstDay))
  const [to, setTo] = useState(ymd(today))
  const [status, setStatus] = useState('全部')
  const [q, setQ] = useState('')

  // 数据 & 状态
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState({}) // id -> { ...row }

  async function fetchData() {
    setLoading(true)
    let query = supabase.from('v_orders_with_names')
      .select('*')
      .gte('created_at', from + ' 00:00:00')
      .lte('created_at', to   + ' 23:59:59')
      .order('created_at', { ascending: false })

    if (status !== '全部') query = query.eq('status', status)
    if (q) {
      // 简单模糊搜：客户名 / 陪玩名 / 邮箱
      query = query.or(`customer.ilike.%${q}%,playmate_name.ilike.%${q}%,playmate_email.ilike.%${q}%`)
    }
    const { data, error } = await query
    if (!error) setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, []) // 初次加载
  useEffect(() => { fetchData() }, [from, to, status]) // 条件变化

  // 统计 & 榜单（基于当前筛选后的 rows 计算）
  const stats = useMemo(() => {
    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
    const cnt = rows.length
    const avg = cnt ? total / cnt : 0
    // 榜单
    const map = new Map()
    rows.forEach(r => {
      const key = r.playmate || r.playmate_email
      if (!key) return
      const o = map.get(key) || { name: r.playmate_name || r.playmate_email, revenue: 0, count: 0 }
      o.revenue += Number(r.amount || 0)
      o.count += 1
      map.set(key, o)
    })
    const board = Array.from(map.values()).sort((a,b)=>b.revenue-a.revenue)
    return { total, cnt, avg, board }
  }, [rows])

  // 编辑行
  function startEdit(r){ setEditing(e => ({ ...e, [r.id]: { ...r } })) }
  function cancelEdit(id){ setEditing(e => { const x = {...e}; delete x[id]; return x }) }
  function patchEdit(id, key, val){ setEditing(e => ({ ...e, [id]: { ...e[id], [key]: val } })) }

  async function saveEdit(id){
    const r = editing[id]
    if (!r) return
    const payload = {
      customer: r.customer, amount: Number(r.amount || 0), status: r.status, note: r.note, playmate: r.playmate
    }
    const { error } = await supabase.from('orders').update(payload).eq('id', id)
    if (!error) {
      cancelEdit(id)
      fetchData()
    } else {
      alert(error.message)
    }
  }

  async function removeRow(id){
    if (!confirm('确认删除该记录？')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) alert(error.message); else fetchData()
  }

  function exportCSV(){
    const csv = toCSV(rows.map(r => ({
      日期: r.created_at?.replace('T',' ').slice(0,19),
      客户: r.customer,
      金额: r.amount,
      陪玩昵称: r.playmate_name,
      陪玩邮箱: r.playmate_email,
      状态: r.status,
      备注: r.note,
      订单ID: r.id
    })))
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `云喵财务导出_${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="container">
      <div className="card" style={{marginBottom:16}}>
        <h2>财务总控台</h2>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
          <div className="kpi"><div className="kpi-h">总流水</div><div className="kpi-v">¥ {fmt(stats.total)}</div></div>
          <div className="kpi"><div className="kpi-h">订单数</div><div className="kpi-v">{stats.cnt}</div></div>
          <div className="kpi"><div className="kpi-h">客单价</div><div className="kpi-v">¥ {fmt(stats.avg)}</div></div>
        </div>
        <div className="grid" style={{marginTop:12, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', alignItems:'center'}}>
          <label>开始：<input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
          <label>结束：<input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
          <label>状态：
            <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
              <option>全部</option>
              <option>已支付</option>
              <option>未支付</option>
              <option>退款</option>
              <option>作废</option>
            </select>
          </label>
          <label>搜索：
            <input className="input" placeholder="客户/陪玩/邮箱…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchData()}/>
          </label>
          <div style={{display:'flex', gap:8}}>
            <button onClick={fetchData} disabled={loading}>{loading?'刷新中…':'刷新'}</button>
            <button className="ghost" onClick={exportCSV}>导出 CSV</button>
          </div>
        </div>
      </div>

      {/* 排行榜 + 简易柱状图 */}
      <div className="card" style={{marginBottom:16}}>
        <h3>陪玩流水排行榜（当前筛选范围）</h3>
        <Leaderboard board={stats.board} />
      </div>

      {/* 数据表（可编辑） */}
      <div className="card">
        <h3>订单明细（可编辑）</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>日期</th>
                <th>客户</th>
                <th>金额</th>
                <th>陪玩</th>
                <th>状态</th>
                <th>备注</th>
                <th style={{width:160}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>{
                const e = editing[r.id]
                return (
                  <tr key={r.id}>
                    <td>{r.created_at?.replace('T',' ').slice(0,19)}</td>
                    <td>{e? <input className="input" value={e.customer||''} onChange={ev=>patchEdit(r.id,'customer',ev.target.value)} /> : (r.customer||'')}</td>
                    <td>{e? <input className="input" type="number" step="0.01" value={e.amount} onChange={ev=>patchEdit(r.id,'amount',ev.target.value)} /> : fmt(r.amount)}</td>
                    <td>{r.playmate_name || r.playmate_email}</td>
                    <td>
                      {e? (
                        <select className="input" value={e.status} onChange={ev=>patchEdit(r.id,'status',ev.target.value)}>
                          {['已支付','未支付','退款','作废'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      ) : r.status}
                    </td>
                    <td>{e? <input className="input" value={e.note||''} onChange={ev=>patchEdit(r.id,'note',ev.target.value)} /> : (r.note||'')}</td>
                    <td>
                      {e ? (
                        <div className="row-btns">
                          <button onClick={()=>saveEdit(r.id)}>保存</button>
                          <button className="ghost" onClick={()=>cancelEdit(r.id)}>取消</button>
                        </div>
                      ) : (
                        <div className="row-btns">
                          <button onClick={()=>startEdit(r)}>编辑</button>
                          <button className="ghost" onClick={()=>removeRow(r.id)}>删除</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!rows.length && (
                <tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>没有记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`
        .kpi{ background:var(--stripe); padding:10px 12px; border-radius:12px; border:1px solid var(--line) }
        .kpi-h{ font-size:12px; color:#666 }
        .kpi-v{ font-size:18px; font-weight:700; color:var(--ink) }
        .table-wrap{ overflow-x:auto }
        .table{ width:100%; border-collapse:collapse }
        .table th,.table td{ padding:8px 10px; border-bottom:1px solid var(--line); white-space:nowrap }
        .row-btns{ display:flex; gap:8px; flex-wrap:wrap }
        @media (max-width:720px){
          .table th:nth-child(6), .table td:nth-child(6){ display:none } /* 移动端隐藏备注列，可在编辑里改 */
        }
      `}</style>
    </div>
  )
}

/* 简易排行榜组件（含小型柱状图，零依赖） */
function Leaderboard({ board=[] }) {
  const top = board.slice(0, 10)
  const max = Math.max(1, ...top.map(x=>x.revenue))
  return (
    <div style={{display:'grid', gap:8}}>
      {top.map((x,i)=>(
        <div key={i} style={{display:'grid', gridTemplateColumns:'24px 1fr auto', gap:8, alignItems:'center'}}>
          <div style={{opacity:.6}}>{i+1}</div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:14}}>
              <b>{x.name}</b><span>¥ {fmt(x.revenue)}（{x.count}单）</span>
            </div>
            <div style={{height:8, background:'var(--stripe)', border:'1px solid var(--line)', borderRadius:8}}>
              <div style={{height:'100%', width:`${(x.revenue/max)*100}%`, background:'var(--deep)', borderRadius:8}}/>
            </div>
          </div>
          <div />
        </div>
      ))}
      {!top.length && <div style={{opacity:.7}}>暂无数据</div>}
    </div>
  )
}
