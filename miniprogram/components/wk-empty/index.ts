Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    type: {
      type: String,
      value: 'default'
    },
    title: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    },
    image: {
      type: String,
      value: ''
    },
    actionText: {
      type: String,
      value: ''
    },
    showAction: {
      type: Boolean,
      value: false
    }
  },
  data: {
    presetTitle: '',
    presetDesc: ''
  },
  observers: {
    type: function (t: string) {
      this.applyPreset(t)
    }
  },
  lifetimes: {
    attached() {
      this.applyPreset(this.properties.type)
    }
  },
  methods: {
    applyPreset(t: string) {
      const map: Record<string, { title: string; desc: string }> = {
        default: { title: '暂无数据', desc: '这里还没有任何内容' },
        search: { title: '未找到结果', desc: '换个关键词试试吧' },
        network: { title: '网络异常', desc: '请检查网络后重试' },
        error: { title: '加载失败', desc: '出了点问题，请稍后重试' },
        permission: { title: '暂无权限', desc: '请联系管理员开通后访问' },
        data: { title: '空空如也', desc: '还没有相关记录' }
      }
      const preset = map[t] || map.default
      this.setData({ presetTitle: preset.title, presetDesc: preset.desc })
    },
    onAction() {
      this.triggerEvent('action')
    }
  }
})
