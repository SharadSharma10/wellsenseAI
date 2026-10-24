"""
WellSense AI - Counsellor Triage & Appointment Management API
Restricted to Counsellor and Administrator roles. Respects student privacy consents.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.database.store import get_store, DataStore
from app.security.auth import get_current_user, require_role
from app.schemas.assessment import AppointmentCreateRequest, AppointmentStatusUpdateRequest

router = APIRouter(prefix="/counsellor", tags=["Counsellor Triage"])

class CounsellorNoteRequest(BaseModel):
    assessment_id: str
    notes: str

@router.get("/triage-queue")
def get_triage_queue(
    current_user: dict = Depends(require_role(["counsellor", "admin"])),
    store: DataStore = Depends(get_store)
):
    """
    Returns student triage queue sorted by clinical severity (lowest wellness score first).
    Only includes students who have consented to counsellor sharing (`consent_counsellor_sharing = 1`).
    """
    queue = store.get_counsellor_triage_queue()
    
    # Filter based on consent
    consented_students = [s for s in queue if s.get("consent_counsellor_sharing", 1)]
    
    return {
        "total_in_queue": len(consented_students),
        "students": consented_students,
        "disclaimer": "Student records are displayed strictly for proactive campus mental health triage."
    }

@router.get("/appointments")
def get_appointments(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    all_apts = store.get_all_appointments()
    # If student, only return their own appointments
    if current_user["role"] == "student":
        return [a for a in all_apts if a["student_id"] == current_user["id"]]
    # Counsellors and admins can view all
    return all_apts

@router.post("/appointments")
def create_appointment(
    request: AppointmentCreateRequest,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Books a confidential wellness counselling session.
    Can be initiated by the student or scheduled by a counsellor.
    """
    student_id = current_user["id"]
    student_name = current_user["full_name"]

    apt = store.create_appointment(
        student_id=student_id,
        student_name=student_name,
        scheduled_time=request.scheduled_time,
        notes=request.notes or "",
        urgency=request.urgency
    )
    return {"success": True, "appointment": apt}

@router.patch("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    request: AppointmentStatusUpdateRequest,
    current_user: dict = Depends(require_role(["counsellor", "admin"])),
    store: DataStore = Depends(get_store)
):
    store.update_appointment_status(appointment_id, request.status, request.notes)
    updated = store.get_appointment_by_id(appointment_id)
    return {"success": True, "appointment": updated}

@router.post("/notes")
def save_counsellor_note(
    request: CounsellorNoteRequest,
    current_user: dict = Depends(require_role(["counsellor", "admin"])),
    store: DataStore = Depends(get_store)
):
    with store._get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE assessments SET counsellor_notes = ? WHERE id = ?", (request.notes, request.assessment_id))
        conn.commit()
    return {"success": True, "message": "Counsellor notes updated successfully."}
