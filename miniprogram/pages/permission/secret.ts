import { guardPage } from '../../utils/permission'

Page({
  data: {
    passed: false
  },
  onShow() {
    const result = guardPage({
      requireLogin: true,
      permission: 'secret:view',
      autoRedirect: false
    })
    this.setData({ passed: result.ok })
  }
})
