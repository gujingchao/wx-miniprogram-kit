/**
 * 云开发 login scaffold — mirrors PROFILE_MAP in miniprogram/utils/auth.ts.
 * Local demo should prefer mock-api/ (FastAPI on :8787).
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const PROFILE_MAP = {
  user: {
    token: 'mock-token-user-001',
    user: {
      id: 'u_1001',
      name: '普通用户',
      avatar: '',
      role: 'user'
    },
    roles: ['user'],
    permissions: ['order:view', 'profile:edit', 'image:upload']
  },
  admin: {
    token: 'mock-token-admin-001',
    user: {
      id: 'u_9001',
      name: '管理员',
      avatar: '',
      role: 'admin'
    },
    roles: ['user', 'admin'],
    permissions: [
      'order:view',
      'order:edit',
      'order:delete',
      'profile:edit',
      'image:upload',
      'user:manage',
      'secret:view'
    ]
  }
}

exports.main = async (event) => {
  const profile = event.profile === 'admin' ? 'admin' : 'user'
  return {
    code: 0,
    message: 'ok',
    data: PROFILE_MAP[profile]
  }
}
