import Link from 'next/link'
export default function Pending(){
  return (
    <div className="container">
      <div className="card cat-card" style={{maxWidth:520, margin:'32px auto'}}>
        <h2>🐾 资料已提交，等待管理员确认</h2>
        <p>审核通过后即可进入你的工作台。</p>
        <div className="grid">
          <Link className="ghost button" href="/">返回首页</Link>
        </div>
      </div>
    </div>
  )
}
