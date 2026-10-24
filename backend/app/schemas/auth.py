"""
WellSense AI - Authentication and Profile Schemas
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = Field(default="student", pattern="^(student|counsellor|admin)$")
    department: Optional[str] = "Computer Science"
    year: Optional[str] = "3rd Year"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department: Optional[str] = ""
    year: Optional[str] = ""
    created_at: str
    consent_data_collection: bool
    consent_wearable_telemetry: bool
    consent_counsellor_sharing: bool

class ConsentUpdate(BaseModel):
    consent_data_collection: bool
    consent_wearable_telemetry: bool
    consent_counsellor_sharing: bool
