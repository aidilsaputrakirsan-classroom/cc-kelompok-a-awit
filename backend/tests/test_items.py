"""Test CRUD item endpoints."""


def test_create_item(client, auth_headers):
    """Test membuat item baru → 201."""
    response = client.post("/api/items", json={
        "code": "ITEM001",
        "name": "Laptop",
        "description": "Laptop untuk cloud computing",
        "category": "Electronics"
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Laptop"
    assert data["code"] == "ITEM001"
    assert "id" in data


def test_create_item_unauthorized(client):
    """Test membuat item tanpa login → 401."""
    response = client.post("/api/items", json={
        "code": "ITEM999",
        "name": "Laptop",
        "category": "Electronics"
    })
    assert response.status_code == 401


def test_get_items(client, auth_headers):
    """Test mengambil daftar items → 200."""
    # Buat 2 items
    client.post("/api/items", json={
        "code": "ITEM001", "name": "Laptop", "category": "Electronics"
    }, headers=auth_headers)
    client.post("/api/items", json={
        "code": "ITEM002", "name": "Mouse", "category": "Accessories"
    }, headers=auth_headers)

    response = client.get("/api/items", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2


def test_get_item_not_found(client, auth_headers):
    """Test mengambil item yang tidak ada → 404."""
    # Gunakan UUID yang valid tapi tidak ada di database
    response = client.get("/api/items/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert response.status_code == 404


def test_update_item(client, auth_headers):
    """Test update item → data berubah."""
    # Buat item
    create_resp = client.post("/api/items", json={
        "code": "ITEM003", "name": "Laptop", "category": "Electronics"
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    # Update
    response = client.put(f"/api/items/{item_id}", json={
        "name": "Laptop Pro"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Laptop Pro"


def test_delete_item(client, auth_headers):
    """Test hapus item → 204, lalu GET → 404."""
    # Buat item
    create_resp = client.post("/api/items", json={
        "code": "TEMP001", "name": "Temporary", "category": "Temp"
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    # Hapus
    response = client.delete(f"/api/items/{item_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verifikasi sudah tidak ada
    get_resp = client.get(f"/api/items/{item_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_search_items(client, auth_headers):
    """Test search item berdasarkan nama."""
    client.post("/api/items", json={
        "code": "LAPTOP01", "name": "Laptop Gaming", "category": "Electronics"
    }, headers=auth_headers)
    client.post("/api/items", json={
        "code": "MOUSE01", "name": "Mouse Wireless", "category": "Accessories"
    }, headers=auth_headers)

    response = client.get("/api/items?search=laptop", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("laptop" in item["name"].lower() for item in data["items"])