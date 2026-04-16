from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re
import uuid


# ============================================================
# VENDOR SCHEMAS
# ============================================================

class VendorBase(BaseModel):
    """Base schema untuk Vendor"""
    code: str = Field(..., min_length=1, max_length=10)
    name: str = Field(..., min_length=1, max_length=100)
    type: Optional[str] = Field(None)
    phone: Optional[str] = Field(None)
    email: Optional[str] = Field(None)
    status: bool = Field(default=True)


class VendorCreate(VendorBase):
    """Schema untuk create vendor"""
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v


class VendorUpdate(BaseModel):
    """Schema untuk update vendor"""
    name: Optional[str] = None
    type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[bool] = None


class VendorResponse(VendorBase):
    """Schema untuk response vendor"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# BLOCK/AFDELING SCHEMAS
# ============================================================

class BlockBase(BaseModel):
    """Base schema untuk Block"""
    block_code: str = Field(..., min_length=1, max_length=10)
    division: Optional[str] = None
    hectarage: Optional[float] = Field(None, ge=0)
    status: bool = Field(default=True)


class BlockCreate(BlockBase):
    """Schema untuk create block"""
    pass


class BlockUpdate(BaseModel):
    """Schema untuk update block"""
    division: Optional[str] = None
    hectarage: Optional[float] = None
    status: Optional[bool] = None


class BlockResponse(BlockBase):
    """Schema untuk response block"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# HAULING TRANSACTION SCHEMAS
# ============================================================

class HaulingTransactionBase(BaseModel):
    """Base schema untuk Hauling Transaction"""
    ticket_no: str = Field(..., min_length=1, max_length=20)
    vehicle_plate: str = Field(..., min_length=1, max_length=15)
    weight_in: float = Field(..., gt=0)
    weight_out: float = Field(..., ge=0)


class HaulingTransactionCreate(HaulingTransactionBase):
    """Schema untuk create hauling transaction"""
    vendor_id: Optional[uuid.UUID] = None
    block_id: Optional[uuid.UUID] = None
    status: str = Field(default="completed")


class HaulingTransactionUpdate(BaseModel):
    """Schema untuk update hauling transaction"""
    status: Optional[str] = None
    gate_out_time: Optional[datetime] = None


class HaulingTransactionResponse(HaulingTransactionBase):
    """Schema untuk response hauling transaction"""
    id: uuid.UUID
    vendor_id: Optional[uuid.UUID] = None
    block_id: Optional[uuid.UUID] = None
    net_weight: float
    gate_in_time: datetime
    gate_out_time: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HaulingTransactionListResponse(BaseModel):
    """Schema untuk response list hauling transactions"""
    total: int
    transactions: List[HaulingTransactionResponse]


# ============================================================
# DASHBOARD SCHEMAS
# ============================================================

class DashboardTodayStats(BaseModel):
    """Schema untuk statistik hari ini"""
    total_transactions: int
    total_tonage: float
    avg_tonage: float


class DashboardMTDStats(BaseModel):
    """Schema untuk statistik Month-To-Date"""
    total_transactions: int
    total_tonage: float
    target_tonage: float
    achievement_percentage: float


class DashboardResponse(BaseModel):
    """Schema untuk Dashboard Summary"""
    today: DashboardTodayStats
    mtd: DashboardMTDStats
    last_updated: datetime


# ============================================================
# AUTH SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    """Schema untuk registrasi user baru."""
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100, examples=["Aidil Saputra"])
    password: str = Field(..., min_length=8, examples=["Password123!"])

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validasi format email — harus ITK atau umum."""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Format email tidak valid. Gunakan format: user@example.com')
        return v.lower()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """
        Validasi password strength:
        - Minimal 8 karakter
        - Harus mengandung huruf (A-Z, a-z)
        - Harus mengandung angka (0-9)
        - Harus mengandung special character (!@#$%^&*)
        """
        if len(v) < 8:
            raise ValueError('Password minimal 8 karakter')
        
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Password harus mengandung huruf (A-Z, a-z)')
        
        if not re.search(r'[0-9]', v):
            raise ValueError('Password harus mengandung angka (0-9)')
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', v):
            raise ValueError('Password harus mengandung special character (!@#$%^&*)')
        
        return v


class UserResponse(BaseModel):
    """Schema untuk response user (tanpa password)."""
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema untuk login request."""
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    password: str = Field(..., examples=["password123"])


class TokenResponse(BaseModel):
    """Schema untuk response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    