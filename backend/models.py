"""
PalmChain Database Models
Sistem Monitoring Rantai Pasok TBS (Tandan Buah Segar) Kelapa Sawit
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import uuid


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
    hauling_transactions = relationship("HaulingTransaction", back_populates="vendor")


class MasterBlock(Base):
    """Model untuk Master Data Blok/Afdeling Panen"""
    __tablename__ = "master_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    block_code = Column(String(10), unique=True, nullable=False, index=True)
    division = Column(String(50))  # Afdeling
    hectarage = Column(Float)  # Luas area dalam hektar
    status = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    hauling_transactions = relationship("HaulingTransaction", back_populates="block")


class HaulingTransaction(Base):
    """Model untuk Transaksi Pengangkutan TBS"""
    __tablename__ = "hauling_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_no = Column(String(20), unique=True, nullable=False, index=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("master_vendors.id"), nullable=True)
    block_id = Column(UUID(as_uuid=True), ForeignKey("master_blocks.id"), nullable=True)
    vehicle_plate = Column(String(15), nullable=False)
    weight_in = Column(Float, nullable=False)  # Berat kotor (Ton)
    weight_out = Column(Float, nullable=False)  # Berat kosong (Ton)
    net_weight = Column(Float)  # Tonase TBS (calculated: weight_in - weight_out)
    gate_in_time = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    gate_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="completed")  # completed, pending, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vendor = relationship("MasterVendor", back_populates="hauling_transactions")
    block = relationship("MasterBlock", back_populates="hauling_transactions")


class User(Base):
    """Model untuk User Authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())