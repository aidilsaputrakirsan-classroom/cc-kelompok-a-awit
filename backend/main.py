import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User
from schemas import (
    ItemCreate, ItemUpdate, ItemResponse, ItemListResponse,
    UserCreate, UserResponse, LoginRequest, TokenResponse,
)
from auth import create_access_token, get_current_user
import crud

load_dotenv()

# Buat semua tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud App API",
    description="REST API untuk mata kuliah Komputasi Awan — SI ITK",
    version="0.5.0",
)

# ==================== CORS (FIXED) ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.4.0"}


# ==================== AUTH ENDPOINTS (PUBLIC) ====================

@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrasi user baru.
    
    Requirements:
    - **email**: Format valid (contoh: user@itk.ac.id)
    - **name**: Minimal 2 karakter, maksimal 100 karakter
    - **password**: Minimal 8 karakter dengan kombinasi:
      - Huruf (A-Z, a-z)
      - Angka (0-9)
      - Special character (!@#$%^&*)
    
    Contoh password valid: `Password123!`
    """
    try:
        user = crud.create_user(db=db, user_data=user_data)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="Email sudah terdaftar. Gunakan email lain atau login dengan akun yang sudah ada."
            )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dengan JSON body dan dapatkan JWT token.
    
    - **email**: Email pengguna yang terdaftar
    - **password**: Password pengguna
    
    **Response:**
    - **access_token**: JWT token untuk otorisasi (valid 60 menit)
    - **token_type**: Tipe token (selalu 'bearer')
    - **user**: Informasi user yang login
    
    **Penggunaan:**
    Gunakan token di header setiap request:
    ```
    Authorization: Bearer <access_token>
    ```
    """
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email atau password salah. Periksa kembali kredensial Anda."
        )

    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@app.post("/auth/token")
def login_for_access_token(
    username: str = Form(..., description="Email user"),
    password: str = Form(..., description="Password user"),
    db: Session = Depends(get_db),
):
    """
    OAuth2 compatible token endpoint.
    
    Endpoint ini menerima form data (username=email, password=password).
    Digunakan oleh Swagger UI Authorization dan OAuth2 clients.
    """
    # Username di OAuth2 context berarti email
    user = crud.authenticate_user(db=db, email=username, password=password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
    }


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login."""
    return current_user


# ==================== ITEM ENDPOINTS (PROTECTED) ====================

@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat item baru. **Membutuhkan autentikasi.**"""
    return crud.create_item(db=db, item_data=item)


@app.get("/items", response_model=ItemListResponse)
def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar items. **Membutuhkan autentikasi.**"""
    return crud.get_items(db=db, skip=skip, limit=limit, search=search)


@app.get("/items/stats")
def get_items_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Dapatkan statistik items.
    
    Returns:
    - **total_items**: Jumlah total item
    - **total_quantity**: Total quantity dari semua items
    - **average_price**: Rata-rata harga item
    - **min_price**: Harga terendah
    - **max_price**: Harga tertinggi
    
    **Membutuhkan autentikasi.**
    """
    return crud.get_items_stats(db=db)


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil satu item. **Membutuhkan autentikasi.**"""
    item = crud.get_item(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update item. **Membutuhkan autentikasi.**"""
    updated = crud.update_item(db=db, item_id=item_id, item_data=item)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return updated


@app.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus item. **Membutuhkan autentikasi.**"""
    success = crud.delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return None


# ==================== TEAM INFO ====================
@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-a-awit",
        "members": [
            {"name": "Adam Ibnu Ramadhan", "nim": "10231003", "role": "Lead Backend"},
            {"name": "Alfian Fadillah Putra", "nim": "10231009", "role": "Lead Frontend"},
            {"name": "Varrel Kaleb Ropard Pasaribu", "nim": "10231089", "role": "Lead Container"},
            {"name": "Adhyasta Firdaus", "nim": "10231005", "role": "Lead CI/CD & Deploy"},
            {"name": "Adonia Azarya Tamalonggehe", "nim": "10231007", "role": "Lead QA & Docs"},
        ]
    }