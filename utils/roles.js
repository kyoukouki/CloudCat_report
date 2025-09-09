// utils/roles.js
export const ROLE = {
  PLAYMATE: '陪玩',
  SERVICE: '客服',
  DISPATCH: '派单',
  FINANCE: '财务',
  ADMIN: '管理',
};

export const 所有角色 = Object.values(ROLE);

// 读取资料里的角色：优先数组 roles，其次单值 role
export function parseRoles(profile) {
  if (!profile) return [];
  if (Array.isArray(profile.roles)) return profile.roles.filter(Boolean);
  if (profile.role) return [profile.role];
  return [];
}

// 判断“用户角色 是否包含 任一需要角色”
export function 可见(用户角色 = [], 需要 = []) {
  const set = new Set(用户角色);
  return 需要.some((r) => set.has(r));
}

// 别名，兼容你项目里旧调用
export const canSee = 可见;
export const 角色名 = (r) => r;
export const roleLabel = 角色名;

// 登录后默认入口（从高权限到低权限）
export function 默认入口(用户角色 = []) {
  if (可见(用户角色, [ROLE.FINANCE])) return '/finance';
  if (可见(用户角色, [ROLE.ADMIN])) return '/admin/users';
  if (可见(用户角色, [ROLE.DISPATCH, ROLE.SERVICE])) return '/dispatch';
  return '/playmate/new';
}
// 兼容旧调用
export const landingPath = 默认入口;
