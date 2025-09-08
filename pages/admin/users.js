import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRoleGate } from '@/utils/guard'

const ROLES = ['陪玩','客服','财务','管理']

export default function UsersAdmin(){
  const ok = useRoleGate(['管理','财务'])
  if (!ok) return null

  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(){
    setLoading(true)
    // 查 PENDING + 搜索（按邮箱/昵称）
    let query = supabase.from('profiles').select('id,email,name,role,status')
      .order('created_at', { ascending:false })
      .eq('status','PENDING')
    if (q) query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    const { data } = await query
    setRows(data || [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  async function setRole(id, role){
    await supabase.from('profiles').update({ role }).eq('id', id)
    setRows(rs => rs.map(r => r.id===id? {...r, role} : r))
  }
  async function approve(id){
    await supabase.from('profiles').update({ status:'APPROVED' }).eq('id', id)
    setRows(rs => rs.filter(r => r.id!==id))
  }
  async function suspend(id){
    await supabase.from('profiles').update({ status:'SUSPENDED' }).eq('id', id)
    setRows(rs => rs.filter(r => r.id!==id))
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:900, margin:'24px auto'}}>
        <h2>用户审核台（待审核）</h2>
        <div className="grid" style={{gridTemplateColumns:'1fr auto auto', alignItems:'center'}}>
          <input className="input" placeholder="按邮箱/昵称搜索…" value={q}
                 onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/>
          <button onClick={load} disabled={loading}>{loading?'刷新中…':'刷新'}</button>
          <a className="ghost button" href="/">返回首页</a>
        </div>

        <div className="table-wrap" style={{marginTop:12}}>
          <table className="table">
            <thead>
              <tr><th>邮箱</th><th>昵称</th><th>角色</th><th>状态</th><th>操作</th></tr>
            </thead>
            <tbody>
            {rows.map(r=>(
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.name || '-'}</td>
                <td>
                  <select className="input" value={r.role || '陪玩'}
                          onChange={e=>setRole(r.id, e.target.value)}>
                    {ROLES.map(x => <option key={x}>{x}</option>)}
                  </select>
                </td>
                <td>{r.status}</td>
                <td className="row-btns">
                  <button onClick={()=>approve(r.id)}>通过</button>
                  <button className="ghost" onClick={()=>suspend(r.id)}>挂起</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} style={{textAlign:'center',padding:'16px'}}>暂无待审核用户</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`
        .table-wrap{ overflow-x:auto }
        .table{ width:100%; border-collapse:collapse }
        .table th,.table td{ padding:8px 10px; border-bottom:1px solid var(--line); white-space:nowrap }
        .row-btns{ display:flex; gap:8px }
        @media (max-width:720px){
          .table th:nth-child(2), .table td:nth-child(2){ display:none } /* 移动端隐藏昵称列 */
        }
      `}</style>
    </div>
  )
}
