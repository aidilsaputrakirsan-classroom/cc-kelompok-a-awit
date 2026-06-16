import os
import sqlite3  #noqa
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

db_url = os.getenv("DATABASE_URL", "sqlite:///./fallback.db")

# Fix Postgres connection string format if needed
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and "+psycopg2" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        if "sqlite" in db_url:
            # SQLite does not support IF NOT EXISTS in ALTER TABLE
            try:
                conn.execute(text("ALTER TABLE master_blocks ADD COLUMN geometry JSON;"))
                print("Successfully added 'geometry' column to master_blocks.")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("Column 'geometry' already exists.")
                else:
                    raise e
        else:
            # Postgres
            conn.execute(text("ALTER TABLE master_blocks ADD COLUMN IF NOT EXISTS geometry JSON;"))
            print("Successfully added 'geometry' column to master_blocks.")

        conn.commit()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
