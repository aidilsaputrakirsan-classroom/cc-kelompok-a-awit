from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from datetime import datetime, timedelta
import uuid
from models import MasterVendor, MasterBlock, HaulingTransaction, User
from schemas import (
    VendorCreate, VendorUpdate, BlockCreate, BlockUpdate,
    HaulingTransactionCreate, HaulingTransactionUpdate, UserCreate
)
from auth import hash_password, verify_password


# ==================== USER CRUD ====================

def create_user(db: Session, user_data: UserCreate) -> User:
    """Buat user baru dengan password yang di-hash."""
    # Cek apakah email sudah terdaftar
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None  # Email sudah dipakai

    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Autentikasi user: cek email & password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ==================== VENDOR CRUD ====================

def create_vendor(db: Session, vendor_data: VendorCreate) -> MasterVendor:
    """Buat vendor baru di database."""
    # Check if vendor code already exists
    existing = db.query(MasterVendor).filter(MasterVendor.code == vendor_data.code).first()
    if existing:
        return None
    
    db_vendor = MasterVendor(
        **vendor_data.model_dump()
    )
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def get_vendors(db: Session, skip: int = 0, limit: int = 20, search: str = None, status: bool = None):
    """
    Ambil daftar vendors dengan pagination & filter.
    - skip: jumlah data yang di-skip (untuk pagination)
    - limit: jumlah data per halaman
    - search: cari berdasarkan code, name, atau email
    - status: filter by active status
    """
    query = db.query(MasterVendor)
    
    if search:
        query = query.filter(
            or_(
                MasterVendor.code.ilike(f"%{search}%"),
                MasterVendor.name.ilike(f"%{search}%"),
                MasterVendor.email.ilike(f"%{search}%")
            )
        )
    
    if status is not None:
        query = query.filter(MasterVendor.status == status)
    
    total = query.count()
    vendors = query.order_by(MasterVendor.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "vendors": vendors}


def get_vendor(db: Session, vendor_id: uuid.UUID) -> MasterVendor | None:
    """Ambil satu vendor berdasarkan ID."""
    return db.query(MasterVendor).filter(MasterVendor.id == vendor_id).first()


def update_vendor(db: Session, vendor_id: uuid.UUID, vendor_data: VendorUpdate) -> MasterVendor | None:
    """Update vendor berdasarkan ID."""
    db_vendor = db.query(MasterVendor).filter(MasterVendor.id == vendor_id).first()
    
    if not db_vendor:
        return None
    
    update_data = vendor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vendor, field, value)
    
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def delete_vendor(db: Session, vendor_id: uuid.UUID) -> bool:
    """Hapus vendor berdasarkan ID. Return True jika berhasil."""
    db_vendor = db.query(MasterVendor).filter(MasterVendor.id == vendor_id).first()
    
    if not db_vendor:
        return False
    
    db.delete(db_vendor)
    db.commit()
    return True


# ==================== BLOCK CRUD ====================

def create_block(db: Session, block_data: BlockCreate) -> MasterBlock:
    """Buat block baru di database."""
    # Check if block code already exists
    existing = db.query(MasterBlock).filter(MasterBlock.block_code == block_data.block_code).first()
    if existing:
        return None
    
    db_block = MasterBlock(
        **block_data.model_dump()
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block


def get_blocks(db: Session, skip: int = 0, limit: int = 20, search: str = None, status: bool = None):
    """
    Ambil daftar blocks dengan pagination & filter.
    - skip: jumlah data yang di-skip
    - limit: jumlah data per halaman
    - search: cari berdasarkan block_code atau division
    - status: filter by active status
    """
    query = db.query(MasterBlock)
    
    if search:
        query = query.filter(
            or_(
                MasterBlock.block_code.ilike(f"%{search}%"),
                MasterBlock.division.ilike(f"%{search}%")
            )
        )
    
    if status is not None:
        query = query.filter(MasterBlock.status == status)
    
    total = query.count()
    blocks = query.order_by(MasterBlock.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "blocks": blocks}


def get_block(db: Session, block_id: uuid.UUID) -> MasterBlock | None:
    """Ambil satu block berdasarkan ID."""
    return db.query(MasterBlock).filter(MasterBlock.id == block_id).first()


def update_block(db: Session, block_id: uuid.UUID, block_data: BlockUpdate) -> MasterBlock | None:
    """Update block berdasarkan ID."""
    db_block = db.query(MasterBlock).filter(MasterBlock.id == block_id).first()
    
    if not db_block:
        return None
    
    update_data = block_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_block, field, value)
    
    db.commit()
    db.refresh(db_block)
    return db_block


def delete_block(db: Session, block_id: uuid.UUID) -> bool:
    """Hapus block berdasarkan ID. Return True jika berhasil."""
    db_block = db.query(MasterBlock).filter(MasterBlock.id == block_id).first()
    
    if not db_block:
        return False
    
    db.delete(db_block)
    db.commit()
    return True


# ==================== HAULING TRANSACTION CRUD ====================

