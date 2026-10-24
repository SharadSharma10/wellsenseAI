"""
WellSense AI - Authentication & User Profile Routes
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.config import settings
from app.database.store import get_store, DataStore, verify_password
from app.security.auth import create_access_token, get_current_user
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, store: DataStore = Depends(get_store)):
    existing = store.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    new_user = store.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role,
        department=user_data.department or "",
        year=user_data.year or ""
    )
    
    token = create_access_token(data={"sub": new_user["id"], "role": new_user["role"]})
    user_dict = {k: v for k, v in new_user.items() if k != "hashed_password"}
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, store: DataStore = Depends(get_store)):
    user = store.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    user_dict = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/token")
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), store: DataStore = Depends(get_store)):
    user = store.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_dict = {k: v for k, v in current_user.items() if k != "hashed_password"}
    user_dict["consent_data_collection"] = bool(user_dict.get("consent_data_collection", 1))
    user_dict["consent_wearable_telemetry"] = bool(user_dict.get("consent_wearable_telemetry", 1))
    user_dict["consent_counsellor_sharing"] = bool(user_dict.get("consent_counsellor_sharing", 1))
    return user_dict

@router.get("/demo-credentials")
def get_demo_credentials():
    """Return pre-seeded credentials for convenient evaluation during demonstration."""
    return {
        "student": {
            "email": "student@wellsense.edu",
            "password": "Student@123",
            "name": "Aarav Sharma",
            "role": "student"
        },
        "counsellor": {
            "email": "counsellor@wellsense.edu",
            "password": "Counsellor@123",
            "name": "Dr. Meenakshi Rao",
            "role": "counsellor"
        },
        "admin": {
            "email": "admin@wellsense.edu",
            "password": "Admin@123",
            "name": "Campus Wellness Administrator",
            "role": "admin"
        }
    }
