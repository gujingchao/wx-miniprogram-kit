Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    label: { type: String, value: '' },
    prop: { type: String, value: '' },
    required: { type: Boolean, value: false },
    error: { type: String, value: '' },
    border: { type: Boolean, value: true }
  },
  relations: {
    '../wk-form/index': {
      type: 'ancestor'
    }
  },
  data: {
    innerError: '',
    labelWidth: '168rpx',
    showError: true
  },
  observers: {
    error: function (err: string) {
      if (err !== undefined) this.setData({ innerError: err || '' })
    }
  },
  methods: {
    setFormMeta(meta: { labelWidth: string; showError: boolean }) {
      this.setData({
        labelWidth: meta.labelWidth,
        showError: meta.showError
      })
    },
    setError(message: string) {
      this.setData({ innerError: message || '' })
    }
  }
})
