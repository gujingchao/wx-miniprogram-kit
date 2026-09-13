/**
 * 云开发 ping scaffold — health check.
 * Local demo should prefer mock-api/ GET /ping.
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  return {
    code: 0,
    message: 'pong',
    data: {
      ts: Date.now(),
      mock: true
    }
  }
}
