"""
WellSense AI - Privacy, Consent & GDPR Compliance API
Handles user consent management, data minimization, data export, and right to be forgotten.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.store import get_store, DataStore
from app.security.auth import get_current_user
from app.schemas.auth import ConsentUpdate

router = APIRouter(prefix="/privacy", tags=["Privacy & Consent"])

@router.get("/settings")
def get_privacy_settings(current_user: dict = Depends(get_current_user)):
    return {
        "consent_data_collection": bool(current_user.get("consent_data_collection", 1)),
        "consent_wearable_telemetry": bool(current_user.get("consent_wearable_telemetry", 1)),
        "consent_counsellor_sharing": bool(current_user.get("consent_counsellor_sharing", 1)),
        "data_retention_days": 180,
        "encryption_standard": "AES-256 at rest, TLS 1.3 in transit",
        "anonymized_for_research": True
    }

@router.post("/consent")
def update_consent(
    request: ConsentUpdate,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    store.update_user_consent(
        user_id=current_user["id"],
        data_collection=request.consent_data_collection,
        wearable=request.consent_wearable_telemetry,
        counsellor=request.consent_counsellor_sharing
    )
    return {
        "success": True,
        "message": "Privacy and consent preferences updated successfully.",
        "settings": request.model_dump()
    }

@router.get("/export-data")
def export_user_data(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Exports all personal records associated with the logged-in student (Right to Data Portability).
    """
    assessments = store.get_user_assessments(current_user["id"], limit=500)
    wearables = store.get_user_wearables(current_user["id"])
    
    clean_user = {k: v for k, v in current_user.items() if k != "hashed_password"}
    
    return {
        "export_metadata": {
            "format": "JSON",
            "version": "1.0",
            "exported_at": current_user.get("created_at")
        },
        "student_profile": clean_user,
        "assessments_history": assessments,
        "connected_wearables": wearables
    }

@router.delete("/delete-account")
def delete_account(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Permanently deletes user profile, assessment history, and wearable telemetry (Right to Erasure).
    """
    store.delete_user_data(current_user["id"])
    return {
        "success": True,
        "message": "All your personal data, assessments, and connected device information have been permanently erased."
    }
