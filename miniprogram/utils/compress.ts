/**
 * 图片压缩。
 *
 * 主路径：wx.compressImage（基础库 2.4.0+；compressedWidth/Height 需 2.26.0+）
 * 回退：wx.createOffscreenCanvas 2d 按比例缩放后再走 compressImage。
 *
 * 典型用法：
 *   const out = await compressImage(tempFilePath, { quality: 70, maxWidth: 1280, maxSizeKB: 200 })
 */

export interface CompressOptions {
  /** 0–100，默认 80 */
  quality?: number
  /** 最长边限制，默认 1920 */
  maxWidth?: number
  maxHeight?: number
  /** 目标体积上限（KB）。超限会降 quality 重试，最多 3 次 */
  maxSizeKB?: number
  /**
   * prefer: 优先 compressImage
   * canvas: 强制离屏 canvas 缩放后再压缩
   */
  engine?: 'prefer' | 'canvas'
}

export interface CompressResult {
  tempFilePath: string
  width: number
  height: number
  size: number
  quality: number
  from: 'compressImage' | 'canvas' | 'original'
}

function getImageInfo(src: string): Promise<WechatMiniprogram.GetImageInfoSuccess> {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: resolve,
      fail: reject
    })
  })
}

function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    wx.getFileInfo({
      filePath,
      success: (res) => resolve(res.size || 0),
      fail: () => resolve(0)
    })
  })
}

function runCompressImage(
  src: string,
  quality: number,
  width?: number,
  height?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: any = { src, quality }
    if (width) payload.compressedWidth = width
    if (height) payload.compressedHeight = height
    wx.compressImage({
      ...payload,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    })
  })
}

function fitSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  }
}

/**
 * 离屏 canvas 缩放。部分基础库 / 真机对 createOffscreenCanvas 支持不一，
 * 失败时由上层回退到 compressImage / 原图。
 */
async function scaleWithOffscreenCanvas(
  src: string,
  width: number,
  height: number
): Promise<string> {
  if (typeof wx.createOffscreenCanvas !== 'function') {
    throw new Error('createOffscreenCanvas unavailable')
  }
  const canvas = wx.createOffscreenCanvas({ type: '2d', width, height })
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof canvas.createImage !== 'function') {
    throw new Error('2d context unavailable')
  }
  const img = canvas.createImage()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = (err: any) => reject(err || new Error('image load failed'))
    img.src = src
  })
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      fileType: 'jpg',
      quality: 0.9,
      destWidth: width,
      destHeight: height,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    })
  })
}

export async function compressImage(
  src: string,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const quality = options.quality === undefined ? 80 : Math.min(100, Math.max(10, options.quality))
  const maxWidth = options.maxWidth || 1920
  const maxHeight = options.maxHeight || options.maxWidth || 1920
  const maxSizeKB = options.maxSizeKB
  const engine = options.engine || 'prefer'

  const info = await getImageInfo(src)
  const fitted = fitSize(info.width, info.height, maxWidth, maxHeight)

  let path = src
  let from: CompressResult['from'] = 'original'
  let q = quality

  const tryCanvas = async (): Promise<boolean> => {
    try {
      path = await scaleWithOffscreenCanvas(src, fitted.width, fitted.height)
      from = 'canvas'
      return true
    } catch (err) {
      console.warn('[wk] canvas compress fallback failed', err)
      return false
    }
  }

  if (engine === 'canvas') {
    await tryCanvas()
  }

  const attempt = async (nextQuality: number): Promise<void> => {
    try {
      path = await runCompressImage(
        path,
        nextQuality,
        from === 'canvas' ? undefined : fitted.width,
        from === 'canvas' ? undefined : fitted.height
      )
      from = from === 'canvas' ? 'canvas' : 'compressImage'
    } catch (err) {
      if (from === 'original' && engine === 'prefer') {
        const ok = await tryCanvas()
        if (ok) {
          path = await runCompressImage(path, nextQuality)
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
  }

  try {
    await attempt(q)
  } catch (err) {
    console.warn('[wk] compressImage failed, use original', err)
    path = src
    from = 'original'
  }

  let size = await getFileSize(path)
  let retries = 0
  while (maxSizeKB && size > maxSizeKB * 1024 && retries < 3 && q > 30) {
    q = Math.max(30, q - 15)
    retries += 1
    try {
      await attempt(q)
      size = await getFileSize(path)
    } catch (err) {
      console.warn('[wk] recompress failed', err)
      break
    }
  }

  const finalInfo = await getImageInfo(path).catch(() => ({
    width: fitted.width,
    height: fitted.height,
    path
  }))

  return {
    tempFilePath: path,
    width: finalInfo.width,
    height: finalInfo.height,
    size,
    quality: q,
    from
  }
}

export function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
