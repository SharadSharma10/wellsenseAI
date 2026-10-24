"""
WellSense AI - Application Configuration
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "WellSense AI - Student Mental Well-Being Screening Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wellsense-super-secret-key-student-screening-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Storage
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "wellsense.db")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
