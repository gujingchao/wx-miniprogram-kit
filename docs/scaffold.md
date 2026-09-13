# 脚手架

包：`packages/create-wx-kit`

```bash
node packages/create-wx-kit/bin/create-wx-kit.js <target> [--only a,b] [--dry-run]
```

1. 解析目标小程序根目录（需要已存在）
2. 从组件源拷贝到 `target/components/wx-kit/`
3. 源默认是仓库 `miniprogram/components`；没有组件时走包内 fixtures
4. `--dry-run` 只打印路径
