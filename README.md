# wx-miniprogram-kit

开源微信小程序组件库。原生 + TypeScript。

| 目录 | 说明 |
| --- | --- |
| `miniprogram/components` | 组件（wayly）：`wk-empty` / `wk-skeleton` / `wk-form` / `wk-uploader` / `wk-permission-button` / `wk-page-guard` |
| `miniprogram/pages` | 示例页 |
| `docs/` | 接入文档 |
| `packages/create-wx-kit` | 把组件拷进已有小程序的脚手架 |

计划仓库：`https://github.com/gujingchao/wx-miniprogram-kit`（验收后再建公开仓）。

## 快速接入已有小程序

```bash
npm install
npm run create -- /path/to/your-miniprogram
```

默认把 `miniprogram/components` 下的组件拷到目标项目的 `components/wx-kit/`。

指定组件：

```bash
npm run create -- /path/to/your-miniprogram --only empty,skeleton,guard
```

## 构建

```bash
npm run build
```

整理可发布的 `dist/components`。

## 文档

- [接入指南](docs/getting-started.md)
- [组件清单](docs/components.md)
- [脚手架](docs/scaffold.md)

## 开发

```bash
npm test
npm run ci
```

CI：`.github/workflows/ci.yml`（脚手架测试 + 构建 + mock-api）。

## 本地 Mock / 云函数脚手架

- [`mock-api/`](mock-api/) — FastAPI 本地联调（默认端口 **8787**）。小程序侧：`setConfig({ baseURL: 'http://127.0.0.1:8787', enableBuiltinMock: false })`
- [`cloudfunctions/`](cloudfunctions/) — 微信云开发风格 stub（`login` / `upload` / `ping`）；本地 Demo 请优先用 `mock-api/`

详见 [mock-api/README.md](mock-api/README.md)。

## License

MIT
