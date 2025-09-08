import Head from 'next/head'
import '@/styles/globals.css'

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
