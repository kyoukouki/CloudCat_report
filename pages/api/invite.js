// pages/api/invite.js
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // 仅服务器端读取
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, role = '陪玩', name } = req.body || {}
  if (!email) return res.status(400).json({ error: '缺少 email' })

  // 1) 生成免验证登录链接（不发邮件）
  const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
  })
  if (error) return res.status(400).json({ error: error.message })

  const userId = linkData.user.id

  // 2) profiles 里写入/更新 角色与基础信息
  await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      email,
      name: name || email.split('@')[0],
      role // 中文：'陪玩' | '客服' | '财务' | '管理'
    }, { onConflict: 'id' })

  // 3) 把“可直接登录”的链接返回给前端，管理员自行发送给对方
  return res.status(200).json({ link: linkData.properties.action_link })
}
