"""
Item Service — Handles inventory management.
Berkomunikasi dengan Auth Service untuk verifikasi token.
"""
import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Item
from schemas import ItemCreate, ItemUpdate, ItemResponse, ItemListResponse, ItemStatsResponse
from auth_client import verify_token_with_auth_service, verify_token_optional
from sqlalchemy import func

import logging
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics

setup_logging()
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Item Service",
    description="Inventory microservice — CRUD items with auth via Auth Service",
    version="2.0.0",
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "item-service",
        "version": "2.0.0",
    }


@app.get("/metrics")
def get_metrics_endpoint():
    return metrics.get_metrics()


@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item_data: ItemCreate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Buat item baru — requires authentication."""
    item = Item(
        **item_data.model_dump(),
        owner_id=user["user_id"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/items", response_model=ItemListResponse)
async def get_items(
    search: str = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil daftar items milik user yang login."""
    query = db.query(Item).filter(Item.owner_id == user["user_id"])
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return ItemListResponse(total=total, items=items)


@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil item by ID."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    update_data: ItemUpdate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Update item."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Hapus item."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()


@app.get("/items/public", response_model=ItemListResponse)
async def get_public_items(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Ambil daftar items publik tanpa auth."""
    total = db.query(Item).count()
    items = db.query(Item).offset(skip).limit(limit).all()
    return ItemListResponse(total=total, items=items)


@app.get("/items/stats", response_model=ItemStatsResponse)
async def get_item_stats(
    user: dict | None = Depends(verify_token_optional),
    db: Session = Depends(get_db),
):
    """Ambil statistik item, mendukung degraded mode."""
    query = db.query(Item)
    degraded = False

    if user is None:
        # Degraded mode: Auth is down, no user info, show public stats
        degraded = True
    else:
        # Normal mode: Filter by user
        query = query.filter(Item.owner_id == user.get("user_id"))

    total_items = query.count()
    
    # Calculate aggregates
    total_value = db.query(func.sum(Item.price * Item.quantity)).filter(
        Item.owner_id == user.get("user_id") if user else True
    ).scalar() or 0.0
    
    highest_price = db.query(func.max(Item.price)).filter(
        Item.owner_id == user.get("user_id") if user else True
    ).scalar() or 0.0
    
    lowest_price = db.query(func.min(Item.price)).filter(
        Item.owner_id == user.get("user_id") if user else True
    ).scalar() or 0.0

    return ItemStatsResponse(
        total_items=total_items,
        total_value=float(total_value),
        highest_price=float(highest_price),
        lowest_price=float(lowest_price),
        degraded=degraded
    )