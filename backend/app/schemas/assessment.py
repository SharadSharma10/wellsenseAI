"""
WellSense AI - Assessment, Wearables, and Counsellor Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.predict import PredictRequest, PredictResponse

class AssessmentSubmitRequest(BaseModel):
    raw_inputs: PredictRequest

class AssessmentItemResponse(BaseModel):
    id: str
    user_id: str
    timestamp: str
    tier_label: str
    tier_severity: str
    tier_color: str
    wellness_score: float
    raw_inputs: Dict[str, Any]
    prediction_result: Dict[str, Any]
    counsellor_notes: Optional[str] = None
    flagged_for_triage: int

class HistorySummaryResponse(BaseModel):
    assessments: List[AssessmentItemResponse]
    seven_day_trend: List[Dict[str, Any]]
    latest_score: Optional[float] = None
    latest_tier: Optional[str] = None

class WearableConnectRequest(BaseModel):
    provider: str = Field(..., pattern="^(fitbit|google_health|apple_health)$")
    grant_consent: bool = True

class WearableSyncRequest(BaseModel):
    provider: str

class WearableStatusResponse(BaseModel):
    provider: str
    status: str
    last_sync: Optional[str] = None
    sync_error: Optional[str] = None
    telemetry: Optional[Dict[str, Any]] = None
    is_simulated: bool

class AppointmentCreateRequest(BaseModel):
    scheduled_time: str
    notes: Optional[str] = "Routine support consultation"
    urgency: str = Field(default="normal", pattern="^(normal|elevated|urgent)$")

class AppointmentStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|completed|cancelled)$")
    notes: Optional[str] = None
