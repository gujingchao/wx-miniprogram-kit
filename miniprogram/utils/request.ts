import { getConfig, resolveURL } from '../config/index'
import { getToken, triggerUnauthorized } from './auth'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: any
  header?: Record<string, string>
  timeout?: number
  /** 跳过自动附加 token */
  skipAuth?: boolean
  /** 失败时 toast，默认 true */
  showError?: boolean
}

export interface RequestResult<T = any> {
  data: T
  statusCode: number
  header: Record<string, string>
}

export class RequestError extends Error {
  statusCode: number
  data: any
  constructor(message: string, statusCode: number, data?: any) {
    super(message)
    this.name = 'RequestError'
    this.statusCode = statusCode
    this.data = data
  }
}

type Fulfilled<T> = (value: T) => T | Promise<T>
type Rejected = (error: any) => any

class InterceptorManager<T> {
  handlers: Array<{ fulfilled: Fulfilled<T>; rejected?: Rejected }> = []

  use(fulfilled: Fulfilled<T>, rejected?: Rejected): number {
    this.handlers.push({ fulfilled, rejected })
    return this.handlers.length - 1
  }

  eject(id: number): void {
    this.handlers.splice(id, 1)
  }
}

export const interceptors = {
  request: new InterceptorManager<RequestOptions>(),
  response: new InterceptorManager<RequestResult>()
}

function inWhiteList(url: string): boolean {
  const list = getConfig().authWhiteList || []
  return list.some((item) => url.indexOf(item) >= 0)
}

function applyAuthHeader(options: RequestOptions): RequestOptions {
  if (options.skipAuth || inWhiteList(options.url)) return options
  const token = getToken()
  if (!token) return options
  const cfg = getConfig()
  const header = { ...(options.header || {}) }
  if (!header[cfg.tokenHeader]) {
    header[cfg.tokenHeader] = `${cfg.tokenPrefix}${token}`
  }
  return { ...options, header }
}

function shouldMock(url: string): boolean {
  const cfg = getConfig()
  if (!cfg.enableBuiltinMock) return false
  return /api\.example\.com|mock\.local/i.test(cfg.baseURL) || /api\.example\.com|mock\.local/i.test(url)
}

function mockResponse(options: RequestOptions): RequestResult {
  const path = options.url.replace(/^https?:\/\/[^/]+/i, '')
  const token = (options.header || {})[getConfig().tokenHeader] || ''

  if (path.indexOf('/auth/login') >= 0) {
    const role = (options.data && options.data.profile) || 'user'
    const isAdmin = role === 'admin'
    return {
      statusCode: 200,
      header: {},
      data: {
        code: 0,
        message: 'ok',
        data: {
          token: isAdmin ? 'mock-token-admin-001' : 'mock-token-user-001',
          user: {
            id: isAdmin ? 'u_9001' : 'u_1001',
            name: isAdmin ? '管理员' : '普通用户',
            role: isAdmin ? 'admin' : 'user'
          },
          roles: isAdmin ? ['user', 'admin'] : ['user'],
          permissions: isAdmin
            ? ['order:view', 'order:edit', 'order:delete', 'profile:edit', 'image:upload', 'user:manage', 'secret:view']
            : ['order:view', 'profile:edit', 'image:upload']
        }
      }
    }
  }

  if (path.indexOf('/public/') >= 0 || path.indexOf('/ping') >= 0) {
    return {
      statusCode: 200,
      header: {},
      data: { code: 0, message: 'pong', data: { ts: Date.now(), mock: true } }
    }
  }

  if (path.indexOf('/auth/401') >= 0) {
    return { statusCode: 401, header: {}, data: { code: 401, message: '未登录或登录已过期' } }
  }

  if (!token) {
    return { statusCode: 401, header: {}, data: { code: 401, message: '缺少 Authorization' } }
  }

  if (path.indexOf('/user/profile') >= 0) {
    return {
      statusCode: 200,
      header: {},
      data: {
        code: 0,
        message: 'ok',
        data: {
          id: token.indexOf('admin') >= 0 ? 'u_9001' : 'u_1001',
          name: token.indexOf('admin') >= 0 ? '管理员' : '普通用户',
          tokenPreview: token.slice(0, 18) + '...'
        }
      }
    }
  }

  return {
    statusCode: 200,
    header: {},
    data: { code: 0, message: 'ok', data: { echo: options.data || null, path, method: options.method } }
  }
}

async function runRequestInterceptors(options: RequestOptions): Promise<RequestOptions> {
  let current = options
  for (let i = 0; i < interceptors.request.handlers.length; i++) {
    const h = interceptors.request.handlers[i]
    current = await h.fulfilled(current)
  }
  return current
}

async function runResponseInterceptors(result: RequestResult): Promise<RequestResult> {
  let current = result
  for (let i = 0; i < interceptors.response.handlers.length; i++) {
    const h = interceptors.response.handlers[i]
    current = await h.fulfilled(current)
  }
  return current
}

function nativeRequest(options: RequestOptions, url: string): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header || {},
      timeout: options.timeout || 15000,
      success: (res) => {
        resolve({
          data: res.data,
          statusCode: res.statusCode,
          header: res.header || {}
        })
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 带鉴权拦截的请求封装。
 *
 * 1. 自动拼接 baseURL
 * 2. 非白名单请求附加 token
 * 3. 业务可通过 interceptors.request / response.use 继续插入
 * 4. 401 触发 triggerUnauthorized
 * 5. enableBuiltinMock + example.com 时走内置 mock；Demo 默认连 @selyla http://127.0.0.1:8787
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  const showError = options.showError !== false
  let prepared: RequestOptions = {
    method: 'GET',
    header: { 'Content-Type': 'application/json' },
    ...options
  }

  prepared = applyAuthHeader(prepared)
  prepared = await runRequestInterceptors(prepared)

  const url = resolveURL(prepared.url)

  let result: RequestResult
  try {
    if (shouldMock(url)) {
      result = mockResponse({ ...prepared, url })
    } else {
      result = await nativeRequest(prepared, url)
    }
    result = await runResponseInterceptors(result)
  } catch (err: any) {
    if (showError) wx.showToast({ title: '网络异常', icon: 'none' })
    throw new RequestError(err && err.errMsg ? err.errMsg : '网络异常', 0, err)
  }

  if (result.statusCode === getConfig().unauthorizedCode) {
    triggerUnauthorized()
    const msg = (result.data && (result.data.message || result.data.msg)) || '请先登录'
    if (showError) wx.showToast({ title: msg, icon: 'none' })
    throw new RequestError(msg, result.statusCode, result.data)
  }

  if (result.statusCode < 200 || result.statusCode >= 300) {
    const msg = (result.data && (result.data.message || result.data.msg)) || `请求失败 (${result.statusCode})`
    if (showError) wx.showToast({ title: msg, icon: 'none' })
    throw new RequestError(msg, result.statusCode, result.data)
  }

  return result.data as T
}

export function get<T = any>(url: string, data?: any, extra?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'GET', data, ...extra })
}

export function post<T = any>(url: string, data?: any, extra?: Partial<RequestOptions>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...extra })
}
