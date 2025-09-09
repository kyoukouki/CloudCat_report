// utils/guard.js
import { useEffect } from 'react';
import { 可见 } from './roles';
import { supabase } from '@/lib/supabaseClient';

// 获取登录用户（可选）
export function useAuthUser(setter) {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setter && setter(data?.user ?? null));
  }, []);
}

// 角色守卫：不满足就提示并回首页
export function useRoleGate(userRoles = [], allow = [], router) {
  useEffect(() => {
    if (!allow || allow.length === 0) return;
    if (!可见(userRoles, allow)) {
      if (router) {
        alert(`需要 ${allow.join('、')} 权限`);
        router.replace('/');
      }
    }
  }, [JSON.stringify(userRoles), JSON.stringify(allow)]);
}

// 中文别名（如果你喜欢用中文函数名）
export const 用角色守卫 = useRoleGate;
