import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { getLandingPath } from '@/utils/roles'

export default function SignIn() {
  const r = useRouter()
  const [step, setStep] = useState('email') // email | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function ensureProfile(userId, email) {
    // 如果已有就不覆盖角色；没有就建“陪玩 + 待审核”
    await supabase.from('profiles').upsert(
      { id: userId, email, status: 'PENDING' },
      { onConflict: 'id' }
    )
    const { data: p } = await supabase
      .from('profiles').select('role,status').eq('id', userId).single()
    return p
  }

  async function nextByEmail(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    const { data: p } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    setStep(p ? 'login' : 'register')
    setLoading(false)
  }

  async function doLogin(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error){ setMsg(error.message); setLoading(false); return }
    const prof = await ensureProfile(data.user.id, email)
    if (prof?.status === 'PENDING') return r.replace('/pending')
    r.replace(getLandingPath(prof?.role))
  }

  async function doRegister(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error){ setMsg(error.message); setLoading(false); return }
    await supabase.from('profiles').upsert({
      id: data.user.id, email, role: '陪玩', status: 'PENDING'
    }, { onConflict: 'id' })
    r.replace('/pending')
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
            <small className="muted">创建成功后会提示「请等待管理员确认录入信息」</small>
            <button type="button" className="ghost" onClick={()=>setStep('email')}>返回修改邮箱</button>
          </form>
        )}

        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </div>
    </div>
  )
}
