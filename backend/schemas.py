from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime, date
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


class VendorListResponse(BaseModel):
    """Schema untuk response list vendors"""
    success: bool = True
    data: Optional[List["VendorOption"]] = None
    total: Optional[int] = None
    vendors: Optional[List[VendorResponse]] = None


class VendorOption(BaseModel):
    """Schema ringan untuk dropdown vendor"""
    id: uuid.UUID
    name: str
    code: str


class VendorOptionListResponse(BaseModel):
    """Schema untuk response dropdown vendor"""
    success: bool = True
    data: List[VendorOption]


# ============================================================
# BLOCK/AFDELING SCHEMAS
# ============================================================

class BlockBase(BaseModel):
    """Base schema untuk Block"""
    block_code: str = Field(..., min_length=1, max_length=10)
    division: Optional[str] = None
    hectarage: Optional[float] = Field(None, ge=0)
    vendor_id: Optional[uuid.UUID] = None
    status: bool = Field(default=True)


class BlockCreate(BlockBase):
    """Schema untuk create block"""
    pass


class BlockUpdate(BaseModel):
    """Schema untuk update block"""
    division: Optional[str] = None
    hectarage: Optional[float] = None
    vendor_id: Optional[uuid.UUID] = None
    status: Optional[bool] = None


class BlockResponse(BlockBase):
    """Schema untuk response block"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BlockListResponse(BaseModel):
    """Schema untuk response list blocks"""
    success: bool = True
    data: Optional[List["BlockOption"]] = None
    total: Optional[int] = None
    blocks: Optional[List[BlockResponse]] = None


class BlockOption(BaseModel):
    """Schema ringan untuk dropdown block"""
    id: uuid.UUID
    name: str
    code: str
    area_ha: Optional[float] = None


class BlockOptionListResponse(BaseModel):
    """Schema untuk response dropdown block"""
    success: bool = True
    data: List[BlockOption]


# ============================================================
# HAULING TRANSACTION SCHEMAS
# ============================================================

class HaulingTransactionBase(BaseModel):
    """Base schema untuk Hauling Transaction"""
    ticket_no: str = Field(..., min_length=1, max_length=100)
    vehicle_plate: str = Field(..., min_length=1, max_length=20)
    weight_in: float = Field(..., ge=0, le=9999.999)
    weight_out: float = Field(..., ge=0)
    transaction_date: date = Field(...)
    notes: Optional[str] = Field(None, max_length=500)


class HaulingTransactionVendorRef(BaseModel):
    id: uuid.UUID
    name: str
    code: str


class HaulingTransactionBlockRef(BaseModel):
    id: uuid.UUID
    name: str
    code: str


class HaulingTransactionCreate(HaulingTransactionBase):
    """Schema untuk create hauling transaction"""
    vendor_id: uuid.UUID
    block_id: uuid.UUID
    status: str = Field(default="completed")

    @field_validator("ticket_no")
    @classmethod
    def normalize_ticket_no(cls, value):
        return value.strip()

    @field_validator("vehicle_plate")
    @classmethod
    def normalize_vehicle_plate(cls, value):
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_business_rules(self):
        if self.transaction_date > date.today():
            raise ValueError("Tanggal tidak boleh masa depan")
        if self.weight_out > self.weight_in:
            raise ValueError("Weight Out tidak boleh melebihi Weight In")
        return self


class HaulingTransactionUpdate(BaseModel):
    """Schema untuk update hauling transaction"""
    ticket_no: Optional[str] = Field(None, max_length=100)
    vehicle_plate: Optional[str] = Field(None, max_length=20)
    vendor_id: Optional[uuid.UUID] = None
    block_id: Optional[uuid.UUID] = None
    weight_in: Optional[float] = Field(None, ge=0, le=9999.999)
    weight_out: Optional[float] = Field(None, ge=0)
    transaction_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = None
    gate_out_time: Optional[datetime] = None

    @field_validator("ticket_no")
    @classmethod
    def normalize_ticket_no(cls, value):
        return value.strip() if value else value

    @field_validator("vehicle_plate")
    @classmethod
    def normalize_vehicle_plate(cls, value):
        return value.strip().upper() if value else value

    @model_validator(mode="after")
    def validate_weight_pair(self):
        if self.transaction_date is not None and self.transaction_date > date.today():
            raise ValueError("Tanggal tidak boleh masa depan")
        if self.weight_in is not None and self.weight_out is not None and self.weight_out > self.weight_in:
            raise ValueError("Weight Out tidak boleh melebihi Weight In")
        return self


class HaulingTransactionResponse(BaseModel):
    """Schema untuk response hauling transaction"""
    id: uuid.UUID
    ticket_no: str
    vehicle_plate: str
    vendor: Optional[HaulingTransactionVendorRef] = None
    block: Optional[HaulingTransactionBlockRef] = None
    weight_in: float
    weight_out: float
    net_weight: float
    transaction_date: date
    notes: Optional[str] = None
    created_at: datetime
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None
    status: Optional[str] = None
    gate_in_time: Optional[datetime] = None
    gate_out_time: Optional[datetime] = None


class HaulingTransactionMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class HaulingTransactionEnvelope(BaseModel):
    success: bool = True
    data: HaulingTransactionResponse


class HaulingTransactionListResponse(BaseModel):
    """Schema untuk response list hauling transactions"""
    success: bool = True
    data: List[HaulingTransactionResponse]
    meta: HaulingTransactionMeta

    class Config:
        from_attributes = True


# ============================================================
# ITEM SCHEMAS
# ============================================================

class ItemBase(BaseModel):
    """Base schema untuk Item"""
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=50)
    status: bool = Field(default=True)


class ItemCreate(ItemBase):
    """Schema untuk create item"""
    pass


class ItemUpdate(BaseModel):
    """Schema untuk update item"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[bool] = None


class ItemResponse(ItemBase):
    """Schema untuk response item"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    """Schema untuk response list items"""
    total: int
    items: List[ItemResponse]


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
    role: str
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
    