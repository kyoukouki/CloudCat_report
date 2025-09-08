# Cloudcat 一体化入口（Next.js + Supabase）— v2

## 一、Supabase
1. 新建项目 → Settings → API：复制 `Project URL` 与 `anon public`。
2. SQL Editor → New Query：粘贴 `supabase/schema.sql` 全文 → RUN。
3. Authentication → Providers → Email：开启 Email/Password。

## 二、部署
1. 推到 GitHub。
2. Vercel → Add New → Project → 选仓库。
3. 环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon 公钥
4. Deploy。

## 三、使用
1. `/signin` 注册登录；
2. 在 Supabase → Users 复制 UUID，往 `profiles` 插入角色；
3. 登录后自动跳到对应入口：PLAYMATE → `/playmate/new`、DISPATCH → `/dispatch`、FINANCE → `/finance`；
4. 导出 CSV。

> 已按角色隐藏导航入口 + 数据库RLS兜底。
