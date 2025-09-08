import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { routeAfterAuth, applyRoleTheme } from '@/utils/routing'
import { getLandingPath } from '@/utils/roles' // 角色 -> 首页

export default function SignIn() {
  const r = useRouter()
  const [step, setStep] = useState('email') // email | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  /** 确保存在 profile（没有就建），并返回 {role,status} */
  async function ensureProfile(userId, mail) {
    try {
      await supabase.from('profiles').upsert(
        { id: userId, email: mail }, { onConflict: 'id' }
      )
      const { data: p, error } = await supabase
        .from('profiles').select('role,status').eq('id', userId).maybeSingle()
      if (error) console.warn('ensureProfile.select error:', error.message)
      return p || { role: null, status: 'PENDING' }
    } catch (e) {
      console.error('ensureProfile failed:', e)
      return { role: null, status: 'PENDING' }
    }
  }

  /** 第一步：判定邮箱是否已注册（RPC -> profiles 兜底） */
  async function nextByEmail(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      let exists = null

      // 1) 精确检查：auth.users 是否存在
      const { data: ex, error: e1 } = await supabase.rpc('email_registered', { e: email })
      if (e1) console.warn('rpc error:', e1.message)
      if (typeof ex === 'boolean') exists = ex

      // 2) 兜底：profiles 是否已有（老号可能没同步）
      if (exists === null) {
        const { data: p, error: e2 } = await supabase
          .from('profiles').select('id').eq('email', email).maybeSingle()
        if (e2) console.warn('profiles check error:', e2.message)
        exists = !!p?.id
      }
      setStep(exists ? 'login' : 'register')
    } catch (err) {
      console.error(err)
      setMsg('查询邮箱时出错，请直接尝试登录。')
      setStep('login')
    } finally {
      setLoading(false) // 重要：关 loading，避免卡住
    }
  }

  /** 老用户登录 */
  async function doLogin(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error){ setMsg(error.message || '登录失败'); return }

      const prof = await ensureProfile(data.user.id, email)
      applyRoleTheme(prof?.role)
      routeAfterAuth(prof, r, '/signin')

      // 兜底：1.5s 后还在 /signin，再强制跳一次
      setTimeout(() => {
        try{
          const pending = prof?.status === 'PENDING'
          const to = pending ? '/pending' : getLandingPath(prof?.role)
          if (window.location.pathname === '/signin') r.replace(to)
        }catch(_){}
      }, 1500)
    } catch (err) {
      console.error(err)
      setMsg('登录异常：' + (err.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  /** 新用户注册 */
  async function doRegister(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try{
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error){
        // 已注册：自动切到登录
        if ((error.message || '').toLowerCase().includes('registered')) {
          setStep('login')
          setMsg('该邮箱已注册，请直接输入密码登录')
        } else {
          setMsg(error.message)
        }
        return
      }
      // 无论是否返回 session，都先把 profile 建好为 PENDING
      await supabase.from('profiles').upsert({
        id: data.user?.id, email, role: '陪玩', status: 'PENDING'
      }, { onConflict: 'id' })

      // 新用户默认待审核 -> 去 /pending
      routeAfterAuth({ role:'陪玩', status:'PENDING' }, r, '/signin')
      setTimeout(() => { if (window.location.pathname === '/signin') r.replace('/pending') }, 1500)
    } catch (err){
      console.error(err)
      setMsg('注册异常：' + (err.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card cat-card" style={{maxWidth:420, margin:'32px auto', padding:'20px'}}>
        <h2 className="cat-title">云喵俱乐部</h2>

        {step==='email' && (
          <form onSubmit={nextByEmail} className="grid">
            <input
              className="input" type="email" placeholder="请输入邮箱"
              value={email} onChange={e=>setEmail(e.target.value)} required
            />
            <button disabled={loading}>{loading?'查询中…':'下一步'}</button>
          </form>
        )}

        {step==='login' && (
          <form onSubmit={doLogin} className="grid">
            <div className="alert">检测到老用户：{email}</div>
            <input
              className="input" type="password" placeholder="请输入密码"
              value={password} onChange={e=>setPassword(e.target.value)} required
            />
            <button disabled={loading}>{loading?'登录中…':'登录'}</button>
            <button type="button" className="ghost" onClick={()=>setStep('email')}>返回修改邮箱</button>
          </form>
        )}

        {step==='register' && (
          <form onSubmit={doRegister} className="grid">
            <div className="alert">新邮箱：{email}</div>
            <input
              className="input" type="password" placeholder="请设置登录密码（至少 6 位）"
              minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required
            />
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
