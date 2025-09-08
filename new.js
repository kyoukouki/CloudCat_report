import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useMemo, useState } from 'react'

function toISO(dtLocal) { const d = new Date(dtLocal); return d.toISOString() }
function hoursBetween(a, b) { const s = new Date(a).getTime(); const e = new Date(b).getTime(); return Math.max(0, Math.round(((e - s)/3600000) * 100) / 100) }

export default function Page() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [boss, setBoss] = useState('')
  const [project, setProject] = useState('娱乐匹配')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [unitPrice, setUnitPrice] = useState(55)
  const [remark, setRemark] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { location.href = '/signin'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('name, role').eq('id', data.user.id).single()
      setProfile(p || null)
      if (p?.role !== 'PLAYMATE' && p?.role !== 'ADMIN') {
        alert('当前账号角色不允许访问：需要 PLAYMATE 或 ADMIN')
        location.href = '/'
      }
    })
    const now = new Date(), end = new Date(now.getTime() + 2*3600000)
    const toLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16)
    setStartAt(toLocal(now)); setEndAt(toLocal(end))
  }, [])

  const hours = useMemo(() => (startAt && endAt) ? hoursBetween(startAt, endAt) : 0, [startAt, endAt])
  const total = useMemo(() => Math.round(hours * Number(unitPrice||0) * 100)/100, [hours, unitPrice])

  async function submit(e) {
    e.preventDefault(); setMsg('')
    if (!boss.trim()) return setMsg('请填写老板名称')
    if (!hours) return setMsg('时长为 0，请检查时间')
    try {
      const { error } = await supabase.from('orders').insert({
        boss: boss.trim(),
        companion_id: user.id,
        companion_name: profile?.name || '未命名',
        project: project.trim() || '娱乐匹配',
        start_at: toISO(startAt), end_at: toISO(endAt),
        hours, unit_price: Number(unitPrice), total_price: total,
        remark: remark.trim(), status: 'PENDING'
      })
      if (error) throw error
      setBoss(''); setRemark(''); setMsg('已提交，等待派单确认 ✅')
    } catch (err) { setMsg(err.message) }
  }

  return (
    <div>
      <Nav />
      <div className="container">
        <h2>陪玩 · 录入订单</h2>
        <form className="card grid grid-2" onSubmit={submit}>
          <label>陪玩 ID / 名称<input className="input" value={`${user?.id||''} / ${profile?.name||''}`} readOnly /></label>
          <label>老板<input className="input" value={boss} onChange={e=>setBoss(e.target.value)} placeholder="例如：yzz" /></label>
          <label>项目<input className="input" value={project} onChange={e=>setProject(e.target.value)} placeholder="娱乐匹配 / 陪练" /></label>
          <label>开始时间<input className="input" type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)} /></label>
          <label>结束时间<input className="input" type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)} /></label>
          <label>单价（¥/小时）<input className="input" type="number" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} /></label>
          <label>时长（小时）<input className="input" value={hours} readOnly /></label>
          <label>总价（¥）<input className="input" value={total} readOnly /></label>
          <label className="grid" style={{gridColumn:'1/-1'}}>备注<textarea className="input" rows={3} value={remark} onChange={e=>setRemark(e.target.value)} /></label>
          <div style={{gridColumn:'1/-1', display:'flex', justifyContent:'flex-end', gap:8}}>
            <button type="submit">提交订单</button>
          </div>
          {msg && <p className="alert" style={{gridColumn:'1/-1'}}>{msg}</p>}
        </form>
        <div className="card">提交后状态为 <b>PENDING</b>，由派单/客服确认后财务可统计。</div>
      </div>
    </div>
  )
}
