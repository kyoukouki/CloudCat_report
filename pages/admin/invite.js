import { useState } from 'react'
import { useRoleGate } from '@/utils/guard' // 只有“管理”能打开

export default function Invite() {
  const ok = useRoleGate(['管理'])
  if (!ok) return null

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('陪玩')
  const [msg, setMsg] = useState('')
  const [link, setLink] = useState('')

  async function gen() {
    setMsg('生成中…'); setLink('')
    const r = await fetch('/api/invite', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, role, name })
    })
    const data = await r.json()
    if (!r.ok) { setMsg(data.error || '失败'); return }
    setMsg('复制下面的链接发给对方即可登录')
    setLink(data.link)
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:520, margin:'40px auto'}}>
        <h2>生成免验证登录链接</h2>
        <input className="input" placeholder="邮箱" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="input" placeholder="昵称（可选）" value={name} onChange={e=>setName(e.target.value)}/>
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option>陪玩</option><option>客服</option><option>财务</option><option>管理</option>
        </select>
        <button onClick={gen}>生成链接</button>
        {msg && <p style={{marginTop:10}}>{msg}</p>}
        {link && <textarea className="input" rows="3" readOnly value={link} onFocus={e=>e.target.select()}/>}
      </div>
    </div>
  )
}
