"""
Data Migration Script
Migrasi data dari monolith (1 database) ke microservices (2 database).

Usage:
    python scripts/migrate_data.py
"""
import os
import sys
from sqlalchemy import create_engine, text

# Sesuaikan kredensial dengan yang ada di docker-compose.yml kelompokmu
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5432/cloudapp"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5433/auth_db"
)
ITEM_DB_URL = os.getenv(
    "ITEM_DB_URL",
    "postgresql://postgres:postgres123@localhost:5434/item_db"
)

def migrate():
    print("=" * 50)
    print("DATA MIGRATION: Monolith → Microservices")
    print("=" * 50)

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db = create_engine(AUTH_DB_URL)
    item_db = create_engine(ITEM_DB_URL)

    # Step 1: Migrate users to auth_db
    print("\n[1/2] Migrating users → auth_db...")
    with monolith.connect() as src:
        users = src.execute(text("SELECT * FROM users")).fetchall()
        print(f"     Found {len(users)} users in monolith")

    with auth_db.connect() as dst:
        for user in users:
            dst.execute(
                text("""
                    INSERT INTO users (id, email, name, hashed_password, created_at)
                    VALUES (:id, :email, :name, :hashed_password, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "hashed_password": user.hashed_password,
                    "created_at": user.created_at,
                }
            )
        dst.commit()
    print(f"     ✅ Migrated {len(users)} users")

    # Step 2: Migrate items to item_db
    print("\n[2/2] Migrating items → item_db...")
    with monolith.connect() as src:
        items = src.execute(text("SELECT * FROM items")).fetchall()
        print(f"     Found {len(items)} items in monolith")

    with item_db.connect() as dst:
        for item in items:
            dst.execute(
                text("""
                    INSERT INTO items (id, name, description, price, quantity, owner_id, created_at)
                    VALUES (:id, :name, :description, :price, :quantity, :owner_id, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "quantity": item.quantity,
                    "owner_id": item.owner_id,
                    "created_at": item.created_at,
                }
            )
        dst.commit()
    print(f"     ✅ Migrated {len(items)} items")

    print("\n" + "=" * 50)
    print("MIGRATION COMPLETE!")
    print("=" * 50)

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print("Pastikan semua database accessible dan tabel sudah dibuat.")
        sys.exit(1)