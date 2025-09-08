import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DebugConn(){
  const [result, setResult] = useState({})
  useEffect(()=>{(async()=>{
    const out = {}
    out.env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '(undefined)',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***set***' : '(undefined)',
    }
    const { data:{ user }, error:uerr } = await supabase.auth.getUser()
    out.user = user || null
    out.userError = uerr?.message || null

    let q = {}
    if (user){
      const { data, error } = await supabase
        .from('profiles').select('email,role,status,name').eq('id', user.id).maybeSingle()
      q = { data, error: error?.message || null }
    }else{
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      q = { data, error: error?.message || null }
    }
    out.profileQuery = q
    setResult(out)
  })()},[])
  return <pre style={{whiteSpace:'pre-wrap',padding:16}}>{JSON.stringify(result,null,2)}</pre>
}
