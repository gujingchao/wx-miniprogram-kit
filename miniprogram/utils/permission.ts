import { getConfig } from '../config/index'
import { getStorage, setStorage } from './storage'

export type PermMode = 'every' | 'some'

export function getPermissions(): string[] {
  return getStorage<string[]>(getConfig().permissionKey, []) || []
}

export function setPermissions(codes: string[]): void {
  setStorage(getConfig().permissionKey, codes || [])
}

export function getRoles(): string[] {
  return getStorage<string[]>(getConfig().roleKey, []) || []
}

export function setRoles(roles: string[]): void {
  setStorage(getConfig().roleKey, roles || [])
}

function toArray(input: string | string[] | undefined | null): string[] {
  if (!input) return []
  return Array.isArray(input) ? input.filter(Boolean) : [input]
}

export function hasPermission(
  code?: string | string[],
  mode: PermMode = 'every'
): boolean {
  const need = toArray(code)
  if (need.length === 0) return true
  const owned = getPermissions()
  if (owned.indexOf('*') >= 0) return true
  if (mode === 'some') return need.some((c) => owned.indexOf(c) >= 0)
  return need.every((c) => owned.indexOf(c) >= 0)
}

export function hasRole(role?: string | string[], mode: PermMode = 'every'): boolean {
  const need = toArray(role)
  if (need.length === 0) return true
  const owned = getRoles()
  if (owned.indexOf('admin') >= 0 && need.indexOf('admin') < 0) {
    // admin 默认具备其它业务角色以外的放行？不，角色按精确匹配，避免误放。
  }
  if (mode === 'some') return need.some((r) => owned.indexOf(r) >= 0)
  return need.every((r) => owned.indexOf(r) >= 0)
}

function isLoggedIn(): boolean {
  return !!(getStorage<string>(getConfig().tokenKey, '') || '')
}

export interface GuardOptions {
  /** 需要登录 */
  requireLogin?: boolean
  /** 需要的权限码 */
  permission?: string | string[]
  /** 需要的角色 */
  role?: string | string[]
  mode?: PermMode
  /** 不通过时的跳转，默认 config.forbiddenPath / loginPath */
  redirect?: string
  /** 跳转方式 */
  navigate?: 'navigate' | 'redirect' | 'reLaunch' | 'back'
  /** 失败时是否自动跳转，默认 true */
  autoRedirect?: boolean
}

export type GuardReason = 'ok' | 'unauthenticated' | 'forbidden'

export interface GuardResult {
  ok: boolean
  reason: GuardReason
}

/**
 * 页面守卫：放在 Page.onLoad / onShow 里调用。
 * 返回是否放行；默认在失败时自动跳转登录页 / 无权限页。
 */
export function guardPage(options: GuardOptions = {}): GuardResult {
  const {
    requireLogin = true,
    permission,
    role,
    mode = 'every',
    autoRedirect = true,
    navigate = 'redirect'
  } = options

  if (requireLogin && !isLoggedIn()) {
    if (autoRedirect) go(options.redirect || getConfig().loginPath, navigate)
    return { ok: false, reason: 'unauthenticated' }
  }

  const permOk = hasPermission(permission, mode)
  const roleOk = hasRole(role, mode)
  if (!permOk || !roleOk) {
    if (autoRedirect) go(options.redirect || getConfig().forbiddenPath, navigate)
    return { ok: false, reason: 'forbidden' }
  }

  return { ok: true, reason: 'ok' }
}

function go(url: string, navigate: GuardOptions['navigate']): void {
  if (navigate === 'back') {
    wx.navigateBack({ delta: 1 })
    return
  }
  const fn =
    navigate === 'reLaunch'
      ? wx.reLaunch
      : navigate === 'navigate'
        ? wx.navigateTo
        : wx.redirectTo
  fn({
    url,
    fail: () => {
      wx.redirectTo({ url })
    }
  })
}

/**
 * 可插拔权限检查。业务可替换为远程权限 / RBAC。
 */
export type PermissionChecker = (code: string | string[], mode?: PermMode) => boolean

let customChecker: PermissionChecker | null = null

export function setPermissionChecker(checker: PermissionChecker | null): void {
  customChecker = checker
}

export function checkPermission(code?: string | string[], mode: PermMode = 'every'): boolean {
  if (!code || (Array.isArray(code) && code.length === 0)) return true
  if (customChecker) return customChecker(code, mode)
  return hasPermission(code, mode)
}
