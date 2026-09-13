import { FieldRules, validateField, validateForm } from '../../utils/validator'

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    model: {
      type: Object,
      value: {}
    },
    rules: {
      type: Object,
      value: {}
    },
    labelWidth: {
      type: String,
      value: '168rpx'
    },
    showError: {
      type: Boolean,
      value: true
    }
  },
  relations: {
    '../wk-form-item/index': {
      type: 'descendant',
      linked(this: any, child: any) {
        if (!this._items) this._items = []
        this._items.push(child)
        child.setFormMeta({
          labelWidth: this.properties.labelWidth,
          showError: this.properties.showError
        })
      },
      unlinked(this: any, child: any) {
        this._items = (this._items || []).filter((item: any) => item !== child)
      }
    }
  },
  lifetimes: {
    created() {
      this._items = []
      this._mergedRules = {}
    }
  },
  methods: {
    getModel(): Record<string, any> {
      return (this.properties.model || {}) as Record<string, any>
    },

    /**
     * 合并含函数的规则。Page.data 无法保存 validator 函数，请在 onReady 调用本方法注入。
     */
    mergeRules(rules: FieldRules) {
      this._mergedRules = rules || {}
    },

    getRules(): FieldRules {
      return Object.assign({}, this.properties.rules || {}, this._mergedRules || {})
    },

    async validate(): Promise<{ valid: boolean; errors: Record<string, string>; list: any[] }> {
      const model = this.getModel()
      const rules = this.getRules()
      const result = await validateForm(model, rules)

      const items: any[] = this._items || []
      items.forEach((item) => {
        const prop = item.properties.prop
        if (!prop) return
        item.setError(result.errors[prop] || '')
      })

      this.triggerEvent('validate', result)
      return result
    },

    async validateField(prop: string): Promise<{ valid: boolean; message: string }> {
      const model = this.getModel()
      const rules = this.getRules()[prop] || []
      const result = await validateField(model[prop], rules)
      const items: any[] = this._items || []
      items.forEach((item) => {
        if (item.properties.prop === prop) item.setError(result.valid ? '' : result.message)
      })
      return result
    },

    resetValidation(): void {
      const items: any[] = this._items || []
      items.forEach((item) => item.setError(''))
    }
  }
})
