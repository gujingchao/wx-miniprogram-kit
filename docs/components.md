# 组件清单

约定目录：`miniprogram/components/<name>/`。脚手架按目录名拷贝。

当前与 wayly 对齐：

| 目录 | 用途 |
| --- | --- |
| `wk-empty` | 空态 |
| `wk-skeleton` | 骨架屏 |
| `wk-form` / `wk-form-item` | 表单校验 |
| `wk-uploader` | 图片上传 + 压缩 |
| `wk-permission-button` | 权限按钮 |
| `wk-page-guard` | 页面守卫 |

鉴权拦截在 `miniprogram/utils/auth.ts`。

`--only` 短名：`empty` / `skeleton` / `form` / `form-item` / `upload` / `guard` / `button`。
