// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 这两个值必须来自 Vercel 环境变量（NEXT_PUBLIC_* 才能在前端用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 帮你在浏览器控制台明确报错，方便排障
  console.error('Supabase env missing:',
    { supabaseUrl, anonKey: supabaseAnonKey ? '***set***' : 'MISSING' })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
