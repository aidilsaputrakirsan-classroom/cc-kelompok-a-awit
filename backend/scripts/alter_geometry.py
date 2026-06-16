import os
import sqlite3
import sys

db_path = os.path.join(os.path.dirname(__file__), '..', 'fallback.db')

if not os.path.exists(db_path):
    print("No database found at", db_path)
    sys.exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE master_blocks ADD COLUMN geometry JSON;")
    conn.commit()
    print("Successfully added 'geometry' column to master_blocks.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column 'geometry' already exists.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
