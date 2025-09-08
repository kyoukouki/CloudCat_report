import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// 用法：const ok = useRoleGate(['DISPATCH','ADMIN'])
export function useRoleGate(roles) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = '/signin')
      const { data: p } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()
      if (roles.includes(p?.role)) setOk(true)
      else location.href = '/'
    })
  }, [roles])
  return ok
}
