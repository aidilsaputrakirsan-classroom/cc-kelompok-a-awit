import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User, MasterVendor, MasterBlock, HaulingTransaction
import uuid
from schemas import (
    VendorCreate, VendorUpdate, VendorResponse,
    BlockCreate, BlockUpdate, BlockResponse,
    HaulingTransactionCreate, HaulingTransactionUpdate, HaulingTransactionResponse, HaulingTransactionListResponse,
    DashboardResponse, DashboardTodayStats, DashboardMTDStats,
    UserCreate, UserResponse, LoginRequest, TokenResponse,
)
from auth import create_access_token, get_current_user
import crud

load_dotenv()

# Buat semua tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PalmChain API",
    description="REST API untuk Palm Oil Supply Chain Monitoring System (PalmChain)",
    version="1.0.0",
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


# ==================== VENDOR ENDPOINTS (PROTECTED) ====================

@app.post("/api/vendors", response_model=VendorResponse, status_code=201)
def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat vendor baru. **Membutuhkan autentikasi.**"""
    db_vendor = crud.create_vendor(db=db, vendor_data=vendor)
    if not db_vendor:
        raise HTTPException(status_code=400, detail="Vendor code sudah terdaftar")
    return db_vendor


@app.get("/api/vendors", status_code=200)
def list_vendors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar vendors dengan pagination. **Membutuhkan autentikasi.**"""
    return crud.get_vendors(db=db, skip=skip, limit=limit, search=search, status=status)