def create_hauling_transaction(db: Session, hauling_data: HaulingTransactionCreate) -> HaulingTransaction:
    """Buat hauling transaction baru di database."""
    # Check if ticket_no already exists
    existing = db.query(HaulingTransaction).filter(HaulingTransaction.ticket_no == hauling_data.ticket_no).first()
    if existing:
        return None
    
    db_hauling = HaulingTransaction(
        **hauling_data.model_dump()
    )
    db.add(db_hauling)
    db.commit()
    db.refresh(db_hauling)
    return db_hauling


def get_hauling_transactions(db: Session, skip: int = 0, limit: int = 20, 
                            vendor_id: uuid.UUID = None, block_id: uuid.UUID = None,
                            status: str = None, search: str = None):
    """
    Ambil daftar hauling transactions dengan pagination & filter.
    - skip: jumlah data yang di-skip
    - limit: jumlah data per halaman
    - vendor_id: filter by vendor
    - block_id: filter by block
    - status: filter by transaction status
    - search: cari berdasarkan ticket_no atau vehicle_plate
    """
    query = db.query(HaulingTransaction)
    
    if vendor_id:
        query = query.filter(HaulingTransaction.vendor_id == vendor_id)
    
    if block_id:
        query = query.filter(HaulingTransaction.block_id == block_id)
    
    if status:
        query = query.filter(HaulingTransaction.status == status)
    
    if search:
        query = query.filter(
            or_(
                HaulingTransaction.ticket_no.ilike(f"%{search}%"),
                HaulingTransaction.vehicle_plate.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    transactions = query.order_by(HaulingTransaction.gate_in_time.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "transactions": transactions}


def get_hauling_transaction(db: Session, hauling_id: uuid.UUID) -> HaulingTransaction | None:
    """Ambil satu hauling transaction berdasarkan ID."""
    return db.query(HaulingTransaction).filter(HaulingTransaction.id == hauling_id).first()


def update_hauling_transaction(db: Session, hauling_id: uuid.UUID, 
                               hauling_data: HaulingTransactionUpdate) -> HaulingTransaction | None:
    """Update hauling transaction berdasarkan ID."""
    db_hauling = db.query(HaulingTransaction).filter(HaulingTransaction.id == hauling_id).first()
    
    if not db_hauling:
        return None
    
    update_data = hauling_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hauling, field, value)
    
    db.commit()
    db.refresh(db_hauling)
    return db_hauling


def delete_hauling_transaction(db: Session, hauling_id: uuid.UUID) -> bool:
    """Hapus hauling transaction berdasarkan ID. Return True jika berhasil."""
    db_hauling = db.query(HaulingTransaction).filter(HaulingTransaction.id == hauling_id).first()
    
    if not db_hauling:
        return False
    
    db.delete(db_hauling)
    db.commit()
    return True


# ==================== DASHBOARD STATS ====================

def get_hauling_stats_today(db: Session) -> dict:
    """
    Dapatkan statistik hauling transactions untuk hari ini.
    - total_transactions: Jumlah transaksi hari ini
    - total_tonage: Total net_weight hari ini
    - avg_tonage: Rata-rata net_weight hari ini
    """
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    query = db.query(HaulingTransaction).filter(
        and_(
            HaulingTransaction.gate_in_time >= today_start,
            HaulingTransaction.gate_in_time < today_end
        )
    )
    
    total_transactions = query.count()
    total_tonage = db.query(func.sum(HaulingTransaction.net_weight)).filter(
        and_(
            HaulingTransaction.gate_in_time >= today_start,
            HaulingTransaction.gate_in_time < today_end
        )
    ).scalar() or 0
    
    avg_tonage = total_tonage / total_transactions if total_transactions > 0 else 0
    
    return {
        "total_transactions": total_transactions,
        "total_tonage": float(round(total_tonage, 2)),
        "avg_tonage": float(round(avg_tonage, 2))
    }


def get_hauling_stats_mtd(db: Session, target_tonage: float = 500.0) -> dict:
    """
    Dapatkan statistik hauling transactions untuk Month-To-Date.
    - total_transactions: Jumlah transaksi bulan ini
    - total_tonage: Total net_weight bulan ini
    - target_tonage: Target tonase (default 500 ton)
    - achievement_percentage: Persentase achievement (actual/target * 100)
    """
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    query = db.query(HaulingTransaction).filter(
        HaulingTransaction.gate_in_time >= month_start,
        HaulingTransaction.gate_in_time <= now
    )
    
    total_transactions = query.count()
    total_tonage = db.query(func.sum(HaulingTransaction.net_weight)).filter(
        HaulingTransaction.gate_in_time >= month_start,
        HaulingTransaction.gate_in_time <= now
    ).scalar() or 0
    
    achievement_percentage = (total_tonage / target_tonage * 100) if target_tonage > 0 else 0
    
    return {
        "total_transactions": total_transactions,
        "total_tonage": float(round(total_tonage, 2)),
        "target_tonage": float(target_tonage),
        "achievement_percentage": float(round(achievement_percentage, 2))
    }