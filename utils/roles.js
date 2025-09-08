// 统一的角色与中文名
export const ROLES = {
  PLAYMATE: '陪玩',
  DISPATCH: '客服',
  FINANCE:  '财务',
  ADMIN:    '管理',
};

// 登录后跳去的页面
export const landingPathByRole = {
  PLAYMATE: '/playmate/new',
  DISPATCH: '/dispatch',
  FINANCE:  '/finance',
  ADMIN:    '/finance', // 也可以改成 '/admin'
};

export const roleLabel = (role) => ROLES[role] || '未设置';
export const getLandingPath = (role) => landingPathByRole[role] || '/signin';

// 页面访问权限（按需改）
export const canSee = (role, pageKey) => {
  const perms = {
    playmateNew: ['PLAYMATE','ADMIN'],
    dispatch:    ['DISPATCH','ADMIN'],
    finance:     ['FINANCE','ADMIN'],
    admin:       ['ADMIN'],
  };
  return (perms[pageKey] || []).includes(role);
};

