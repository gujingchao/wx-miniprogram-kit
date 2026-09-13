export type RuleType = 'string' | 'number' | 'mobile' | 'email' | 'idcard' | 'url'

export interface Rule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  len?: number
  pattern?: string
  type?: RuleType
  whitespace?: boolean
  /** 自定义校验：返回 true 通过，返回 string 作为错误文案 */
  validator?: (value: any, rule: Rule) => boolean | string | Promise<boolean | string>
}

export interface FieldRules {
  [prop: string]: Rule[]
}

export interface ValidateError {
  prop: string
  message: string
}

export interface FieldResult {
  valid: boolean
  message: string
}

const PATTERNS: Record<string, RegExp> = {
  mobile: /^1[3-9]\d{9}$/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  idcard: /(^\d{15}$)|(^\d{17}[\dXx]$)/,
  url: /^https?:\/\/[^\s]+$/i
}

function isEmpty(value: any): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function asString(value: any): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

function defaultMessage(rule: Rule, fallback: string): string {
  return rule.message || fallback
}

export async function validateField(value: any, rules: Rule[] = []): Promise<FieldResult> {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (rule.required && isEmpty(value)) {
      return { valid: false, message: defaultMessage(rule, '此项为必填') }
    }
    if (isEmpty(value) && !rule.required && !rule.validator) {
      continue
    }
    const str = asString(value)
    if (rule.whitespace && typeof value === 'string' && str.trim() === '') {
      return { valid: false, message: defaultMessage(rule, '不能为空白字符') }
    }
    if (rule.len !== undefined && str.length !== rule.len) {
      return { valid: false, message: defaultMessage(rule, `长度需为 ${rule.len} 位`) }
    }
    if (rule.min !== undefined) {
      if (typeof value === 'number') {
        if (value < rule.min) return { valid: false, message: defaultMessage(rule, `不能小于 ${rule.min}`) }
      } else if (str.length < rule.min) {
        return { valid: false, message: defaultMessage(rule, `至少 ${rule.min} 个字符`) }
      }
    }
    if (rule.max !== undefined) {
      if (typeof value === 'number') {
        if (value > rule.max) return { valid: false, message: defaultMessage(rule, `不能大于 ${rule.max}`) }
      } else if (str.length > rule.max) {
        return { valid: false, message: defaultMessage(rule, `最多 ${rule.max} 个字符`) }
      }
    }
    if (rule.pattern) {
      let re: RegExp
      try {
        re = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : (rule.pattern as RegExp)
      } catch (e) {
        return { valid: false, message: '校验规则错误' }
      }
      if (!re.test(str)) {
        return { valid: false, message: defaultMessage(rule, '格式不正确') }
      }
    }
    if (rule.type && rule.type !== 'string' && rule.type !== 'number') {
      const re = PATTERNS[rule.type]
      if (re && !re.test(str)) {
        const labels: Record<string, string> = {
          mobile: '请输入正确的手机号',
          email: '请输入正确的邮箱',
          idcard: '请输入正确的身份证号',
          url: '请输入正确的 URL'
        }
        return { valid: false, message: defaultMessage(rule, labels[rule.type] || '格式不正确') }
      }
    }
    if (rule.type === 'number' && value !== '' && value !== undefined && value !== null) {
      if (Number.isNaN(Number(value))) {
        return { valid: false, message: defaultMessage(rule, '请输入数字') }
      }
    }
    if (rule.validator) {
      const ret = await rule.validator(value, rule)
      if (ret === true || ret === undefined) continue
      if (ret === false) return { valid: false, message: defaultMessage(rule, '校验未通过') }
      return { valid: false, message: String(ret) }
    }
  }
  return { valid: true, message: '' }
}

export async function validateForm(
  model: Record<string, any>,
  rulesMap: FieldRules
): Promise<{ valid: boolean; errors: Record<string, string>; list: ValidateError[] }> {
  const errors: Record<string, string> = {}
  const list: ValidateError[] = []
  const keys = Object.keys(rulesMap || {})
  for (let i = 0; i < keys.length; i++) {
    const prop = keys[i]
    const result = await validateField(model ? model[prop] : undefined, rulesMap[prop])
    if (!result.valid) {
      errors[prop] = result.message
      list.push({ prop, message: result.message })
    }
  }
  return { valid: list.length === 0, errors, list }
}

export const builtinPatterns = PATTERNS
