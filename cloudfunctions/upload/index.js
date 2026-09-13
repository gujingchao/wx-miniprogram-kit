/**
 * 云开发 upload scaffold — returns a mock URL (no real storage).
 * Local demo should prefer mock-api/ POST /upload.
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const name = (event && event.name) || 'upload.bin'
  const size = typeof (event && event.size) === 'number' ? event.size : 0
  return {
    code: 0,
    message: 'ok',
    data: {
      url: `https://mock.local/uploads/${name}`,
      size,
      name
    }
  }
}
