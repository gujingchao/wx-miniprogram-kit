/**
 * Lightweight WeChat miniprogram typings used by this kit.
 * Replace with `miniprogram-api-typings` in consuming apps if you need the full API surface.
 */
declare namespace WechatMiniprogram {
  interface UserInfo {
    nickName: string
    avatarUrl: string
  }

  interface ImageFile {
    path: string
    size: number
    width?: number
    height?: number
  }

  interface ChooseImageSuccess {
    tempFilePaths: string[]
    tempFiles: ImageFile[]
  }

  interface ChooseMediaFile {
    tempFilePath: string
    size: number
    fileType: string
    width?: number
    height?: number
  }

  interface ChooseMediaSuccess {
    tempFiles: ChooseMediaFile[]
    type: string
  }

  interface GetImageInfoSuccess {
    width: number
    height: number
    path: string
    type?: string
    orientation?: string
  }

  interface CompressImageSuccess {
    tempFilePath: string
  }

  interface GetFileInfoSuccess {
    size: number
    digest?: string
  }

  interface RequestSuccess {
    data: any
    statusCode: number
    header: Record<string, string>
    cookies?: string[]
  }

  interface UploadFileSuccess {
    data: string
    statusCode: number
  }

  interface CanvasToTempFilePathSuccess {
    tempFilePath: string
  }

  interface OffscreenCanvas {
    width: number
    height: number
    getContext(type: string): any
    createImage(): {
      src: string
      width: number
      height: number
      onload: (() => void) | null
      onerror: ((err?: any) => void) | null
    }
  }
}

interface WxStatic {
  request(opts: {
    url: string
    method?: string
    data?: any
    header?: Record<string, string>
    timeout?: number
    success?: (res: WechatMiniprogram.RequestSuccess) => void
    fail?: (err: any) => void
    complete?: () => void
  }): void

  uploadFile(opts: {
    url: string
    filePath: string
    name: string
    header?: Record<string, string>
    formData?: Record<string, any>
    success?: (res: WechatMiniprogram.UploadFileSuccess) => void
    fail?: (err: any) => void
  }): void

  chooseImage(opts: {
    count?: number
    sizeType?: Array<'original' | 'compressed'>
    sourceType?: Array<'album' | 'camera'>
    success?: (res: WechatMiniprogram.ChooseImageSuccess) => void
    fail?: (err: any) => void
  }): void

  chooseMedia(opts: {
    count?: number
    mediaType?: Array<'image' | 'video' | 'mix'>
    sourceType?: Array<'album' | 'camera'>
    sizeType?: Array<'original' | 'compressed'>
    success?: (res: WechatMiniprogram.ChooseMediaSuccess) => void
    fail?: (err: any) => void
  }): void

  compressImage(opts: {
    src: string
    quality?: number
    compressedWidth?: number
    compressedHeight?: number
    success?: (res: WechatMiniprogram.CompressImageSuccess) => void
    fail?: (err: any) => void
  }): void

  getImageInfo(opts: {
    src: string
    success?: (res: WechatMiniprogram.GetImageInfoSuccess) => void
    fail?: (err: any) => void
  }): void

  getFileInfo(opts: {
    filePath: string
    success?: (res: WechatMiniprogram.GetFileInfoSuccess) => void
    fail?: (err: any) => void
  }): void

  previewImage(opts: {
    urls: string[]
    current?: string
    fail?: (err: any) => void
  }): void

  createOffscreenCanvas(opts: { type: string; width: number; height: number }): WechatMiniprogram.OffscreenCanvas

  canvasToTempFilePath(opts: {
    canvas?: any
    canvasId?: string
    fileType?: 'png' | 'jpg'
    quality?: number
    destWidth?: number
    destHeight?: number
    success?: (res: WechatMiniprogram.CanvasToTempFilePathSuccess) => void
    fail?: (err: any) => void
  }): void

  getStorageSync(key: string): any
  setStorageSync(key: string, data: any): void
  removeStorageSync(key: string): void
  clearStorageSync(): void

  showToast(opts: { title: string; icon?: 'success' | 'error' | 'loading' | 'none'; duration?: number }): void
  showLoading(opts: { title: string; mask?: boolean }): void
  hideLoading(): void
  showModal(opts: {
    title?: string
    content?: string
    showCancel?: boolean
    confirmText?: string
    cancelText?: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
  }): void

  navigateTo(opts: { url: string; fail?: (err: any) => void }): void
  redirectTo(opts: { url: string; fail?: (err: any) => void }): void
  reLaunch(opts: { url: string; fail?: (err: any) => void }): void
  navigateBack(opts?: { delta?: number }): void
  switchTab(opts: { url: string }): void
}

declare const wx: WxStatic

declare function App(options: any): void
declare function Page(options: any): void
declare function Component(options: any): void
declare function Behavior(options: any): any
declare function getApp<T = IAppOption>(): T
declare function getCurrentPages(): any[]

declare const console: {
  log(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
  info(...args: any[]): void
}
