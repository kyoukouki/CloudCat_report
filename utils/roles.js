// utils/roles.js
const ZH2EN = {
  '陪玩': 'PLAYMATE',
  '客服': 'DISPATCH',
  '财务': 'FINANCE',
  '管理': 'ADMIN',
  // 允许直接是英文
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
  return ZH2EN[role] || null;        // 统一成英文枚举
}
export function displayRole(role) {
  const en = normalizeRole(role);
  return en ? EN2ZH[en] : '未设置';  // 显示中文徽标
}
export function isFinanceOrAdmin(role) {
  const en = normalizeRole(role);
  return en === 'FINANCE' || en === 'ADMIN';
}
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
