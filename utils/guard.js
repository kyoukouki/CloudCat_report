import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// 角色守卫 + 审批状态
export function useRoleGate(roles) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = '/signin')
      const { data: p } = await supabase
        .from('profiles').select('role,status').eq('id', data.user.id).single()
      if (p?.status === 'PENDING') return (location.href = '/pending')
      if (p?.status === 'SUSPENDED') return (location.href = '/suspended')
      if (roles.includes(p?.role)) setOk(true); else location.href = '/'
    })
  }, [roles])
  return ok
}
