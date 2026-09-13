import { initKit } from './utils/index'
import { SELYLA_MOCK } from './config/index'

App({
  globalData: {
    userInfo: null
  },
  onLaunch() {
    /**
     * Demo 默认对接 @selyla mock-api（http://127.0.0.1:8787）。
     * 启动：cd mock-api && uvicorn app.main:app --host 0.0.0.0 --port 8787
     *
     * 无 mock 服务时改回内置 mock：
     *   initKit({ baseURL: 'https://api.example.com', enableBuiltinMock: true })
     *
     * 微信开发者工具请勾选「不校验合法域名」（project.config.json 已 urlCheck: false）。
     */
    initKit({
      baseURL: SELYLA_MOCK.baseURL,
      enableBuiltinMock: SELYLA_MOCK.enableBuiltinMock
    })
  }
})
