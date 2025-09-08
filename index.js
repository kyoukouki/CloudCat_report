import Nav from '@/components/Nav'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Nav />
      <div className="container">
        <h1>Cloudcat 内部系统（统一入口）</h1>
        <p>请使用上方导航进入对应角色的工作台：</p>
        <ul>
          <li><Link href="/playmate/new">陪玩录单</Link>（PLAYMATE）</li>
          <li><Link href="/dispatch">派单/客服</Link>（DISPATCH）</li>
          <li><Link href="/finance">财务汇总</Link>（FINANCE）</li>
        </ul>
        <div className="card">
          <b>第一次使用？</b> 先到 <code>/signin</code> 注册，再让管理员在 <code>profiles</code> 表里设置你的 <b>role</b>。
        </div>
      </div>
      <footer className="container">© Cloudcat</footer>
    </div>
  )
}
