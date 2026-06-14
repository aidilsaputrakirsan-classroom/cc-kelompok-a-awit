"""Pydantic schemas for Auth Service."""
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        if len(v) > 128:
            raise ValueError("Password maksimal 128 karakter")
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Nama minimal 2 karakter")
        if len(v) > 200:
            raise ValueError("Nama maksimal 200 karakter")
        return v.strip()


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenVerifyResponse(BaseModel):
    user_id: int
    email: str
    name: str