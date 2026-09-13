import { defaultConfig, getConfig, setConfig, resolveURL, KitConfig, SELYLA_MOCK, BUILTIN_MOCK } from '../config/index'
import { applySession, mockLogin, logout, getToken, getUser, isLoggedIn, setUnauthorizedHandler } from './auth'
import { interceptors, request, get, post, RequestError } from './request'
import {
  checkPermission,
  getPermissions,
  getRoles,
  guardPage,
  hasPermission,
  hasRole,
  setPermissionChecker,
  setPermissions,
  setRoles
} from './permission'
import { compressImage, formatSize } from './compress'
import { validateField, validateForm, builtinPatterns } from './validator'

export type { KitConfig }

export interface InitKitOptions extends Partial<KitConfig> {
  /** 自定义 401 处理 */
  onUnauthorized?: () => void
}

/**
 * 在 app.ts onLaunch 中调用一次。
 *
 * Demo 推荐：initKit(SELYLA_MOCK)  → http://127.0.0.1:8787，关掉内置 mock。
 * 离线演示：initKit(BUILTIN_MOCK) → 由 request.ts 拦截，无需服务。
 */
export function initKit(options: InitKitOptions = {}): KitConfig {
  const { onUnauthorized, ...cfg } = options
  const next = setConfig(cfg)
  if (onUnauthorized) setUnauthorizedHandler(onUnauthorized)
  return next
}

/** POST /auth/login，把 token / 角色 / 权限写入 Storage。 */
export async function loginByApi(profile: 'user' | 'admin' = 'user'): Promise<any> {
  const res: any = await post('/auth/login', { profile }, { skipAuth: true })
  const payload = (res && res.data) || res
  applySession(payload)
  return payload
}

export {
  defaultConfig,
  SELYLA_MOCK,
  BUILTIN_MOCK,
  getConfig,
  setConfig,
  resolveURL,
  applySession,
  mockLogin,
  logout,
  getToken,
  getUser,
  isLoggedIn,
  setUnauthorizedHandler,
  interceptors,
  request,
  get,
  post,
  RequestError,
  checkPermission,
  getPermissions,
  getRoles,
  guardPage,
  hasPermission,
  hasRole,
  setPermissionChecker,
  setPermissions,
  setRoles,
  compressImage,
  formatSize,
  validateField,
  validateForm,
  builtinPatterns
}
