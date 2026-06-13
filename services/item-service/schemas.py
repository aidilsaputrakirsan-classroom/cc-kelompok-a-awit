"""Pydantic schemas for Item Service."""
from pydantic import BaseModel, field_validator
from typing import Optional


class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    quantity: Optional[int] = 0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 1:
            raise ValueError("Nama item tidak boleh kosong")
        if len(v) > 300:
            raise ValueError("Nama item maksimal 300 karakter")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        if v and len(v) > 2000:
            raise ValueError("Deskripsi maksimal 2000 karakter")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError("Harga tidak boleh negatif")
        if v > 999_999_999:
            raise ValueError("Harga terlalu besar")
        return round(v, 2)

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity tidak boleh negatif")
        if v is not None and v > 999_999:
            raise ValueError("Quantity terlalu besar")
        return v


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int
    owner_id: int

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    total: int
    items: list[ItemResponse]


class ItemStatsResponse(BaseModel):
    total_items: int
    total_value: float
    highest_price: float
    lowest_price: float
    degraded: bool = False