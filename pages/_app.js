import Head from 'next/head'
import '@/styles/theme.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#ffb3cf" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { routeAfterAuth, applyRoleTheme } from '@/utils/routing'
import '@/styles/globals.css' // 你的全局样式路径

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // 进入站点时检查当前会话并路由
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase
        .from('profiles').select('role,status').eq('id', user.id).single()
      applyRoleTheme(p?.role)
      routeAfterAuth(p, router, router.pathname)
    }
    init()

    // 登录/登出/刷新 token 时自动处理跳转 & 主题
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (session?.user) {
        const { data: p } = await supabase
          .from('profiles').select('role,status').eq('id', session.user.id).single()
        applyRoleTheme(p?.role)
        routeAfterAuth(p, router, router.pathname)
      } else {
        applyRoleTheme(null)
        if (!['/signin','/auth/callback'].includes(router.pathname)) {
          router.replace('/signin')
        }
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  return <Component {...pageProps} />
}
