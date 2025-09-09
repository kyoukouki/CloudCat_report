// pages/admin/users.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { ROLE, 所有角色, parseRoles } from '@/utils/roles'
import { useRoleGate } from '@/utils/guard'
import Nav from '@/components/Nav'

export default function AdminUsers() {
  const r = useRouter()
  const [meRoles, setMeRoles] = useState([])
  const [list, setList] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) return r.replace('/signin')
      const { data: me } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
      setMeRoles(parseRoles(me))
      await load()
    })()
  }, [])
  useRoleGate(meRoles, [ROLE.ADMIN], r)

  async function load() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,name,role,roles,status')
      .order('email', { ascending: true })
      .limit(200)
    if (error) setMsg(error.message)
    else setList(data || [])
  }

  async function saveRoles(id, roles) {
    setMsg('')
    const payload = { roles, role: roles[0] || null }
    const { error } = await supabase.from('profiles').update(payload).eq('id', id)
    if (error) setMsg('保存失败：' + error.message)
    else { setMsg('已保存'); await load() }
  }

  return (
    <div className="wrap">
      <Nav/>
      <div className="card">
        <h2>用户 / 角色（管理）</h2>
        {msg && <p className="tip">{msg}</p>}
        <table className="t">
          <thead>
            <tr><th>邮箱</th><th>昵称</th><th>角色</th><th>操作</th></tr>
          </thead>
          <tbody>
            {list.map(u => {
              const current = parseRoles(u)
              return (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name || '-'}</td>
                  <td>{current.join('、') || '未设置'}</td>
                  <td>
                    <select multiple value={current} onChange={(e)=>{
                      const vals = Array.from(e.target.selectedOptions).map(o=>o.value)
                      saveRoles(u.id, vals)
                    }}>
                      {所有角色.map(r=> <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{color:'#999'}}>（按住 Ctrl/⌘ 多选；保存后会自动刷新）</p>
      </div>
      <style jsx>{`
        .wrap{ min-height:100vh; background:repeating-linear-gradient(0deg,#e9fff3,#e9fff3 24px,#f5fff9 24px,#f5fff9 48px); }
        .card{ max-width:1000px; margin:16px auto; background:#fff; border:3px solid #bdf0cf; border-radius:16px; padding:16px; }
        .tip{ color:#3a6; }
        .t{ width:100%; border-collapse:collapse; }
        .t th,.t td{ border:1px solid #eee; padding:8px; }
        select{ min-width:140px; min-height:80px; }
      `}</style>
    </div>
  )
}
