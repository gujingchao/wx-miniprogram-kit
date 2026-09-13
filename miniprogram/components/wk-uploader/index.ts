import { getConfig, resolveURL } from '../../config/index'
import { getToken, triggerUnauthorized } from '../../utils/auth'
import { compressImage, formatSize } from '../../utils/compress'

export interface UploadFileItem {
  id: string
  path: string
  size: number
  width?: number
  height?: number
  status: 'ready' | 'compressing' | 'uploading' | 'done' | 'fail'
  url?: string
  message?: string
  quality?: number
  from?: string
}

function uid(): string {
  return `f_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    fileList: { type: Array, value: [] },
    count: { type: Number, value: 9 },
    maxSize: { type: Number, value: 2048 },
    quality: { type: Number, value: 80 },
    maxWidth: { type: Number, value: 1280 },
    maxHeight: { type: Number, value: 1280 },
    compressed: { type: Boolean, value: true },
    disabled: { type: Boolean, value: false },
    addText: { type: String, value: '上传图片' },
    sourceType: { type: Array, value: ['album', 'camera'] },
    /**
     * 上传接口路径（相对 baseURL）或完整 URL。
     * 留空则只压缩、不上传，由页面自行处理 change 事件。
     * 对接 @selyla mock：setConfig({ baseURL }) 后把 action 设成 mock 上传路径即可。
     */
    action: { type: String, value: '' },
    name: { type: String, value: 'file' }
  },
  observers: {
    fileList: function (list: UploadFileItem[]) {
      this.setData({ innerList: list || [] })
    }
  },
  data: {
    innerList: [] as UploadFileItem[]
  },
  methods: {
    emitChange(list: UploadFileItem[]) {
      this.setData({ innerList: list })
      this.triggerEvent('change', { fileList: list })
    },

    onChoose() {
      if (this.properties.disabled) return
      const remain = (this.properties.count as number) - (this.data.innerList as UploadFileItem[]).length
      if (remain <= 0) {
        wx.showToast({ title: `最多上传 ${this.properties.count} 张`, icon: 'none' })
        return
      }
      const sourceType = this.properties.sourceType as Array<'album' | 'camera'>
      if (typeof wx.chooseMedia === 'function') {
        wx.chooseMedia({
          count: remain,
          mediaType: ['image'],
          sourceType,
          success: (res) => {
            const paths = (res.tempFiles || []).map((f) => ({
              path: f.tempFilePath,
              size: f.size,
              width: f.width,
              height: f.height
            }))
            this.handleFiles(paths)
          },
          fail: (err) => {
            if (err && String(err.errMsg || '').indexOf('cancel') >= 0) return
            this.chooseImageFallback(remain, sourceType)
          }
        })
      } else {
        this.chooseImageFallback(remain, sourceType)
      }
    },

    chooseImageFallback(remain: number, sourceType: Array<'album' | 'camera'>) {
      wx.chooseImage({
        count: remain,
        sizeType: ['original'],
        sourceType,
        success: (res) => {
          const files = res.tempFiles || []
          const paths = (res.tempFilePaths || []).map((p, i) => ({
            path: p,
            size: files[i] ? files[i].size : 0
          }))
          this.handleFiles(paths)
        }
      })
    },

    async handleFiles(picked: Array<{ path: string; size: number; width?: number; height?: number }>) {
      const maxBytes = (this.properties.maxSize as number) * 1024
      let list = (this.data.innerList as UploadFileItem[]).slice()

      for (let i = 0; i < picked.length; i++) {
        const raw = picked[i]
        if (maxBytes && raw.size > maxBytes && !this.properties.compressed) {
          this.triggerEvent('oversize', { file: raw, maxSize: this.properties.maxSize })
          wx.showToast({ title: `图片超过 ${this.properties.maxSize}KB`, icon: 'none' })
          continue
        }

        const item: UploadFileItem = {
          id: uid(),
          path: raw.path,
          size: raw.size,
          width: raw.width,
          height: raw.height,
          status: this.properties.compressed ? 'compressing' : 'ready'
        }
        list.push(item)
        this.emitChange(list)

        if (this.properties.compressed) {
          try {
            const out = await compressImage(raw.path, {
              quality: this.properties.quality as number,
              maxWidth: this.properties.maxWidth as number,
              maxHeight: this.properties.maxHeight as number,
              maxSizeKB: this.properties.maxSize as number
            })
            item.path = out.tempFilePath
            item.size = out.size
            item.width = out.width
            item.height = out.height
            item.quality = out.quality
            item.from = out.from
            item.status = 'ready'
            this.triggerEvent('compress', { file: item, result: out })
          } catch (err) {
            item.status = 'fail'
            item.message = '压缩失败'
            this.triggerEvent('fail', { file: item, error: err })
          }
          list = list.map((f) => (f.id === item.id ? item : f))
          this.emitChange(list)
        }

        if (this.properties.action && item.status === 'ready') {
          await this.uploadOne(item)
          list = (this.data.innerList as UploadFileItem[]).slice()
        }
      }
    },

    uploadOne(item: UploadFileItem): Promise<void> {
      const action = this.properties.action as string
      if (!action) return Promise.resolve()
      item.status = 'uploading'
      this.emitChange((this.data.innerList as UploadFileItem[]).map((f) => (f.id === item.id ? item : f)))

      const cfg = getConfig()
      const header: Record<string, string> = {}
      const token = getToken()
      if (token) header[cfg.tokenHeader] = `${cfg.tokenPrefix}${token}`

      return new Promise((resolve) => {
        wx.uploadFile({
          url: resolveURL(action),
          filePath: item.path,
          name: this.properties.name as string,
          header,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              item.status = 'done'
              try {
                const body = JSON.parse(res.data)
                item.url = (body && (body.url || (body.data && body.data.url))) || ''
              } catch (e) {
                item.url = res.data
              }
              this.triggerEvent('success', { file: item, data: res.data })
            } else {
              item.status = 'fail'
              item.message = `上传失败 (${res.statusCode})`
              if (res.statusCode === getConfig().unauthorizedCode) {
                triggerUnauthorized()
              }
              this.triggerEvent('fail', { file: item, error: res })
            }
            this.emitChange((this.data.innerList as UploadFileItem[]).map((f) => (f.id === item.id ? item : f)))
            resolve()
          },
          fail: (err) => {
            item.status = 'fail'
            item.message = '上传失败'
            this.triggerEvent('fail', { file: item, error: err })
            this.emitChange((this.data.innerList as UploadFileItem[]).map((f) => (f.id === item.id ? item : f)))
            resolve()
          }
        })
      })
    },

    onPreview(e: any) {
      const index = Number(e.currentTarget.dataset.index)
      const list = this.data.innerList as UploadFileItem[]
      wx.previewImage({
        current: list[index].path,
        urls: list.map((f) => f.path)
      })
    },

    onDelete(e: any) {
      const index = Number(e.currentTarget.dataset.index)
      const list = (this.data.innerList as UploadFileItem[]).slice()
      const removed = list.splice(index, 1)[0]
      this.emitChange(list)
      this.triggerEvent('delete', { file: removed, index })
    },

    formatSize
  }
})
