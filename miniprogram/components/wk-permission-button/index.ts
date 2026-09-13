import { checkPermission, hasRole, PermMode } from '../../utils/permission'
import { getStorage } from '../../utils/storage'
import { getConfig } from '../../config/index'

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    permission: { type: null, value: '' },
    role: { type: null, value: '' },
    mode: { type: String, value: 'every' },
    /** hide | disable */
    action: { type: String, value: 'hide' },
    text: { type: String, value: '' },
    type: { type: String, value: 'primary' },
    size: { type: String, value: 'default' },
    requireLogin: { type: Boolean, value: false }
  },
  data: {
    visible: true,
    disabled: false
  },
  lifetimes: {
    attached() {
      this.refresh()
    }
  },
  pageLifetimes: {
    show() {
      this.refresh()
    }
  },
  methods: {
    isLoggedIn(): boolean {
      return !!(getStorage<string>(getConfig().tokenKey, '') || '')
    },
    refresh() {
      const mode = (this.properties.mode || 'every') as PermMode
      const permOk = checkPermission(this.properties.permission, mode)
      const roleOk = hasRole(this.properties.role, mode)
      const loginOk = this.properties.requireLogin ? this.isLoggedIn() : true
      const allowed = permOk && roleOk && loginOk
      if (allowed) {
        this.setData({ visible: true, disabled: false })
        return
      }
      if (this.properties.action === 'disable') {
        this.setData({ visible: true, disabled: true })
      } else {
        this.setData({ visible: false, disabled: true })
      }
    },
    onTap() {
      if (this.data.disabled) {
        wx.showToast({ title: '暂无权限', icon: 'none' })
        this.triggerEvent('denied')
        return
      }
      this.triggerEvent('click')
    }
  }
})
