# mock-api

Local FastAPI mock server for `wx-miniprogram-kit`. Matches the client contract in `miniprogram/utils/request.ts`, `auth.ts`, `config/index.ts`, and `wk-uploader`.

Default listen port: **8787**.

## Setup & run

```bash
cd mock-api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --host 0.0.0.0 --port 8787 --reload
```

Or with the requirements file:

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8787 --reload
```

## Tests

```bash
cd mock-api
source .venv/bin/activate
pytest -q
```

## Endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/ping` | no | `{ code:0, message:"pong", data:{ ts, mock:true } }` |
| GET | `/public/info` | no | public ok payload |
| POST | `/auth/login` | no | body `{ "profile": "user"\|"admin" }` → token/user/roles/permissions |
| GET | `/auth/401` | — | always HTTP 401 |
| GET | `/user/profile` | Bearer | user by token |
| POST | `/upload` | Bearer | multipart field `file` → `data.url` |
| GET | `/health` | no | `{ status:"ok" }` |

Tokens: `mock-token-user-001` / `mock-token-admin-001`  
Header: `Authorization: Bearer <token>`  
Envelope: `{ code, message, data }` (except `/health`)

## Connect from miniprogram

In `app.onLaunch` (or before first request), point the kit at this server and disable the builtin client mock:

```ts
import { setConfig } from './config/index'

setConfig({
  baseURL: 'http://127.0.0.1:8787',
  enableBuiltinMock: false,
})
```

Uploader: set `action` to `/upload` (relative to `baseURL`). The response shape is `{ code, message, data: { url, size, name } }` so `wk-uploader` can read `body.data.url`.

> WeChat DevTools may require “不校验合法域名” for local HTTP during development.
