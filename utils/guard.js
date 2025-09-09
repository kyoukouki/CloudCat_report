// utils/guard.js
import { normalizeRole, isFinanceOrAdmin, isPlaymate, isDispatch } from '@/utils/roles';

// 判断用户是否具有指定角色（支持中文或英文）
export function hasRole(profile, ...roles) {
  const r = normalizeRole(profile?.role);
  const wanted = roles.map(normalizeRole);
  return r ? wanted.includes(r) : false;
}

// 常用封装
export function canSeeFinance(profile) {
  return isFinanceOrAdmin(profile?.role);
}
export function canSeeDispatch(profile) {
  return isDispatch(profile?.role) || isFinanceOrAdmin(profile?.role);
}
export function canSeePlaymate(profile) {
  return isPlaymate(profile?.role) || isFinanceOrAdmin(profile?.role);
}
