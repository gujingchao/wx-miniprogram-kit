"""
Local FastAPI mock matching miniprogram client contract
(request.ts / auth.ts / config / wk-uploader).
"""

from __future__ import annotations

import time
from typing import Any, Literal, Optional

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Mirrors PROFILE_MAP in miniprogram/utils/auth.ts
PROFILE_MAP: dict[str, dict[str, Any]] = {
    "user": {
        "token": "mock-token-user-001",
        "user": {
            "id": "u_1001",
            "name": "普通用户",
            "avatar": "",
            "role": "user",
        },
        "roles": ["user"],
        "permissions": ["order:view", "profile:edit", "image:upload"],
    },
    "admin": {
        "token": "mock-token-admin-001",
        "user": {
            "id": "u_9001",
            "name": "管理员",
            "avatar": "",
            "role": "admin",
        },
        "roles": ["user", "admin"],
        "permissions": [
            "order:view",
            "order:edit",
            "order:delete",
            "profile:edit",
            "image:upload",
            "user:manage",
            "secret:view",
        ],
    },
}

TOKEN_TO_PROFILE = {
    "mock-token-user-001": "user",
    "mock-token-admin-001": "admin",
}

app = FastAPI(title="wx-miniprogram-kit mock-api", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ok(data: Any = None, message: str = "ok") -> dict[str, Any]:
    return {"code": 0, "message": message, "data": data}


def unauthorized(message: str = "未登录或登录已过期") -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"code": 401, "message": message},
    )


def parse_bearer(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.strip().split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


def require_token(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> str:
    token = parse_bearer(authorization)
    if not token or token not in TOKEN_TO_PROFILE:
        raise HTTPException(
            status_code=401,
            detail={"code": 401, "message": "未登录或登录已过期"},
        )
    return token


@app.exception_handler(HTTPException)
async def http_exception_handler(_request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": str(exc.detail)},
    )


class LoginBody(BaseModel):
    profile: Literal["user", "admin"] = Field(default="user")


@app.get("/ping")
def ping():
    return ok({"ts": int(time.time() * 1000), "mock": True}, message="pong")


@app.get("/public/info")
def public_info():
    return ok(
        {
            "name": "wx-miniprogram-kit mock-api",
            "public": True,
            "ts": int(time.time() * 1000),
        },
        message="ok",
    )


@app.post("/auth/login")
def auth_login(body: LoginBody):
    result = PROFILE_MAP[body.profile]
    return ok(result, message="ok")


@app.get("/auth/401")
def auth_401():
    return unauthorized("未登录或登录已过期")


@app.get("/user/profile")
def user_profile(token: str = Depends(require_token)):
    profile_key = TOKEN_TO_PROFILE[token]
    user = dict(PROFILE_MAP[profile_key]["user"])
    user["tokenPreview"] = token[:18] + "..."
    return ok(user, message="ok")


@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    token: str = Depends(require_token),
):
    # Any valid mock token is accepted (image:upload conceptually required).
    _ = token
    filename = file.filename or "upload.bin"
    content = await file.read()
    size = len(content)
    return ok(
        {
            "url": f"https://mock.local/uploads/{filename}",
            "size": size,
            "name": filename,
        },
        message="ok",
    )


@app.get("/health")
def health():
    return {"status": "ok"}
