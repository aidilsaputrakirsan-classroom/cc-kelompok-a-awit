"""Test CRUD item endpoints."""
from main import app


def test_create_item(client, auth_headers):
    """Test membuat item baru → 201."""
    response = client.post("/api/items", json={
        "code": "ITEM001",
        "name": "Laptop",
        "description": "Laptop untuk cloud computing",
        "category": "Electronics",
        "price": 15000.0
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


def test_create_item_with_empty_code(client, auth_headers):
    """Test membuat item dengan code kosong → 422."""
    response = client.post("/api/items", json={
        "code": "",
        "name": "Laptop",
        "category": "Electronics"
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_item_with_empty_name(client, auth_headers):
    """Test membuat item dengan name kosong → 422."""
    response = client.post("/api/items", json={
        "code": "ITEM999",
        "name": "",
        "category": "Electronics"
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_item_duplicate_code(client, auth_headers):
    """Test membuat item dengan code yang sudah ada → 400."""
    # Buat item pertama
    client.post("/api/items", json={
        "code": "DUPCODE", "name": "Item 1", "category": "Electronics"
    }, headers=auth_headers)
    
    # Buat item kedua dengan code sama
    response = client.post("/api/items", json={
        "code": "DUPCODE", "name": "Item 2", "category": "Electronics"
    }, headers=auth_headers)
    assert response.status_code == 400


def test_pagination_get_items(client, auth_headers):
    """Test pagination dengan skip & limit."""
    # Buat 5 items
    for i in range(1, 6):
        client.post("/api/items", json={
            "code": f"PAGI{i:03d}", "name": f"Item {i}", "category": "Test"
        }, headers=auth_headers)
    
    # Test: skip=0, limit=2 → harus return 2 items
    response = client.get("/api/items?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] >= 5
    
    # Test: skip=2, limit=2 → harus return 2 items berbeda
    response2 = client.get("/api/items?skip=2&limit=2", headers=auth_headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2["items"]) == 2
    # Pastikan items berbeda
    assert data["items"][0]["id"] != data2["items"][0]["id"]


def test_items_stats(client, auth_headers):
    """Test endpoint /api/items/stats → return statistik items."""
    # Buat 3 items di kategori Electronics
    for i in range(1, 4):
        client.post("/api/items", json={
            "code": f"ELEC{i:03d}", "name": f"Electronic {i}", "category": "Electronics", "price": float(i * 1000)
        }, headers=auth_headers)
    
    # Buat 2 items di kategori Accessories
    for i in range(1, 3):
        client.post("/api/items", json={
            "code": f"ACC{i:03d}", "name": f"Accessory {i}", "category": "Accessories", "price": float(i * 500)
        }, headers=auth_headers)
    
    response = client.get("/api/items/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    
    # Validasi struktur response
    assert "total_items" in data
    assert "total_categories" in data
    assert "items_by_category" in data
    assert "total_value" in data
    assert "highest_price" in data
    assert "lowest_price" in data
    
    # Validasi data
    assert data["total_items"] >= 5
    assert data["total_categories"] >= 2
    assert data["items_by_category"]["Electronics"] >= 3
    assert data["items_by_category"]["Accessories"] >= 2
    assert data["total_value"] > 0
    assert data["highest_price"] >= 3000.0