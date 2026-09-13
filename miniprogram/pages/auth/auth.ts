import { applySession, getToken, getUser, isLoggedIn, logout, mockLogin } from '../../utils/auth'
import { getConfig } from '../../config/index'
import { get, post } from '../../utils/request'
import { getPermissions, getRoles } from '../../utils/permission'
import { loginByApi } from '../../utils/index'

Page({
  data: {
    loggedIn: false,
    token: '',
    userName: '',
    roles: [] as string[],
    permissions: [] as string[],
    logs: [] as string[],
    baseURL: '',
    builtinMock: false
  },
  onShow() {
    this.refreshSession()
  },
  refreshSession() {
    const user = getUser()
    const cfg = getConfig()
    this.setData({
      loggedIn: isLoggedIn(),
      token: getToken(),
      userName: user ? user.name : '',
      roles: getRoles(),
      permissions: getPermissions(),
      baseURL: cfg.baseURL,
      builtinMock: cfg.enableBuiltinMock
    })
  },
  pushLog(line: string) {
    const logs = [line].concat(this.data.logs).slice(0, 8)
    this.setData({ logs })
  },
  async loginProfile(profile: 'user' | 'admin') {
    try {
      const payload = await loginByApi(profile)
      this.refreshSession()
      this.pushLog(`POST /auth/login profile=${profile} → ${payload.token}`)
      wx.showToast({ title: `已登录（${payload.user.name}）`, icon: 'success' })
    } catch (err: any) {
      this.pushLog(`POST /auth/login 失败：${err.message || err}，回退本地 session`)
      const result = mockLogin(profile)
      this.refreshSession()
      wx.showToast({ title: `本地登录（${result.user.name}）`, icon: 'none' })
    }
  },
  onLoginUser() {
    this.loginProfile('user')
  },
  onLoginAdmin() {
    this.loginProfile('admin')
  },
  onLogout() {
    logout()
    this.refreshSession()
    this.pushLog('已退出，token / 权限已清空')
  },
  async onLoginViaRequest() {
    try {
      const res: any = await post('/auth/login', { profile: 'user' }, { skipAuth: true })
      const payload = res.data || res
      applySession(payload)
      this.refreshSession()
      this.pushLog('POST /auth/login 成功（白名单，不附加 token）')
    } catch (err: any) {
      this.pushLog(`登录接口失败：${err.message || err}`)
    }
  },
  async onPing() {
    try {
      const res: any = await get('/ping', undefined, { skipAuth: true })
      this.pushLog(`GET /ping → ${JSON.stringify(res)}`)
    } catch (err: any) {
      this.pushLog(`GET /ping 失败：${err.message || err}`)
    }
  },
  async onPublicInfo() {
    try {
      const res: any = await get('/public/info', undefined, { skipAuth: true })
      this.pushLog(`GET /public/info → ${JSON.stringify(res)}`)
    } catch (err: any) {
      this.pushLog(`GET /public/info 失败：${err.message || err}`)
    }
  },
  async onProfile() {
    try {
      const res: any = await get('/user/profile')
      this.pushLog(`GET /user/profile → ${JSON.stringify(res)}`)
    } catch (err: any) {
      this.pushLog(`GET /user/profile 失败：${err.message || err}`)
    }
  },
  async onForce401() {
    try {
      await get('/auth/401')
    } catch (err: any) {
      this.pushLog(`GET /auth/401 → ${err.message || err}`)
      this.refreshSession()
    }
  }
})
