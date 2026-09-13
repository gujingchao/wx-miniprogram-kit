export function getStorage<T>(key: string, fallback: T | null = null): T | null {
  try {
    const value = wx.getStorageSync(key)
    if (value === '' || value === undefined || value === null) return fallback
    return value as T
  } catch (err) {
    console.warn('[wk] getStorage failed', key, err)
    return fallback
  }
}

export function setStorage(key: string, value: any): void {
  try {
    wx.setStorageSync(key, value)
  } catch (err) {
    console.warn('[wk] setStorage failed', key, err)
  }
}

export function removeStorage(key: string): void {
  try {
    wx.removeStorageSync(key)
  } catch (err) {
    console.warn('[wk] removeStorage failed', key, err)
  }
}
