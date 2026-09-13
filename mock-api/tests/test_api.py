"""API contract tests for mock-api."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import PROFILE_MAP, app

client = TestClient(app)

USER_TOKEN = "mock-token-user-001"
ADMIN_TOKEN = "mock-token-admin-001"


def test_ping():
    res = client.get("/ping")
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    assert body["message"] == "pong"
    assert body["data"]["mock"] is True
    assert "ts" in body["data"]


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_public_info():
    res = client.get("/public/info")
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    assert body["data"]["public"] is True


def test_login_user():
    res = client.post("/auth/login", json={"profile": "user"})
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    data = body["data"]
    expected = PROFILE_MAP["user"]
    assert data["token"] == expected["token"]
    assert data["user"] == expected["user"]
    assert data["roles"] == expected["roles"]
    assert data["permissions"] == expected["permissions"]
    assert data["user"]["avatar"] == ""


def test_login_admin():
    res = client.post("/auth/login", json={"profile": "admin"})
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    data = body["data"]
    expected = PROFILE_MAP["admin"]
    assert data["token"] == expected["token"]
    assert data["user"] == expected["user"]
    assert data["roles"] == expected["roles"]
    assert data["permissions"] == expected["permissions"]
    assert data["user"]["avatar"] == ""


def test_auth_401_endpoint():
    res = client.get("/auth/401")
    assert res.status_code == 401
    body = res.json()
    assert body["code"] == 401
    assert body["message"] == "未登录或登录已过期"


def test_profile_without_token():
    res = client.get("/user/profile")
    assert res.status_code == 401
    body = res.json()
    assert body["code"] == 401


def test_profile_with_user_token():
    res = client.get(
        "/user/profile",
        headers={"Authorization": f"Bearer {USER_TOKEN}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    assert body["data"]["id"] == "u_1001"
    assert body["data"]["name"] == "普通用户"
    assert body["data"]["avatar"] == ""


def test_profile_with_admin_token():
    res = client.get(
        "/user/profile",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    assert body["data"]["id"] == "u_9001"
    assert body["data"]["role"] == "admin"


def test_upload_with_token(tmp_path: Path):
    f = tmp_path / "hello.txt"
    f.write_bytes(b"hello mock")
    with f.open("rb") as fp:
        res = client.post(
            "/upload",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            files={"file": ("hello.txt", fp, "text/plain")},
        )
    assert res.status_code == 200
    body = res.json()
    assert body["code"] == 0
    assert body["message"] == "ok"
    assert body["data"]["url"] == "https://mock.local/uploads/hello.txt"
    assert body["data"]["name"] == "hello.txt"
    assert body["data"]["size"] == 10


def test_upload_without_token(tmp_path: Path):
    f = tmp_path / "hello.txt"
    f.write_bytes(b"hello")
    with f.open("rb") as fp:
        res = client.post(
            "/upload",
            files={"file": ("hello.txt", fp, "text/plain")},
        )
    assert res.status_code == 401
    body = res.json()
    assert body["code"] == 401
