// utils/routing.js
import { landingPath, normalizeRole } from '@/utils/roles';

export function applyRoleTheme(role) {
  // 根据统一后的英文枚举，给 <html> 打 data-role，CSS 按它换主题
  const en = normalizeRole(role);
  if (en) document.documentElement.setAttribute('data-role', en);
  else document.documentElement.removeAttribute('data-role');
}

export function routeAfterAuth(profile, router, fromPath) {
  if (!profile) return;
  if (profile.status === 'PENDING') {
    if (fromPath !== '/pending') router.replace('/pending');
    return;
  }
  const to = landingPath(profile.role);
  if (['/','/signin','/pending','/auth/callback'].includes(fromPath)) {
    router.replace(to);
  }
}
