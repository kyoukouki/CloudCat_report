// pages/dispatch.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { ROLE, parseRoles } from '@/utils/roles'
import { useRoleGate } from '@/utils/guard'
import Nav from '@/components/Nav'

export default function Dispatch() {
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
  useRoleGate(roles, [ROLE.DISPATCH, ROLE.SERVICE, ROLE.ADMIN, ROLE.FINANCE], r)

  return (
    <div className="wrap">
      <Nav/>
      <div className="card">
        <h2>客户管理 / 反馈（中文）</h2>
        <p>这里放：客户预存余额维护、快速检索、为订单填写「派单反馈 / 客服反馈」。</p>
        <ul>
          <li>按老板邮箱/昵称搜索 → 展示余额、最近消费、充值历史</li>
          <li>选中某条报单 → 填写「派单反馈 / 客服反馈」（只增补，不改陪玩的原始字段）</li>
        </ul>
        <p style={{color:'#999'}}>（这是可运行的骨架，你可以在此基础上接数据表 / RPC）</p>
      </div>
      <style jsx>{`
        .wrap{ min-height:100vh; background:repeating-linear-gradient(0deg,#eaf2ff,#eaf2ff 24px,#f5f8ff 24px,#f5f8ff 48px); }
        .card{ max-width:960px; margin:16px auto; background:#fff; border:3px solid #cfe0ff; border-radius:16px; padding:16px; }
      `}</style>
    </div>
  )
}
