from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

# Ambil DATABASE_URL dari config
DATABASE_URL = settings.DATABASE_URL

# Buat engine (koneksi ke database)
engine = create_engine(DATABASE_URL, echo=settings.DEBUG)

# Buat session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk models
Base = declarative_base()


# Dependency: dapatkan database session
def get_db():
    """
    Dependency injection untuk FastAPI.
    Membuka session saat request masuk, menutup saat selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        