import { formatSize } from '../../utils/compress'
import { getConfig } from '../../config/index'
import { isLoggedIn, getUser, mockLogin } from '../../utils/auth'
import { loginByApi } from '../../utils/index'

Page({
  data: {
    fileList: [] as any[],
    lastCompress: '',
    lastUpload: '',
    quality: 70,
    maxWidth: 1280,
    maxSize: 200,
    action: '/upload',
    loggedIn: false,
    userName: '',
    baseURL: ''
  },
  onShow() {
    const user = getUser()
    this.setData({
      loggedIn: isLoggedIn(),
      userName: user ? user.name : '',
      baseURL: getConfig().baseURL
    })
  },
  async onEnsureLogin() {
    try {
      await loginByApi('user')
    } catch (e) {
      mockLogin('user')
    }
    const user = getUser()
    this.setData({ loggedIn: isLoggedIn(), userName: user ? user.name : '' })
    wx.showToast({ title: '已登录，可上传', icon: 'success' })
  },
  onChange(e: any) {
    this.setData({ fileList: e.detail.fileList || [] })
  },
  onCompress(e: any) {
    const r = e.detail.result
    this.setData({
      lastCompress: `来源 ${r.from} · ${r.width}×${r.height} · ${formatSize(r.size)} · q=${r.quality}`
    })
  },
  onSuccess(e: any) {
    const file = e.detail.file || {}
    this.setData({ lastUpload: file.url || '上传成功' })
  },
  onFail(e: any) {
    wx.showToast({ title: (e.detail.file && e.detail.file.message) || '失败', icon: 'none' })
  }
})
