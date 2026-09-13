import { FieldRules, Rule } from '../../utils/validator'

/** 含函数的规则不能放进 Page.data（setData 会丢函数），在 onReady 注入 form.mergeRules */
const extraRules: FieldRules = {
  remark: [
    {
      validator: (value: any) => {
        if (value && String(value).indexOf('测试') >= 0) return '备注不能包含「测试」'
        return true
      }
    }
  ]
}

const serializableRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请填写姓名' },
    { min: 2, max: 12, message: '姓名需 2–12 个字符' }
  ],
  mobile: [
    { required: true, message: '请填写手机号' },
    { type: 'mobile' }
  ],
  email: [{ type: 'email', message: '邮箱格式不正确' }],
  code: [
    { required: true, message: '请填写验证码' },
    { len: 6, message: '验证码为 6 位数字' },
    { pattern: '^\\d{6}$', message: '验证码须为数字' }
  ]
}

Page({
  data: {
    form: {
      name: '',
      mobile: '',
      email: '',
      code: '',
      remark: ''
    },
    rules: serializableRules
  },
  onReady() {
    const form = this.selectComponent('#form')
    if (form && form.mergeRules) form.mergeRules(extraRules)
  },
  onInput(e: any) {
    const prop = e.currentTarget.dataset.prop
    const value = e.detail.value
    this.setData({ [`form.${prop}`]: value })
    const form = this.selectComponent('#form')
    if (form && form.validateField) form.validateField(prop)
  },
  async onSubmit() {
    const form = this.selectComponent('#form')
    if (!form) return
    const result = await form.validate()
    if (!result.valid) {
      wx.showToast({ title: result.list[0].message, icon: 'none' })
      return
    }
    wx.showToast({ title: '校验通过', icon: 'success' })
  },
  onReset() {
    this.setData({
      form: { name: '', mobile: '', email: '', code: '', remark: '' }
    })
    const form = this.selectComponent('#form')
    if (form && form.resetValidation) form.resetValidation()
  }
})
