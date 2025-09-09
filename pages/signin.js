// pages/signin.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

function normalizeRole(role) {
  const map = { '陪玩':'PLAYMATE','客服':'DISPATCH','财务':'FINANCE','管理':'ADMIN',
                'PLAYMATE':'PLAYMATE','DISPATCH':'DISPATCH','FINANCE':'FINANCE','ADMIN':'ADMIN' }
  return map[role] || null
}
function landingPath(role) {
  const en = normalizeRole(role)
  const m = {
    PLAYMATE: '/playmate/new',
    DISPATCH: '/dispatch',
    FINANCE:  '/finance',
    ADMIN:    '/finance',
  }
  return m[en] || '/pending'
}

export default function SignIn() {
  const r = useRouter()
  const [tab, setTab] = useState('login')       // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function ensureProfile(userId, mail) {
    try {
      // 给 name 一个默认值，避免 NOT NULL 报错
      await supabase.from('profiles').upsert(
        { id: userId, email: mail, name: mail.split('@')[0] },
        { onConflict: 'id' }
      )
      const { data: p } = await supabase
        .from('profiles').select('role,status').eq('id', userId).maybeSingle()
      return p || { role:null, status:'PENDING' }
    } catch {
      return { role:null, status:'PENDING' }
    }
  }

  async function doLogin(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error){ setMsg(error.message || '登录失败'); return }
      const prof = await ensureProfile(data.user.id, email)
      if (prof.status === 'PENDING') { r.replace('/pending'); return }
      r.replace(landingPath(prof.role))
    }catch(err){ setMsg('登录异常：'+(err.message||'未知错误')) }
    finally{ setLoading(false) }
  }

  async function doRegister(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try{
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error){
        if ((error.message||'').toLowerCase().includes('registered')){
          setTab('login'); setMsg('该邮箱已注册，请直接登录'); return
        }
        setMsg(error.message); return
      }
      // 新用户默认：陪玩 + 待审核
      await supabase.from('profiles').upsert({
        id: data.user?.id,
        email,
        name: email.split('@')[0],
        role: '陪玩',
        status: 'PENDING'
      }, { onConflict:'id' })
      r.replace('/pending')
    }catch(err){ setMsg('注册异常：'+(err.message||'未知错误')) }
    finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <div className="card cat-card" style={{maxWidth:420, margin:'32px auto', padding:'20px'}}>
        <h2 className="cat-title">云喵俱乐部</h2>

        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className={tab==='login'?'button':'ghost button'} onClick={()=>{setTab('login');setMsg('')}}>
            我有账号登录
          </button>
          <button className={tab==='register'?'button':'ghost button'} onClick={()=>{setTab('register');setMsg('')}}>
            我是新用户注册
          </button>
        </div>

        {tab==='login' ? (
          <form onSubmit={doLogin} className="grid">
            <input className="input" type="email" placeholder="邮箱"
                   value={email} onChange={e=>setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="密码"
                   value={password} onChange={e=>setPassword(e.target.value)} required />
            <button disabled={loading}>{loading?'登录中…':'登录'}</button>
          </form>
        ) : (
          <form onSubmit={doRegister} className="grid">
            <input className="input" type="email" placeholder="邮箱"
                   value={email} onChange={e=>setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="设置密码（≥6位）" minLength={6}
                   value={password} onChange={e=>setPassword(e.target.value)} required />
            <button disabled={loading}>{loading?'创建中…':'创建账号'}</button>
            <small className="muted">创建成功后会进入“等待管理员确认”页面</small>
          </form>
        )}

        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </div>
    </div>
  )
}
