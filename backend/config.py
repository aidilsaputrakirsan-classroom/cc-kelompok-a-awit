"""
Configuration management untuk PalmChain Backend.
Membaca environment variables dengan fallback ke development defaults.
"""
import os
from typing import List
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Settings:
    """
    Application settings — dibaca dari environment variables.
    Pisahkan config dev vs prod dengan fallback ke development defaults.
    """
    
    # ==================== ENVIRONMENT ====================
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # ==================== DATABASE ====================
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/cloudapp"
    )
    
    # Jika DATABASE_URL kosong, gunakan fallback
    if not DATABASE_URL or DATABASE_URL.strip() == "":
        DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/cloudapp"
    
    # ==================== AUTHENTICATION ====================
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production" if DEBUG else None
    )
    
    # Validasi SECRET_KEY di production
    if not SECRET_KEY and not DEBUG:
        raise ValueError(
            "SECRET_KEY harus didefinisikan di environment untuk production mode!"
        )
    
    # Default SECRET_KEY jika belum di-set (hanya untuk dev)
    if not SECRET_KEY:
        SECRET_KEY = "dev-secret-key-change-in-production"
    
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )
    
    # ==================== CORS ====================
    CORS_ORIGINS_STR: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000" if DEBUG 
        else "http://localhost"
    )
    
    # Parse CORS origins dari string ke list
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in CORS_ORIGINS_STR.split(",") 
        if origin.strip()
    ]
    
    # ==================== LOGGING ====================
    LOG_LEVEL: str = os.getenv(
        "LOG_LEVEL",
        "DEBUG" if DEBUG else "INFO"
    )
    
    # ==================== API INFO ====================
    API_TITLE: str = "PalmChain API"
    API_DESCRIPTION: str = "REST API untuk Palm Oil Supply Chain Monitoring System (PalmChain)"
    API_VERSION: str = "1.0.0"
    
    # ==================== FEATURE FLAGS ====================
    # Aktifkan/nonaktifkan fitur tertentu berdasarkan environment
    ENABLE_DOCS: bool = DEBUG  # Swagger docs hanya di dev
    ENABLE_REDOC: bool = DEBUG  # ReDoc hanya di dev
    
    def __init__(self):
        """Inisialisasi settings dan validasi konfigurasi."""
        self._validate_settings()
    
    def _validate_settings(self):
        """Validasi configuration dan keamanan."""
        # Warning jika menggunakan default SECRET_KEY di production
        if not self.DEBUG and self.SECRET_KEY == "dev-secret-key-change-in-production":
            raise ValueError(
                "⚠️ SECURITY WARNING: Jangan gunakan default SECRET_KEY di production!"
            )
        
        # Pastikan DATABASE_URL valid
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL harus dikonfigurasi!")
        
        # Validasi CORS_ORIGINS
        if not self.CORS_ORIGINS:
            print("⚠️ WARNING: CORS_ORIGINS kosong, menggunakan default localhost")
            self.CORS_ORIGINS = ["http://localhost:5173"]
    
    def get_database_url(self, for_test: bool = False) -> str:
        """
        Get database URL dengan override untuk testing.
        
        Args:
            for_test: Jika True, gunakan SQLite untuk testing
            
        Returns:
            Database URL yang sesuai
        """
        if for_test:
            return "sqlite:///./test.db"
        return self.DATABASE_URL
    
    @property
    def is_production(self) -> bool:
        """Check apakah running di production."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check apakah running di development."""
        return self.ENVIRONMENT == "development"
    
    def __repr__(self) -> str:
        """String representation dari settings."""
        return (
            f"<Settings "
            f"env={self.ENVIRONMENT} "
            f"debug={self.DEBUG} "
            f"db={'***' if self.DATABASE_URL else 'N/A'} "
            f"cors={len(self.CORS_ORIGINS)} origins>"
        )


# Instansiasi settings global
settings = Settings()

# Export untuk digunakan di aplikasi
__all__ = ["settings", "Settings"]
