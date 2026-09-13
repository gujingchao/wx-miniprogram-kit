Page({
  data: {
    current: 'default',
    types: [
      { key: 'default', label: '默认' },
      { key: 'search', label: '搜索' },
      { key: 'network', label: '网络' },
      { key: 'error', label: '失败' },
      { key: 'permission', label: '权限' },
      { key: 'data', label: '数据' }
    ]
  },
  onSwitch(e: any) {
    this.setData({ current: e.currentTarget.dataset.key })
  },
  onRetry() {
    wx.showToast({ title: '点击了操作按钮', icon: 'none' })
  }
})
