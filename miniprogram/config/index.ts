/**
 * 全局配置。
 *
 * 对接 @selyla mock API 时，只需改 `baseURL`（或在 app.onLaunch 里 setConfig）。
 * 其它鉴权 / 上传 / 守卫逻辑都会读取这里。
 */
export interface KitConfig {
  /** API 基址，例如 https://mock.selyla.dev 或本地 mock */
  baseURL: string
  /** 本地缓存 token 的 key */
  tokenKey: string
  /** 本地缓存用户信息的 key */
  userKey: string
  /** 本地缓存权限码的 key */
  permissionKey: string
  /** 本地缓存角色的 key */
  roleKey: string
  /** 请求头里放 token 的字段名 */
  tokenHeader: string
  /** token 前缀，默认 Bearer */
  tokenPrefix: string
  /** 未登录时跳转的登录页 */
  loginPath: string
  /** 无权限时跳转页 */
  forbiddenPath: string
  /** 视为未授权的 HTTP 状态码 */
  unauthorizedCode: number
  /** 不自动带 token 的 URL 片段（登录、公开接口） */
  authWhiteList: string[]
  /**
   * 是否启用内置 mock（baseURL 指向 example.com / mock.local 时自动开启）。
   * 接入真实 / @selyla mock 后设为 false。
   */
  enableBuiltinMock: boolean
}

/** @selyla mock-api 推荐配置。Demo app.ts 默认使用这一套。 */
export const SELYLA_MOCK = {
  baseURL: 'http://127.0.0.1:8787',
  enableBuiltinMock: false as const
}

/** 无本地服务时的内置 mock（request.ts 拦截 example.com / mock.local）。 */
export const BUILTIN_MOCK = {
  baseURL: 'https://api.example.com',
  enableBuiltinMock: true as const
}

export const defaultConfig: KitConfig = {
  baseURL: SELYLA_MOCK.baseURL,
  tokenKey: 'wk_token',
  userKey: 'wk_user',
  permissionKey: 'wk_permissions',
  roleKey: 'wk_roles',
  tokenHeader: 'Authorization',
  tokenPrefix: 'Bearer ',
  loginPath: '/pages/auth/auth',
  forbiddenPath: '/pages/permission/denied',
  unauthorizedCode: 401,
  authWhiteList: ['/auth/login', '/public/', '/ping', '/health'],
  enableBuiltinMock: SELYLA_MOCK.enableBuiltinMock
}

let current: KitConfig = { ...defaultConfig }

export function setConfig(partial: Partial<KitConfig>): KitConfig {
  current = { ...current, ...partial }
  return current
}

export function getConfig(): KitConfig {
  return current
}

export function resolveURL(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = current.baseURL.replace(/\/$/, '')
  const p = path.charAt(0) === '/' ? path : `/${path}`
  return `${base}${p}`
}
