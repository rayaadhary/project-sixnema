import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")

@pytest.fixture
def client():
    return requests.Session()

@pytest.mark.parametrize("email,password,role", [
    ("pembina@sixnema.smpmusix.sch.id", "pembina123", "pembina"),
    ("siswa@sixnema.smpmusix.sch.id", "siswa123", "siswa"),
    ("waka@sixnema.smpmusix.sch.id", "waka123", "waka"),
])
def test_auth_login_me_logout(client, email, password, role):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200 and r.json()["role"] == role
    assert "access_token" in r.cookies and r.cookies["access_token"]
    assert client.get(f"{BASE_URL}/api/auth/me").json()["role"] == role
    assert client.post(f"{BASE_URL}/api/auth/logout").status_code == 200
    assert client.get(f"{BASE_URL}/api/auth/me").status_code == 401

def test_invalid_login(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email":"invalid@example.com", "password":"wrong"})
    assert r.status_code == 401 and "detail" in r.json()

def test_health(client):
    r = client.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"

def test_role_access_and_core_reads(client):
    assert client.post(f"{BASE_URL}/api/auth/login", json={"email":"pembina@sixnema.smpmusix.sch.id", "password":"pembina123"}).status_code == 200
    assert client.get(f"{BASE_URL}/api/students").status_code == 200
    assert client.post(f"{BASE_URL}/api/journals", json={"topic":"TEST topic", "summary":"TEST summary"}).status_code == 200
    assert client.post(f"{BASE_URL}/api/artworks", json={"title":"TEST", "url":"https://example.com", "description":"TEST"}).status_code == 403
    assert client.post(f"{BASE_URL}/api/students", json={"name":"TEST student", "nis":"TEST001", "class":"8A"}).status_code == 200