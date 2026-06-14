"""
PalmChain Database Models
Sistem Monitoring Rantai Pasok TBS (Tandan Buah Segar) Kelapa Sawit
"""

import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class MasterVendor(Base):
    """Model untuk Master Data Vendor Transport"""
    __tablename__ = "master_vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50))  # Transportir, Petani Swadaya, Inti
    phone = Column(String(15))
    email = Column(String(100))
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    blocks = relationship("MasterBlock", back_populates="vendor")
    hauling_transactions = relationship("HaulingTransaction", back_populates="vendor")


class MasterBlock(Base):
    """Model untuk Master Data Blok/Afdeling Panen"""
    __tablename__ = "master_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    block_code = Column(String(10), unique=True, nullable=False, index=True)
    division = Column(String(50))  # Afdeling
    hectarage = Column(Float)  # Luas area dalam hektar
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("master_vendors.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vendor = relationship("MasterVendor", back_populates="blocks")
    hauling_transactions = relationship("HaulingTransaction", back_populates="block")


class HaulingTransaction(Base):
    """Model untuk Transaksi Pengangkutan TBS"""
    __tablename__ = "hauling_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_no = Column(String(100), unique=True, nullable=False, index=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("master_vendors.id"), nullable=True)
    block_id = Column(UUID(as_uuid=True), ForeignKey("master_blocks.id"), nullable=True)
    vehicle_plate = Column(String(20), nullable=False)
    weight_in = Column(Float, nullable=False)  # Berat kotor (Ton)
    weight_out = Column(Float, nullable=False)  # Berat kosong (Ton)
    net_weight = Column(Float)  # Tonase TBS (calculated: weight_in - weight_out)
    transaction_date = Column(Date, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    gate_in_time = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    gate_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="completed")  # completed, pending, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    vendor = relationship("MasterVendor", back_populates="hauling_transactions")
    block = relationship("MasterBlock", back_populates="hauling_transactions")


class HaulingTransactionLog(Base):
    """Audit log untuk perubahan transaksi hauling"""
    __tablename__ = "hauling_transaction_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("hauling_transactions.id"), nullable=False, index=True)
    action = Column(String(20), nullable=False)
    changed_fields = Column(JSON, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    performed_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)


class Item(Base):
    """Model untuk Master Data Item dengan kategori"""
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True, index=True)  # Optional field untuk kategori
    price = Column(Float, default=0.0)
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class User(Base):
    """Model untuk User Authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(20), default="operator", nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
