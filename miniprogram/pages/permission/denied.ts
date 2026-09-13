Page({
  goLogin() {
    wx.navigateTo({ url: '/pages/auth/auth' })
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
