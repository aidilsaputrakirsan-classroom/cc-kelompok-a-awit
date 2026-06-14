"""
Integration Tests — PalmChain API via Gateway
Tests ini berjalan di CI setelah Docker Compose up.

Requirement: conftest.py (fixtures: gateway_url, test_user)
"""
import httpx
import pytest


class TestGatewayHealth:
    """Test bahwa gateway dan semua services healthy."""

    def test_gateway_health(self, gateway_url):
        """Gateway /health harus return 200."""
        response = httpx.get(f"{gateway_url}/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"

    def test_auth_service_reachable(self, gateway_url):
        """Auth service harus bisa diakses via gateway."""
        # Register endpoint harus ada (meski request body kosong → 422)
        response = httpx.post(
            f"{gateway_url}/auth/register",
            json={},
            timeout=10,
        )
        # 422 = validation error, bukan 502/503 = service down
        assert response.status_code in [200, 201, 400, 422], \
            f"Auth service tidak dapat diakses: {response.status_code}"


class TestAuthFlow:
    """Test alur autentikasi register → login → me."""

    def test_register_creates_user(self, gateway_url):
        """Register user baru harus berhasil."""
        import time
        email = f"test-{int(time.time())}@integration.test"
        response = httpx.post(
            f"{gateway_url}/auth/register",
            json={"email": email, "password": "TestPass123!", "name": "Integration Tester"},
            timeout=10,
        )
        assert response.status_code in [200, 201], \
            f"Register gagal: {response.status_code} — {response.text}"

    def test_login_returns_token(self, test_user, gateway_url):
        """Login dengan kredensial valid harus return access_token."""
        response = httpx.post(
            f"{gateway_url}/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]},
            timeout=10,
        )
        assert response.status_code == 200, f"Login gagal: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response tidak punya access_token"
        assert len(data["access_token"]) > 10, "Token terlalu pendek"

    def test_me_requires_auth(self, gateway_url):
        """Endpoint /auth/me tanpa token harus return 401."""
        response = httpx.get(f"{gateway_url}/auth/me", timeout=10)
        assert response.status_code == 401, \
            f"Harusnya 401 tanpa token, dapat: {response.status_code}"

    def test_me_with_valid_token(self, test_user, gateway_url):
        """Endpoint /auth/me dengan token valid harus return user data."""
        response = httpx.get(
            f"{gateway_url}/auth/me",
            headers=test_user["headers"],
            timeout=10,
        )
        assert response.status_code == 200, f"GET /auth/me gagal: {response.text}"
        data = response.json()
        assert data.get("email") == test_user["email"]


class TestItemsCRUD:
    """Test CRUD operations pada Items endpoint."""

    def test_list_items_requires_auth(self, gateway_url):
        """GET /api/items tanpa token harus 401."""
        response = httpx.get(f"{gateway_url}/api/items", timeout=10)
        assert response.status_code == 401, \
            f"Harusnya 401, dapat: {response.status_code}"

    def test_list_items_with_auth(self, test_user, gateway_url):
        """GET /api/items dengan token valid harus return list."""
        response = httpx.get(
            f"{gateway_url}/api/items",
            headers=test_user["headers"],
            timeout=10,
        )
        assert response.status_code == 200, \
            f"GET /api/items gagal: {response.status_code} — {response.text}"
        data = response.json()
        # Response bisa list atau object dengan key "items"
        assert isinstance(data, (list, dict)), \
            f"Format response tidak valid: {type(data)}"

    def test_create_item(self, test_user, gateway_url):
        """POST /api/items harus bisa membuat item baru."""
        item_payload = {
            "name": "Integration Test Item",
            "description": "Item dibuat oleh integration test CI",
            "price": 99.99,
            "quantity": 10,
        }
        response = httpx.post(
            f"{gateway_url}/api/items",
            json=item_payload,
            headers=test_user["headers"],
            timeout=10,
        )
        assert response.status_code in [200, 201], \
            f"Create item gagal: {response.status_code} — {response.text}"
        data = response.json()
        assert data.get("name") == item_payload["name"]
        return data

    def test_invalid_item_rejected(self, test_user, gateway_url):
        """POST /api/items dengan data tidak valid harus return 422."""
        response = httpx.post(
            f"{gateway_url}/api/items",
            json={},  # body kosong
            headers=test_user["headers"],
            timeout=10,
        )
        assert response.status_code == 422, \
            f"Body kosong harusnya 422, dapat: {response.status_code}"
