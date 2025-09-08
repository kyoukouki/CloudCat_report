import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user || null)
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', data.user.id)
          .single()
        setProfile(p || null)
      }
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    location.href = '/signin'
  }

  return (
    <nav>
      <Link href="/" className="brand">🐾 云喵 club</Link>

      {(profile?.role === 'PLAYMATE' || profile?.role === 'ADMIN') && (
        <Link href="/playmate/new">陪玩录单</Link>
      )}
      {(profile?.role === 'DISPATCH' || profile?.role === 'ADMIN') && (
        <Link href="/dispatch">派单/客服</Link>
      )}
      {(profile?.role === 'FINANCE' || profile?.role === 'ADMIN') && (
        <Link href="/finance">财务</Link>
      )}

      <div className="spacer" />
      {user ? (
        <>
          <span className="badge">{profile?.role || 'NO-ROLE'}</span>
          <small className="muted">{profile?.name || user.email}</small>
          <button className="ghost" onClick={signOut}>退出</button>
        </>
      ) : (
        <Link className="ghost" href="/signin">登录 / 注册</Link>
      )}
    </nav>
  )
}
