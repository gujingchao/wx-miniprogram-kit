import { mockLogin, logout, isLoggedIn, getUser } from '../../utils/auth'
import { getPermissions, getRoles } from '../../utils/permission'
import { loginByApi } from '../../utils/index'

Page({
  data: {
    loggedIn: false,
    userName: '',
    roles: [] as string[],
    permissions: [] as string[]
  },
  onShow() {
    this.refresh()
  },
  refresh() {
    const user = getUser()
    this.setData({
      loggedIn: isLoggedIn(),
      userName: user ? user.name : '未登录',
      roles: getRoles(),
      permissions: getPermissions()
    })
  },
  async switchProfile(profile: 'user' | 'admin') {
    try {
      await loginByApi(profile)
    } catch (e) {
      mockLogin(profile)
    }
    this.refresh()
  },
  onUser() {
    this.switchProfile('user')
  },
  onAdmin() {
    this.switchProfile('admin')
  },
  onLogout() {
    logout()
    this.refresh()
  },
  onClickEdit() {
    wx.showToast({ title: '执行 order:edit', icon: 'none' })
  },
  onClickManage() {
    wx.showToast({ title: '执行 user:manage', icon: 'none' })
  },
  onDenied() {
    wx.showToast({ title: '按钮已禁用（无权限）', icon: 'none' })
  },
  goSecret() {
    wx.navigateTo({ url: '/pages/permission/secret' })
  }
})
