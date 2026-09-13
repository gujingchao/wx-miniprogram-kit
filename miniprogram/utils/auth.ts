import { getConfig } from '../config/index'
import { getStorage, removeStorage, setStorage } from './storage'
import { setPermissions, setRoles } from './permission'

export interface MockUser {
  id: string
  name: string
  avatar: string
  role: 'guest' | 'user' | 'admin'
}

export interface LoginResult {
  token: string
  user: MockUser
  permissions: string[]
  roles: string[]
}

const PROFILE_MAP: Record<'user' | 'admin', LoginResult> = {
  user: {
    token: 'mock-token-user-001',
    user: {
      id: 'u_1001',
      name: '普通用户',
      avatar: '',
      role: 'user'
    },
    roles: ['user'],
    permissions: ['order:view', 'profile:edit', 'image:upload']
  },
  admin: {
    token: 'mock-token-admin-001',
    user: {
      id: 'u_9001',
      name: '管理员',
      avatar: '',
      role: 'admin'
    },
    roles: ['user', 'admin'],
    permissions: [
      'order:view',
      'order:edit',
      'order:delete',
      'profile:edit',
      'image:upload',
      'user:manage',
      'secret:view'
    ]
  }
}

export function getToken(): string {
  return getStorage<string>(getConfig().tokenKey, '') || ''
}

export function setToken(token: string): void {
  setStorage(getConfig().tokenKey, token)
}

export function clearToken(): void {
  removeStorage(getConfig().tokenKey)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function getUser(): MockUser | null {
  return getStorage<MockUser>(getConfig().userKey, null)
}

export function setUser(user: MockUser | null): void {
  const key = getConfig().userKey
  if (user) setStorage(key, user)
  else removeStorage(key)
}

/**
 * Demo / 本地联调用的模拟登录。
 * 真实环境请走 request('/auth/login')，再 applySession。
 */
export function mockLogin(profile: 'user' | 'admin' = 'user'): LoginResult {
  const result = PROFILE_MAP[profile]
  applySession(result)
  return result
}

export function applySession(result: LoginResult): void {
  setToken(result.token)
  setUser(result.user)
  setRoles(result.roles)
  setPermissions(result.permissions)
}

export function logout(): void {
  clearToken()
  setUser(null)
  setRoles([])
  setPermissions([])
}

export type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler = defaultUnauthorizedHandler

function defaultUnauthorizedHandler(): void {
  logout()
  const loginPath = getConfig().loginPath
  wx.showToast({ title: '请先登录', icon: 'none' })
  setTimeout(() => {
    wx.navigateTo({
      url: loginPath,
      fail: () => {
        wx.redirectTo({ url: loginPath })
      }
    })
  }, 300)
}

/**
 * 注入未授权处理（例如跳自定义登录页、弹窗）。
 * 不传则恢复默认：清 session + 跳 loginPath。
 */
export function setUnauthorizedHandler(handler?: UnauthorizedHandler): void {
  onUnauthorized = handler || defaultUnauthorizedHandler
}

export function triggerUnauthorized(): void {
  onUnauthorized()
}
