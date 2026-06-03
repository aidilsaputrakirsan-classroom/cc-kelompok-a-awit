from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, and_
from datetime import datetime, timedelta, date, timezone
import uuid
from fastapi.encoders import jsonable_encoder
from models import MasterVendor, MasterBlock, HaulingTransaction, HaulingTransactionLog, User, Item
from schemas import (
    VendorCreate, VendorUpdate, BlockCreate, BlockUpdate,
    HaulingTransactionCreate, HaulingTransactionUpdate, UserCreate,
    ItemCreate, ItemUpdate
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


def get_vendor_options(db: Session):
    """Ambil vendor aktif dalam format ringkas untuk dropdown."""
    vendors = (
        db.query(MasterVendor)
        .filter(MasterVendor.status.is_(True))
        .order_by(MasterVendor.name.asc())
        .all()
    )
    return [
        {"id": vendor.id, "name": vendor.name, "code": vendor.code}
        for vendor in vendors
    ]


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


def get_block_options(db: Session):
    """Ambil block aktif dalam format ringkas untuk dropdown."""
    blocks = (
        db.query(MasterBlock)
        .filter(MasterBlock.status.is_(True))
        .order_by(MasterBlock.block_code.asc())
        .all()
    )
    return [
        {"id": block.id, "name": block.division or block.block_code, "code": block.block_code, "area_ha": block.hectarage}
        for block in blocks
    ]


# ==================== HAULING TRANSACTION CRUD ====================

def _normalize_ticket_no(value: str) -> str:
    return value.strip()


def _normalize_vehicle_plate(value: str) -> str:
    return value.strip().upper()


def _get_user_name(db: Session, user_id: int | None) -> str | None:
    if user_id is None:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    return user.name if user else None


def _serialize_hauling(db: Session, hauling: HaulingTransaction) -> dict:
    return {
        "id": hauling.id,
        "ticket_no": hauling.ticket_no,
        "vehicle_plate": hauling.vehicle_plate,
        "vendor": None if hauling.vendor is None else {
            "id": hauling.vendor.id,
            "name": hauling.vendor.name,
            "code": hauling.vendor.code,
        },
        "block": None if hauling.block is None else {
            "id": hauling.block.id,
            "name": hauling.block.division or hauling.block.block_code,
            "code": hauling.block.block_code,
        },
        "weight_in": hauling.weight_in,
        "weight_out": hauling.weight_out,
        "net_weight": hauling.net_weight,
        "transaction_date": hauling.transaction_date,
        "notes": hauling.notes,
        "created_at": hauling.created_at,
        "created_by": _get_user_name(db, hauling.created_by),
        "updated_at": hauling.updated_at,
        "updated_by": _get_user_name(db, hauling.updated_by),
        "deleted_at": hauling.deleted_at,
        "deleted_by": _get_user_name(db, hauling.deleted_by),
        "status": hauling.status,
        "gate_in_time": hauling.gate_in_time,
        "gate_out_time": hauling.gate_out_time,
    }


def _audit_hauling_change(
    db: Session,
    hauling_id: uuid.UUID,
    action: str,
    performed_by: int,
    changed_fields: dict | None = None,
    old_values: dict | None = None,
    new_values: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    db_log = HaulingTransactionLog(
        transaction_id=hauling_id,
        action=action,
        changed_fields=jsonable_encoder(changed_fields) if changed_fields is not None else None,
        old_values=jsonable_encoder(old_values) if old_values is not None else None,
        new_values=jsonable_encoder(new_values) if new_values is not None else None,
        performed_by=performed_by,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(db_log)


def _base_hauling_query(db: Session):
    return db.query(HaulingTransaction).options(
        joinedload(HaulingTransaction.vendor),
        joinedload(HaulingTransaction.block),
    ).filter(HaulingTransaction.deleted_at.is_(None))


def _validate_ticket_unique(db: Session, ticket_no: str, hauling_id: uuid.UUID | None = None) -> bool:
    query = db.query(HaulingTransaction).filter(
        func.lower(HaulingTransaction.ticket_no) == ticket_no.lower(),
        HaulingTransaction.deleted_at.is_(None),
    )
    if hauling_id is not None:
        query = query.filter(HaulingTransaction.id != hauling_id)
    return query.first() is None


def _validate_vendor_block(db: Session, vendor_id: uuid.UUID, block_id: uuid.UUID) -> tuple[MasterVendor | None, MasterBlock | None]:
    vendor = db.query(MasterVendor).filter(MasterVendor.id == vendor_id, MasterVendor.status.is_(True)).first()
    block = db.query(MasterBlock).filter(MasterBlock.id == block_id, MasterBlock.status.is_(True)).first()
    return vendor, block


def create_hauling_transaction(
    db: Session,
    hauling_data: HaulingTransactionCreate,
    created_by: User,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    """Buat hauling transaction baru di database."""
    ticket_no = _normalize_ticket_no(hauling_data.ticket_no)
    vehicle_plate = _normalize_vehicle_plate(hauling_data.vehicle_plate)

    if not _validate_ticket_unique(db, ticket_no):
        return None, "duplicate_ticket"

    vendor, block = _validate_vendor_block(db, hauling_data.vendor_id, hauling_data.block_id)
    if vendor is None:
        return None, "invalid_vendor"
    if block is None:
        return None, "invalid_block"

    if hauling_data.weight_out > hauling_data.weight_in:
        return None, "invalid_weight"

    db_hauling = HaulingTransaction(
        ticket_no=ticket_no,
        vehicle_plate=vehicle_plate,
        vendor_id=hauling_data.vendor_id,
        block_id=hauling_data.block_id,
        weight_in=hauling_data.weight_in,
        weight_out=hauling_data.weight_out,
        net_weight=round(hauling_data.weight_in - hauling_data.weight_out, 3),
        transaction_date=hauling_data.transaction_date,
        notes=hauling_data.notes,
        status=hauling_data.status,
        gate_in_time=datetime.combine(hauling_data.transaction_date, datetime.min.time()).replace(tzinfo=timezone.utc),
        created_by=created_by.id,
        updated_by=created_by.id,
    )
    db.add(db_hauling)
    db.flush()
    _audit_hauling_change(
        db,
        db_hauling.id,
        "CREATE",
        created_by.id,
        new_values=_serialize_hauling(db, db_hauling),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    db.refresh(db_hauling)
    return _serialize_hauling(db, db_hauling), None


def get_hauling_transactions(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    ticket_no: str | None = None,
    vendor_id: uuid.UUID | None = None,
    block_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort_by: str = "transaction_date",
    sort_dir: str = "desc",
):
    """Ambil daftar hauling transactions dengan pagination, filter, dan sort."""
    query = _base_hauling_query(db)

    if ticket_no:
        query = query.filter(HaulingTransaction.ticket_no.ilike(f"%{ticket_no.strip()}%"))
    if vendor_id:
        query = query.filter(HaulingTransaction.vendor_id == vendor_id)
    if block_id:
        query = query.filter(HaulingTransaction.block_id == block_id)
    if date_from:
        query = query.filter(HaulingTransaction.transaction_date >= date_from)
    if date_to:
        query = query.filter(HaulingTransaction.transaction_date <= date_to)

    sort_map = {
        "ticket_no": HaulingTransaction.ticket_no,
        "vendor_name": MasterVendor.name,
        "block_code": MasterBlock.block_code,
        "weight_in": HaulingTransaction.weight_in,
        "weight_out": HaulingTransaction.weight_out,
        "net_weight": HaulingTransaction.net_weight,
        "transaction_date": HaulingTransaction.transaction_date,
    }
    sort_column = sort_map.get(sort_by, HaulingTransaction.transaction_date)
    if sort_by in {"vendor_name", "block_code"}:
        query = query.join(HaulingTransaction.vendor).join(HaulingTransaction.block)

    if sort_dir.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    offset = max(page - 1, 0) * per_page
    transactions = query.offset(offset).limit(per_page).all()
    total_pages = max((total + per_page - 1) // per_page, 1) if total else 0

    return {
        "success": True,
        "data": [_serialize_hauling(db, hauling) for hauling in transactions],
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
        },
    }


def get_hauling_transaction(db: Session, hauling_id: uuid.UUID):
    """Ambil satu hauling transaction berdasarkan ID."""
    hauling = _base_hauling_query(db).filter(HaulingTransaction.id == hauling_id).first()
    return None if hauling is None else _serialize_hauling(db, hauling)


def update_hauling_transaction(
    db: Session,
    hauling_id: uuid.UUID,
    hauling_data: HaulingTransactionUpdate,
    updated_by: User,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    """Update hauling transaction berdasarkan ID."""
    db_hauling = _base_hauling_query(db).filter(HaulingTransaction.id == hauling_id).first()
    if not db_hauling:
        return None, "not_found"

    update_data = hauling_data.model_dump(exclude_unset=True)
    if "ticket_no" in update_data:
        update_data["ticket_no"] = _normalize_ticket_no(update_data["ticket_no"])
        if not _validate_ticket_unique(db, update_data["ticket_no"], hauling_id=hauling_id):
            return None, "duplicate_ticket"
    if "vehicle_plate" in update_data:
        update_data["vehicle_plate"] = _normalize_vehicle_plate(update_data["vehicle_plate"])

    if "vendor_id" in update_data or "block_id" in update_data:
        vendor_id = update_data.get("vendor_id", db_hauling.vendor_id)
        block_id = update_data.get("block_id", db_hauling.block_id)
        vendor, block = _validate_vendor_block(db, vendor_id, block_id)
        if vendor is None:
            return None, "invalid_vendor"
        if block is None:
            return None, "invalid_block"

    old_values = {}
    changed_fields = {}
    for field, value in update_data.items():
        current_value = getattr(db_hauling, field)
        if current_value != value:
            old_values[field] = current_value
            changed_fields[field] = value
            setattr(db_hauling, field, value)

    if "weight_in" in update_data or "weight_out" in update_data:
        weight_in = update_data.get("weight_in", db_hauling.weight_in)
        weight_out = update_data.get("weight_out", db_hauling.weight_out)
        if weight_out > weight_in:
            return None, "invalid_weight"
        db_hauling.net_weight = round(weight_in - weight_out, 3)
        changed_fields["net_weight"] = db_hauling.net_weight

    if "transaction_date" in update_data:
        db_hauling.gate_in_time = datetime.combine(update_data["transaction_date"], datetime.min.time()).replace(tzinfo=timezone.utc)
        changed_fields["gate_in_time"] = db_hauling.gate_in_time

    db_hauling.updated_by = updated_by.id

    _audit_hauling_change(
        db,
        db_hauling.id,
        "UPDATE",
        updated_by.id,
        changed_fields=changed_fields or None,
        old_values=old_values or None,
        new_values=update_data,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    db.refresh(db_hauling)
    return _serialize_hauling(db, db_hauling), None


def delete_hauling_transaction(
    db: Session,
    hauling_id: uuid.UUID,
    deleted_by: User,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> bool:
    """Soft delete hauling transaction berdasarkan ID."""
    db_hauling = _base_hauling_query(db).filter(HaulingTransaction.id == hauling_id).first()
    if not db_hauling:
        return False

    db_hauling.deleted_at = datetime.now(timezone.utc)
    db_hauling.deleted_by = deleted_by.id
    _audit_hauling_change(
        db,
        db_hauling.id,
        "DELETE",
        deleted_by.id,
        old_values=_serialize_hauling(db, db_hauling),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return True


# ==================== ITEM CRUD ====================

def create_item(db: Session, item_data: ItemCreate) -> Item:
    """Buat item baru di database."""
    # Check if item code already exists
    existing = db.query(Item).filter(Item.code == item_data.code).first()
    if existing:
        return None
    
    db_item = Item(
        **item_data.model_dump()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_items(db: Session, skip: int = 0, limit: int = 20, search: str = None, 
              category: str = None, status: bool = None):
    """
    Ambil daftar items dengan pagination & filter.
    - skip: jumlah data yang di-skip
    - limit: jumlah data per halaman
    - search: cari berdasarkan code atau name
    - category: filter by category
    - status: filter by active status
    """
    query = db.query(Item)
    
    if search:
        query = query.filter(
            or_(
                Item.code.ilike(f"%{search}%"),
                Item.name.ilike(f"%{search}%")
            )
        )
    
    if category:
        query = query.filter(Item.category == category)
    
    if status is not None:
        query = query.filter(Item.status == status)
    
    total = query.count()
    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}


def get_item(db: Session, item_id: uuid.UUID) -> Item | None:
    """Ambil satu item berdasarkan ID."""
    return db.query(Item).filter(Item.id == item_id).first()


def update_item(db: Session, item_id: uuid.UUID, item_data: ItemUpdate) -> Item | None:
    """Update item berdasarkan ID."""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    if not db_item:
        return None
    
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: uuid.UUID) -> bool:
    """Hapus item berdasarkan ID. Return True jika berhasil."""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True


def get_item_stats(db: Session) -> dict:
    """Dapatkan statistik ringkas untuk items berdasarkan kategori."""
    total_items = db.query(func.count(Item.id)).scalar() or 0
    category_rows = (
        db.query(Item.category, func.count(Item.id))
        .filter(Item.category.isnot(None))
        .group_by(Item.category)
        .all()
    )
    items_by_category = {category: count for category, count in category_rows if category}

    return {
        "total_items": int(total_items),
        "total_categories": len(items_by_category),
        "items_by_category": items_by_category,
    }


# ==================== DASHBOARD STATS ====================

def get_hauling_stats_today(db: Session) -> dict:
    """
    Dapatkan statistik hauling transactions untuk hari ini.
    - total_transactions: Jumlah transaksi hari ini
    - total_tonage: Total net_weight hari ini
    - avg_tonage: Rata-rata net_weight hari ini
    """
    today_start = datetime.now().date()
    today_end = today_start + timedelta(days=1)
    
    query = db.query(HaulingTransaction).filter(
        and_(
            HaulingTransaction.deleted_at.is_(None),
            HaulingTransaction.transaction_date >= today_start,
            HaulingTransaction.transaction_date < today_end
        )
    )
    
    total_transactions = query.count()
    total_tonage = db.query(func.sum(HaulingTransaction.net_weight)).filter(
        and_(
            HaulingTransaction.deleted_at.is_(None),
            HaulingTransaction.transaction_date >= today_start,
            HaulingTransaction.transaction_date < today_end
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
    month_start = now.date().replace(day=1)
    
    query = db.query(HaulingTransaction).filter(
        HaulingTransaction.deleted_at.is_(None),
        HaulingTransaction.transaction_date >= month_start,
        HaulingTransaction.transaction_date <= now.date()
    )
    
    total_transactions = query.count()
    total_tonage = db.query(func.sum(HaulingTransaction.net_weight)).filter(
        HaulingTransaction.deleted_at.is_(None),
        HaulingTransaction.transaction_date >= month_start,
        HaulingTransaction.transaction_date <= now.date()
    ).scalar() or 0
    
    achievement_percentage = (total_tonage / target_tonage * 100) if target_tonage > 0 else 0
    
    return {
        "total_transactions": total_transactions,
        "total_tonage": float(round(total_tonage, 2)),
        "target_tonage": float(target_tonage),
        "achievement_percentage": float(round(achievement_percentage, 2))
    }