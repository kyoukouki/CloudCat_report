import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const r = p?.role
      if (r) {
        location.href = r === 'PLAYMATE' ? '/playmate/new' : r === 'DISPATCH' ? '/dispatch' : r === 'FINANCE' ? '/finance' : '/'
      }
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('注册成功。如果开启了邮件验证，请前往邮箱确认。')
      } else {
        const { data: sign, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const { data: p } = await supabase.from('profiles').select('role').eq('id', sign.user.id).single()
        const r = p?.role
        const dest = r === 'PLAYMATE' ? '/playmate/new' : r === 'DISPATCH' ? '/dispatch' : r === 'FINANCE' ? '/finance' : '/'
        location.href = dest
      }
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <Nav />
      <div className="container" style={{maxWidth: 420}}>
        <h2>{mode === 'signup' ? '注册' : '登录'}</h2>
        <form onSubmit={submit} className="card">
          <label>邮箱<input className="input" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
          <label>密码<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button type="submit">{mode === 'signup' ? '注册' : '登录'}</button>
            <button type="button" className="ghost" onClick={()=>setMode(mode==='signup'?'signin':'signup')}>切换到{mode==='signup'?'登录':'注册'}</button>
          </div>
          {msg && <p className="alert" style={{marginTop:12}}>{msg}</p>}
        </form>
        <div className="card">
          <b>提示：</b> 登录后若停在首页，请联系管理员在 <code>profiles</code> 表给你设置角色（PLAYMATE / DISPATCH / FINANCE）。
        </div>
      </div>
    </div>
  )
}
