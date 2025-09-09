// components/Nav.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { parseRoles, 可见, ROLE } from '@/utils/roles'
import { useRouter } from 'next/router'

export default function Nav() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState([])

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) return
      setEmail(u.user.email || '')
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
      setRoles(parseRoles(p))
    })()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    r.replace('/signin')
  }

  return (
    <div className="topbar">
      <div className="brand">🐾 云喵 club</div>
      <div className="menus">
        {可见(roles, [ROLE.PLAYMATE]) && <Link href="/playmate/new">报单</Link>}
        {可见(roles, [ROLE.DISPATCH, ROLE.SERVICE, ROLE.ADMIN, ROLE.FINANCE]) && (
          <Link href="/dispatch">客户管理 / 反馈</Link>
        )}
        {可见(roles, [ROLE.FINANCE, ROLE.ADMIN]) && <Link href="/finance">财务汇总</Link>}
        {可见(roles, [ROLE.ADMIN]) && <Link href="/admin/users">用户 / 角色</Link>}
      </div>
      <div className="right">
        <span className="email">{email || '未登录'}</span>
        {email ? <button onClick={logout}>退出</button> : <Link href="/signin">登录</Link>}
      </div>
      <style jsx>{`
        .topbar{
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-bottom:2px solid #ffe2ee; background:#fff;
        }
        .brand{ font-weight:700; color:#444; margin-right:6px; }
        .menus{ display:flex; gap:12px; flex:1; }
        .menus :global(a){ padding:6px 10px; border-radius:999px; border:1px solid #ffd6e5; }
        .right{ display:flex; align-items:center; gap:10px; }
        .email{ color:#999; font-size:13px; }
        button{ border:none; background:var(--brand,#ff8fb3); color:#fff; padding:6px 10px; border-radius:999px; }
      `}</style>
    </div>
  )
}
