import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { getLandingPath, roleLabel } from '@/utils/roles'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function ensureProfile(userId, email) {
    // 默认新注册为“陪玩”，你也可以改默认角色
    await supabase.from('profiles').upsert({
      id: userId, name: email.split('@')[0], role: 'PLAYMATE'
    }, { onConflict: 'id' })
    const { data: p } = await supabase
      .from('profiles').select('name, role').eq('id', userId).single()
    return p
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setMsg('')
    // 先尝试登录
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    let user = data?.user
    if (error) {
      // 不存在就注册
      const { data: si, error: se } = await supabase.auth.signUp({ email, password })
      if (se) { setMsg(se.message); setLoading(false); return }
      user = si.user
    }
    const profile = await ensureProfile(user.id, email)
    setMsg(`欢迎 ${profile?.name || email}（${roleLabel(profile?.role)}）`)
    router.replace(getLandingPath(profile?.role))
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:480, margin:'40px auto'}}>
        <h2>登录 / 注册</h2>
        <form onSubmit={handleLogin} className="grid">
          <input className="input" type="email" placeholder="邮箱" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input className="input" type="password" placeholder="密码" value={password} onChange={e=>setPassword(e.target.value)} required/>
          <button disabled={loading}>{loading ? '处理中…' : '进入云喵后台'}</button>
        </form>
        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </div>
    </div>
  )
}
