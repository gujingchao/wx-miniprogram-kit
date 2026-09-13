# 接入指南

适合已经有微信小程序的项目。

## 1. 拷贝组件

```bash
npm install
npm run create -- /path/to/your-miniprogram
```

目标项目会出现：

```
your-miniprogram/components/wx-kit/<component>/
```

## 2. 在页面里引用

页面 JSON：

```json
{
  "usingComponents": {
    "wk-empty": "/components/wx-kit/wk-empty/index",
    "wk-skeleton": "/components/wx-kit/wk-skeleton/index",
    "wk-page-guard": "/components/wx-kit/wk-page-guard/index"
  }
}
```

WXML：

```xml
<wk-empty wx:if="{{!list.length}}" title="暂无数据" />
<wk-skeleton wx:if="{{loading}}" rows="3" />
<wk-page-guard require="task:write">
  <button>新建任务</button>
</wk-page-guard>
```

## 3. 鉴权拦截

在 `app.ts` 里接登录态，或换成自己的 token。详见 [组件清单](components.md)。

## 本地示例

在微信开发者工具中打开 `miniprogram/`。
