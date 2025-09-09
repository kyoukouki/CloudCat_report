// pages/admin/invite.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { ROLE, 所有角色, parseRoles } from '@/utils/roles'
import { useRoleGate } from '@/utils/guard'
import Nav from '@/components/Nav'

export default function AdminInvite() {
  const r = useRouter()
  const [meRoles, setMeRoles] = useState([])
  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) return r.replace('/signin')
      const { data: me } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
      setMeRoles(parseRoles(me))
    })()
  }, [])
  useRoleGate(meRoles, [ROLE.ADMIN], r)

  async function apply() {
    setMsg('')
    if (!email) return setMsg('请填写邮箱')
    const { data: u } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    if (!u?.id) return setMsg('该邮箱尚未注册登录过系统，先让对方登录一次再设置角色')
    const { error } = await supabase.from('profiles').update({ roles, role: roles[0] || null }).eq('id', u.id)
    if (error) setMsg('设置失败：' + error.message)
    else setMsg('已设置')
  }

  return (
    <div className="wrap">
      <Nav/>
      <div className="card">
        <h2>设置用户角色（管理）</h2>
        <div className="row">
          <input placeholder="用户邮箱" value={email} onChange={e=>setEmail(e.target.value)} />
          <select multiple value={roles} onChange={(e)=>{
            const arr = Array.from(e.target.selectedOptions).map(o=>o.value)
            setRoles(arr)
          }}>
            {所有角色.map(r => <option value={r} key={r}>{r}</option>)}
          </select>
          <button onClick={apply}>保存</button>
        </div>
        <p className="muted">提示：先让对方登录一次，profiles 里才会有该邮箱。</p>
      </div>
      <style jsx>{`
        .wrap{ min-height:100vh; background:repeating-linear-gradient(0deg,#e9fff3,#e9fff3 24px,#f5fff9 24px,#f5fff9 48px); }
        .card{ max-width:900px; margin:16px auto; background:#fff; border:3px solid #bdf0cf; border-radius:16px; padding:16px; }
        .row{ display:flex; gap:10px; align-items:center; }
        input{ flex:1; padding:10px; border:2px solid #d8f5e1; border-radius:10px; }
        select{ min-width:160px; min-height:100px; }
        button{ padding:10px 16px; border:none; border-radius:10px; background:var(--brand,#7ac29a); color:#fff; }
        .muted{ color:#888; margin-top:8px; }
      `}</style>
    </div>
  )
}
