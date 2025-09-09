// utils/guard.js
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { normalizeRole } from '@/utils/roles'

/**
 * 读取当前登录用户
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) {
        setUser(user ?? null)
        setLoading(false)
      }
    }

    // 初次读取
    load()

    // 监听登录状态
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  return { user, loading }
}

/**
 * 读取 profiles 表中的资料（email/role/status/name）
 */
export function useProfile() {
  const { user, loading: userLoading } = useCurrentUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, status, name')
        .eq('id', user.id)
        .maybeSingle()
      if (!mounted) return
      if (error) setError(error)
      setProfile(data ?? null)
      setLoading(false)
    }
    if (!userLoading) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userLoading])

  return { profile, loading: userLoading || loading, error }
}

/**
 * 角色闸门：校验是否允许访问
 * @param allow 允许的角色（中文/英文均可；单个或数组）
 * @param options {redirect?: boolean} 是否自动跳转（默认 true）
 * @returns { ok, loading, user, profile, reason }
 *  - ok: 通过
 *  - reason: 'NO_LOGIN' | 'PENDING' | 'FORBIDDEN' | null
 */
export function useRoleGate(allow, { redirect = true } = {}) {
  const router = useRouter()
  const allowList = useMemo(() => (Array.isArray(allow) ? allow : [allow]), [allow])
  const allowSet = useMemo(
    () => new Set(allowList.map(normalizeRole).filter(Boolean)),
    [allowList]
  )

  const { user, loading: userLoading } = useCurrentUser()
  const { profile, loading: profileLoading } = useProfile()

  const loading = userLoading || profileLoading

  const reason = useMemo(() => {
    if (loading) return null
    if (!user) return 'NO_LOGIN'
    if (!profile) return 'FORBIDDEN' // 没 profile 也不放行
    if (profile.status !== 'APPROVED') return 'PENDING'
    const r = normalizeRole(profile.role)
    if (!allowSet.has(r)) return 'FORBIDDEN'
    return null
  }, [loading, user, profile, allowSet])

  const ok = !loading && reason === null

  // 自动跳转
  useEffect(() => {
    if (!redirect || loading) return
    if (reason === 'NO_LOGIN') {
      router.replace('/signin')
    } else if (reason === 'PENDING') {
      router.replace('/pending')
    } else if (reason === 'FORBIDDEN') {
      // 没有权限，回首页（也可改为 /）
      router.replace('/')
    }
  }, [reason, redirect, loading, router])

  return { ok, loading, user, profile, reason }
}
