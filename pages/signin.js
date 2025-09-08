import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { routeAfterAuth, applyRoleTheme } from '@/utils/routing'

export default function SignIn() {
  const r = useRouter()
  const [step, setStep] = useState('email') // email | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function ensureProfile(userId, email) {
    await supabase.from('profiles').upsert(
      { id: userId, email }, { onConflict: 'id' }
    )
    const { data: p } = await supabase
      .from('profiles').select('role,status').eq('id', userId).single()
    return p
  }

  async function nextByEmail(e){
  e.preventDefault()
  setLoading(true); setMsg('')
  try {
    let exists = null

    // 1) 首选 RPC：查 auth.users 是否已存在
    const { data: ex, error: e1 } = await supabase.rpc('email_registered', { e: email })
    if (e1) console.warn('rpc error:', e1.message)
    if (typeof ex === 'boolean') exists = ex

    // 2) 兜底：查 profiles 里是否已有（有些老账号没建 profile）
    if (exists === null) {
      const { data: p, error: e2 } = await supabase
        .from('profiles').select('id').eq('email', email).maybeSingle()
      if (e2) console.warn('profiles check error:', e2.message)
      exists = !!p?.id
    }

    setStep(exists ? 'login' : 'register')
  } catch (err) {
    console.error(err)
    setMsg('查询邮箱时出错，请重试或直接选择登录。')
    setStep('login') // 再兜底：直接切登录
  } finally {
    setLoading(false) // 一定要关掉 loading，避免卡住
  }
}

  async function doLogin(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error){ setMsg(error.message); setLoading(false); return }
    const prof = await ensureProfile(data.user.id, email)
    applyRoleTheme(prof?.role)
    routeAfterAuth(prof, r, '/signin')
  }

  async function doRegister(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error){ setMsg(error.message); setLoading(false); return }
    await supabase.from('profiles').upsert({
      id: data.user.id, email, role: '陪玩', status: 'PENDING'
    }, { onConflict: 'id' })
    // 新用户默认待审核 → 去 /pending
    routeAfterAuth({ role:'陪玩', status:'PENDING' }, r, '/signin')
  }

  return (
    <div className="container">
      <div className="card cat-card" style={{maxWidth:420, margin:'32px auto', padding:'20px'}}>
        <h2 className="cat-title">云喵俱乐部</h2>

        {step==='email' && (
          <form onSubmit={nextByEmail} className="grid">
            <input className="input" type="email" placeholder="请输入邮箱"
              value={email} onChange={e=>setEmail(e.target.value)} required/>
            <button disabled={loading}>{loading?'查询中…':'下一步'}</button>
          </form>
        )}

        {step==='login' && (
          <form onSubmit={doLogin} className="grid">
            <div className="alert">检测到老用户：{email}</div>
            <input className="input" type="password" placeholder="请输入密码"
              value={password} onChange={e=>setPassword(e.target.value)} required/>
            <button disabled={loading}>{loading?'登录中…':'登录'}</button>
            <button type="button" className="ghost" onClick={()=>setStep('email')}>返回修改邮箱</button>
          </form>
        )}

        {step==='register' && (
          <form onSubmit={doRegister} className="grid">
            <div className="alert">新邮箱：{email}</div>
            <input className="input" type="password" placeholder="请设置登录密码（至少 6 位）"
              minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/>
            <button disabled={loading}>{loading?'创建中…':'创建账号'}</button>
            <small className="muted">创建成功后会进入“等待管理员确认”页面</small>
            <button type="button" className="ghost" onClick={()=>setStep('email')}>返回修改邮箱</button>
          </form>
        )}

        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </div>
    </div>
  )
}
