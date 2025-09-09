// utils/guard.js
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import { normalizeRole } from '@/utils/roles'

/** 读取当前登录用户 */
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
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  return { user, loading }
}

/** 读取 profiles（email/role/status/name） */
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
  }, [user?.id, userLoading])

  return { profile, loading: userLoading || loading, error }
}

/**
 * 角色闸门
 * @param allow 允许角色（中文或英文，单个或数组）
 * @param options {redirect?: boolean} 自动跳转（默认 true）
 * @returns { ok, loading, user, profile, reason }
 *  - reason: 'NO_LOGIN' | 'PENDING' | 'FORBIDDEN' | null
 */
export function useRoleGate(allow, { redirect = true } = {}) {
  const router = useRouter()
  const allowList = useMemo(() => Array.isArray(allow) ? allow : [allow], [allow])
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
    if (!profile) return 'FORBIDDEN'
    if (profile.status !== 'APPROVED') return 'PENDING'
    const r = normalizeRole(profile.role)
    if (!allowSet.has(r)) return 'FORBIDDEN'
    return null
  }, [loading, user, profile, allowSet])

  const ok = !loading && reason === null

  useEffect(() => {
    if (!redirect || loading) return
    if (reason === 'NO_LOGIN') router.replace('/signin')
    else if (reason === 'PENDING') router.replace('/pending')
    else if (reason === 'FORBIDDEN') router.replace('/')
  }, [reason, redirect, loading, router])

  return { ok, loading, user, profile, reason }
}
