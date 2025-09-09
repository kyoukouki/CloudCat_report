// utils/routing.js
import { 默认入口, parseRoles } from './roles';

export function routeAfterAuth(profile, router) {
  const roles = parseRoles(profile || {});
  const path = 默认入口(roles);
  router.replace(path);
}

export function applyRoleTheme(role) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  const 色 = {
    '陪玩': '#ff8fb3',     // 粉色
    '客服': '#8fb3ff',     // 蓝色
    '派单': '#8fb3ff',     // 蓝色
    '财务': '#ffb14b',     // 橙色
    '管理': '#7ac29a',     // 绿色
  };
  root.style.setProperty('--brand', 色[role] || '#ff8fb3');
}

// 兼容旧调用
export const landingPath = 默认入口;
