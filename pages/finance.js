// pages/finance.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { ROLE, parseRoles } from '@/utils/roles'
import { useRoleGate } from '@/utils/guard'
import Nav from '@/components/Nav'

export default function Finance() {
  const r = useRouter()
  const [roles, setRoles] = useState([])

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) return r.replace('/signin')
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
      setRoles(parseRoles(p))
    })()
  }, [])
  useRoleGate(roles, [ROLE.FINANCE, ROLE.ADMIN], r)

  return (
    <div className="wrap">
      <Nav/>
      <div className="card">
        <h2>财务汇总（中文）</h2>
        <ol>
          <li>时间区间筛选 → 统计总收入、按陪玩聚合（时长、单数、金额）</li>
          <li>导出 CSV：明细、陪玩汇总、会员余额</li>
          <li>排行榜：按金额/单数/时长排序</li>
        </ol>
        <p style={{color:'#999'}}>（这是可运行的骨架，后续你把查询和导出对接到 Supabase 即可）</p>
      </div>
      <style jsx>{`
        .wrap{ min-height:100vh; background:repeating-linear-gradient(0deg,#fff2e1,#fff2e1 24px,#fff9f1 24px,#fff9f1 48px); }
        .card{ max-width:960px; margin:16px auto; background:#fff; border:3px solid #ffd39b; border-radius:16px; padding:16px; }
      `}</style>
    </div>
  )
}
