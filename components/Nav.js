import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { roleLabel, canSee } from '@/utils/roles'

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

  const role = profile?.role || null

  return (
    <nav>
      <Link href="/" className="brand">🐾 云喵 club</Link>

      {canSee(role, 'playmateNew') && <Link href="/playmate/new">陪玩录单</Link>}
      {canSee(role, 'dispatch')    && <Link href="/dispatch">派单/客服</Link>}
      {canSee(role, 'finance')     && <Link href="/finance">财务</Link>}

      <div className="spacer" />
      {user ? (
        <>
          <span className="badge">{roleLabel(role)}</span>
          <small className="muted">{profile?.name || user.email}</small>
          <button className="ghost" onClick={signOut}>退出</button>
        </>
      ) : (
        <Link className="ghost" href="/signin">登录 / 注册</Link>
      )}
    </nav>
  )
}