@app.get("/api/vendors/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil satu vendor berdasarkan ID. **Membutuhkan autentikasi.**"""
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")
    
    vendor = crud.get_vendor(db=db, vendor_id=vendor_uuid)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor tidak ditemukan")
    return vendor


@app.put("/api/vendors/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    vendor: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update vendor. **Membutuhkan autentikasi.**"""
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")
    
    updated = crud.update_vendor(db=db, vendor_id=vendor_uuid, vendor_data=vendor)
    if not updated:
        raise HTTPException(status_code=404, detail="Vendor tidak ditemukan")
    return updated


@app.delete("/api/vendors/{vendor_id}", status_code=204)
def delete_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus vendor. **Membutuhkan autentikasi.**"""
    try:
        vendor_uuid = uuid.UUID(vendor_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")
    
    success = crud.delete_vendor(db=db, vendor_id=vendor_uuid)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor tidak ditemukan")


# ==================== BLOCK ENDPOINTS (PROTECTED) ====================

@app.post("/api/blocks", response_model=BlockResponse, status_code=201)
def create_block(
    block: BlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat block/afdeling baru. **Membutuhkan autentikasi.**"""
    db_block = crud.create_block(db=db, block_data=block)
    if not db_block:
        raise HTTPException(status_code=400, detail="Block code sudah terdaftar")
    return db_block


@app.get("/api/blocks", status_code=200)
def list_blocks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar blocks dengan pagination. **Membutuhkan autentikasi.**"""
    return crud.get_blocks(db=db, skip=skip, limit=limit, search=search, status=status)


@app.get("/api/blocks/{block_id}", response_model=BlockResponse)
def get_block(
    block_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil satu block berdasarkan ID. **Membutuhkan autentikasi.**"""
    try:
        block_uuid = uuid.UUID(block_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid block ID format")
    
    block = crud.get_block(db=db, block_id=block_uuid)
    if not block:
        raise HTTPException(status_code=404, detail="Block tidak ditemukan")
    return block


@app.put("/api/blocks/{block_id}", response_model=BlockResponse)
def update_block(
    block_id: str,
    block: BlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update block. **Membutuhkan autentikasi.**"""
    try:
        block_uuid = uuid.UUID(block_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid block ID format")
    
    updated = crud.update_block(db=db, block_id=block_uuid, block_data=block)
    if not updated:
        raise HTTPException(status_code=404, detail="Block tidak ditemukan")
    return updated


@app.delete("/api/blocks/{block_id}", status_code=204)
def delete_block(
    block_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus block. **Membutuhkan autentikasi.**"""
    try:
        block_uuid = uuid.UUID(block_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid block ID format")
    
    success = crud.delete_block(db=db, block_id=block_uuid)
    if not success:
        raise HTTPException(status_code=404, detail="Block tidak ditemukan")


# ==================== HAULING TRANSACTION ENDPOINTS (PROTECTED) ====================

@app.post("/api/hauling-transactions", response_model=HaulingTransactionResponse, status_code=201)
def create_hauling_transaction(
    hauling: HaulingTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat hauling transaction baru. **Membutuhkan autentikasi.**"""
    db_hauling = crud.create_hauling_transaction(db=db, hauling_data=hauling)
    if not db_hauling:
        raise HTTPException(status_code=400, detail="Ticket number sudah terdaftar")
    return db_hauling


@app.get("/api/hauling-transactions", response_model=HaulingTransactionListResponse)
def list_hauling_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    vendor_id: str = Query(None),
    block_id: str = Query(None),
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar hauling transactions dengan pagination dan filter. **Membutuhkan autentikasi.**"""
    vendor_uuid = None
    block_uuid = None
    
    if vendor_id:
        try:
            vendor_uuid = uuid.UUID(vendor_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid vendor ID format")
    
    if block_id:
        try:
            block_uuid = uuid.UUID(block_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid block ID format")
    
    return crud.get_hauling_transactions(
        db=db, skip=skip, limit=limit,
        vendor_id=vendor_uuid, block_id=block_uuid,
        status=status, search=search
    )


@app.get("/api/hauling-transactions/{hauling_id}", response_model=HaulingTransactionResponse)
def get_hauling_transaction(
    hauling_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil satu hauling transaction berdasarkan ID. **Membutuhkan autentikasi.**"""
    try:
        hauling_uuid = uuid.UUID(hauling_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hauling ID format")
    
    hauling = crud.get_hauling_transaction(db=db, hauling_id=hauling_uuid)
    if not hauling:
        raise HTTPException(status_code=404, detail="Hauling transaction tidak ditemukan")
    return hauling


@app.put("/api/hauling-transactions/{hauling_id}", response_model=HaulingTransactionResponse)
def update_hauling_transaction(
    hauling_id: str,
    hauling: HaulingTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update hauling transaction. **Membutuhkan autentikasi.**"""
    try:
        hauling_uuid = uuid.UUID(hauling_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hauling ID format")
    
    updated = crud.update_hauling_transaction(db=db, hauling_id=hauling_uuid, hauling_data=hauling)
    if not updated:
        raise HTTPException(status_code=404, detail="Hauling transaction tidak ditemukan")
    return updated


@app.delete("/api/hauling-transactions/{hauling_id}", status_code=204)
def delete_hauling_transaction(
    hauling_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus hauling transaction. **Membutuhkan autentikasi.**"""
    try:
        hauling_uuid = uuid.UUID(hauling_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hauling ID format")
    
    success = crud.delete_hauling_transaction(db=db, hauling_id=hauling_uuid)
    if not success:
        raise HTTPException(status_code=404, detail="Hauling transaction tidak ditemukan")


# ==================== DASHBOARD ENDPOINTS (PROTECTED) ====================

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Dapatkan dashboard summary dengan statistik hari ini dan Month-To-Date.
    
    **Response:**
    - **today**: Statistik transaksi hari ini (total_transactions, total_tonage, avg_tonage)
    - **mtd**: Statistik bulan ini (total_transactions, total_tonage, target_tonage, achievement_percentage)
    - **last_updated**: Waktu terakhir data diperbarui
    
    **Membutuhkan autentikasi.**
    """
    from datetime import datetime
    
    today_stats = crud.get_hauling_stats_today(db=db)
    mtd_stats = crud.get_hauling_stats_mtd(db=db, target_tonage=500.0)
    
    return {
        "today": DashboardTodayStats(**today_stats),
        "mtd": DashboardMTDStats(**mtd_stats),
        "last_updated": datetime.now()
    }


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