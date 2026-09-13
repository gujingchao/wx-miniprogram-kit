import { getConfig } from '../../config/index'
import { guardPage, GuardOptions } from '../../utils/permission'

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    requireLogin: { type: Boolean, value: true },
    permission: { type: null, value: '' },
    role: { type: null, value: '' },
    mode: { type: String, value: 'every' },
    /** 组件内拦截时不自动跳转，展示空态；需要跳转可设 autoRedirect */
    autoRedirect: { type: Boolean, value: false },
    title: { type: String, value: '' },
    description: { type: String, value: '' }
  },
  data: {
    allowed: false,
    reason: 'unauthenticated',
    checked: false
  },
  lifetimes: {
    attached() {
      this.evaluate()
    }
  },
  pageLifetimes: {
    show() {
      this.evaluate()
    }
  },
  methods: {
    evaluate() {
      const options: GuardOptions = {
        requireLogin: this.properties.requireLogin,
        permission: this.properties.permission || undefined,
        role: this.properties.role || undefined,
        mode: this.properties.mode,
        autoRedirect: this.properties.autoRedirect
      }
      const result = guardPage(options)
      this.setData({
        allowed: result.ok,
        reason: result.reason,
        checked: true
      })
      this.triggerEvent('check', result)
    },
    onAction() {
      if (this.data.reason === 'unauthenticated') {
        wx.navigateTo({ url: getConfig().loginPath })
      } else {
        wx.navigateBack({ delta: 1 })
      }
    }
  }
})
