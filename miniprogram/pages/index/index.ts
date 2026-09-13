Page({
  data: {
    version: '0.1.0',
    groups: [
      {
        title: '展示',
        items: [
          { name: '空态 Empty', desc: '无数据 / 搜索 / 网络 / 权限', url: '/pages/empty/empty', tag: 'wk-empty' },
          { name: '骨架屏 Skeleton', desc: '列表 / 卡片 / 闪烁加载', url: '/pages/skeleton/skeleton', tag: 'wk-skeleton' }
        ]
      },
      {
        title: '表单与媒体',
        items: [
          { name: '表单校验 Form', desc: '必填、手机号、自定义规则', url: '/pages/form/form', tag: 'wk-form' },
          { name: '图片上传压缩', desc: '选择、压缩、预览、可插拔上传', url: '/pages/uploader/uploader', tag: 'wk-uploader' }
        ]
      },
      {
        title: '鉴权与权限',
        items: [
          { name: '鉴权拦截 Auth', desc: 'Token、请求拦截、401、Mock 登录', url: '/pages/auth/auth', tag: 'request' },
          { name: '权限按钮 / 页面守卫', desc: '按权限显隐按钮、拦截页面', url: '/pages/permission/permission', tag: 'guard' }
        ]
      }
    ]
  },
  onOpen(e: any) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  }
})
