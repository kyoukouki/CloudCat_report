// pages/index.js
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { parseRoles, ROLE, 可见 } from '@/utils/roles'
import { useRouter } from 'next/router'
import { applyRoleTheme } from '@/utils/routing'
import Nav from '@/components/Nav'

export default function Home() {
  const r = useRouter()
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) return r.replace('/signin')
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
      setProfile(p)
      const rs = parseRoles(p)
      setRoles(rs)
      applyRoleTheme(rs[0])
    })()
  }, [])

  function go(href){ r.push(href) }

  return (
    <div className="wrap">
      <Nav/>
      <div className="card">
        <h2>你好，{profile?.name || profile?.email || '小伙伴'}</h2>
        <p>你的身份：{roles.join('、') || '未设置'}</p>
        <div className="grid">
          {可见(roles,[ROLE.PLAYMATE]) && <button onClick={()=>go('/playmate/new')}>进入「陪玩报单」</button>}
          {可见(roles,[ROLE.DISPATCH,ROLE.SERVICE,ROLE.ADMIN,ROLE.FINANCE]) && <button onClick={()=>go('/dispatch')}>进入「客户管理 / 反馈」</button>}
          {可见(roles,[ROLE.FINANCE,ROLE.ADMIN]) && <button onClick={()=>go('/finance')}>进入「财务汇总」</button>}
          {可见(roles,[ROLE.ADMIN]) && <button onClick={()=>go('/admin/users')}>进入「用户 / 角色」</button>}
        </div>
      </div>
      <style jsx>{`
        .wrap{ min-height:100vh; background:repeating-linear-gradient(0deg,#fde7f0,#fde7f0 24px,#fff7fb 24px,#fff7fb 48px); }
        .card{ max-width:760px; margin:24px auto; background:#fff; border:3px solid #ffc3d9; border-radius:16px; padding:16px; }
        .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin-top:8px; }
        button{ padding:12px; border:none; border-radius:12px; background:var(--brand,#ff8fb3); color:#fff; }
      `}</style>
    </div>
  )
}
