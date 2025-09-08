import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { roleLabel, canSee } from '@/utils/roles'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user || null)
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles').select('name, role').eq('id', data.user.id).single()
        setProfile(p || null)
      }
    })
  }, [])

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{maxWidth:560, margin:'40px auto'}}>
          <h2>欢迎来到云喵 club</h2>
          <p>请先 <Link href="/signin">登录/注册</Link></p>
        </div>
      </div>
    )
  }

  const role = profile?.role

  return (
    <div className="container">
      <div className="card">
        <h2>你好，{profile?.name}（{roleLabel(role)}）</h2>
        <p>请选择你的工作入口：</p>
        <div className="grid grid-2">
          {canSee(role,'playmateNew') && (
            <Link href="/playmate/new" className="card">陪玩录单</Link>
          )}
          {canSee(role,'dispatch') && (
            <Link href="/dispatch" className="card">派单 / 客服</Link>
          )}
          {canSee(role,'finance') && (
            <Link href="/finance" className="card">财务汇总</Link>
          )}
          {canSee(role,'admin') && (
            <Link href="/admin" className="card">管理后台（可选）</Link>
          )}
        </div>
      </div>
    </div>
  )
}
