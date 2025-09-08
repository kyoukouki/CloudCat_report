// 角色 -> 首页
const landing = {
  '陪玩': '/playmate/new',
  '客服': '/dispatch',
  '财务': '/finance',
  '管理': '/finance', // 也可改 '/admin'
};

export function applyRoleTheme(role) {
  if (role) document.documentElement.setAttribute('data-role', role);
  else document.documentElement.removeAttribute('data-role');
}

export function routeAfterAuth(profile, router, fromPath) {
  if (!profile) return; // 未登录时不处理
  // 待审核统一去 /pending（如果你想让“管理”绕过审核，在这里放行）
  if (profile.status === 'PENDING') {
    if (fromPath !== '/pending') router.replace('/pending');
    return;
  }
  const to = landing[profile.role] || '/';
  // 登录页、回调页、首页等都跳到目标页
  const shouldJump = ['/signin','/auth/callback','/'].includes(fromPath);
  if (shouldJump || fromPath === to) router.replace(to);
}
