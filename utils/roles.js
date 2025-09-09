// utils/roles.js
const ZH2EN = {
  '陪玩': 'PLAYMATE',
  '客服': 'DISPATCH',
  '财务': 'FINANCE',
  '管理': 'ADMIN',
  // 兼容本来就是英文的
  PLAYMATE: 'PLAYMATE',
  DISPATCH: 'DISPATCH',
  FINANCE:  'FINANCE',
  ADMIN:    'ADMIN',
};

const EN2ZH = {
  PLAYMATE: '陪玩',
  DISPATCH: '客服',
  FINANCE:  '财务',
  ADMIN:    '管理',
};

export function normalizeRole(role) {
  return ZH2EN[role] || null;              // 统一为英文
}

export function displayRole(role) {
  const en = normalizeRole(role);
  return en ? EN2ZH[en] : '未设置';        // UI 显示中文徽章
}

// ===== 权限判断基础函数 =====
export function isFinanceOrAdmin(role) {
  const en = normalizeRole(role);
  return en === 'FINANCE' || en === 'ADMIN';
}
export function isPlaymate(role) {
  return normalizeRole(role) === 'PLAYMATE';
}
export function isDispatch(role) {
  return normalizeRole(role) === 'DISPATCH';
}

// ===== 登录后落地页 =====
export function landingPath(role) {
  const en = normalizeRole(role);
  const map = {
    PLAYMATE: '/playmate/new',
    DISPATCH: '/dispatch',
    FINANCE:  '/finance',
    ADMIN:    '/finance',
  };
  return map[en] || '/';
}

/**
 * 向后兼容方法（你的代码里已经在用）：
 * canSee(profileOrRole, ...allow)
 * - profileOrRole：可以是 profile 对象或字符串角色（中/英都可）
 * - allow：允许的角色（可变参数或数组，支持中/英）
 * 用法示例：
 *   canSee(profile, '财务', '管理')
 *   canSee(profile, ['DISPATCH','FINANCE','ADMIN'])
 *   canSee('陪玩', 'PLAYMATE')
 */
export function canSee(profileOrRole, ...allow) {
  const role =
    typeof profileOrRole === 'string'
      ? profileOrRole
      : (profileOrRole?.role ?? null);

  const r = normalizeRole(role);
  const allowed = allow.flat().map(normalizeRole).filter(Boolean);
  return r ? allowed.includes(r) : false;
}

// 兼容旧项目里导入的 roleLabel —— 等价于 displayRole
export const roleLabel = displayRole;
