// utils/roles.js

export const ROLE = {
  PLAYMATE: 'PLAYMATE',   // 陪玩
  DISPATCH: 'DISPATCH',   // 客服/派单
  FINANCE: 'FINANCE',     // 财务
  ADMIN: 'ADMIN',         // 管理
}

const zh2en = {
  '陪玩': ROLE.PLAYMATE,
  '客服': ROLE.DISPATCH,
  '派单': ROLE.DISPATCH,
  '财务': ROLE.FINANCE,
  '管理': ROLE.ADMIN,
}

const en2zh = {
  [ROLE.PLAYMATE]: '陪玩',
  [ROLE.DISPATCH]: '客服',
  [ROLE.FINANCE]: '财务',
  [ROLE.ADMIN]: '管理',
}

/** 统一把中/英文角色转换成英文大写常量 */
export function normalizeRole(input) {
  if (!input) return ''
  const s = String(input).trim().toUpperCase()
  if (ROLE[s]) return s
  const zh = String(input).trim()
  return zh2en[zh] || ''
}

/** 将英文角色转中文展示 */
export function roleLabel(role) {
  const r = normalizeRole(role)
  return en2zh[r] || '未设置'
}

/**
 * 导航/入口可见性（可按需扩展）
 * @param role 当前角色（中/英均可）
 * @param target 入口标识：'playmate' | 'dispatch' | 'finance' | 'admin'
 */
export function canSee(role, target) {
  const r = normalizeRole(role)
  switch (target) {
    case 'playmate':
      return r === ROLE.PLAYMATE || r === ROLE.ADMIN || r === ROLE.DISPATCH
    case 'dispatch':
      return r === ROLE.DISPATCH || r === ROLE.ADMIN
    case 'finance':
      return r === ROLE.FINANCE || r === ROLE.ADMIN
    case 'admin':
      return r === ROLE.ADMIN
    default:
      return false
  }
}
