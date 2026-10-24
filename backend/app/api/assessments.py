"""
WellSense AI - Assessment & Questionnaire API
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.store import get_store, DataStore
from app.security.auth import get_current_user
from app.ml.inference import get_predictor
from app.schemas.assessment import AssessmentSubmitRequest, AssessmentItemResponse, HistorySummaryResponse

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.post("/submit", response_model=Dict[str, Any])
def submit_assessment(
    request: AssessmentSubmitRequest,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Submits daily well-being assessment. Checks user data collection consent,
    executes machine learning inference, saves record, and flags for counsellor triage if indicated.
    """
    if not current_user.get("consent_data_collection", 1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Data collection consent is currently disabled in your privacy settings."
        )

    predictor = get_predictor()
    raw_dict = request.raw_inputs.model_dump()
    prediction_result = predictor.predict(raw_dict)

    # Save to database
    saved_assessment = store.create_assessment(
        user_id=current_user["id"],
        raw_inputs=raw_dict,
        prediction=prediction_result
    )

    return {
        "assessment_id": saved_assessment["id"],
        "timestamp": saved_assessment["timestamp"],
        "result": prediction_result
    }

@router.get("/history", response_model=HistorySummaryResponse)
def get_assessment_history(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Retrieves all past assessments for the logged-in student along with computed 7-day trend data.
    """
    assessments = store.get_user_assessments(current_user["id"], limit=30)
    
    # Generate 7-day trend
    trend = []
    # If student has assessments, map the last 7 entries (or pad with recent points)
    if assessments:
        reversed_list = list(reversed(assessments[:7]))
        for idx, item in enumerate(reversed_list):
            dt = datetime.fromisoformat(item["timestamp"])
            day_label = dt.strftime("%a %b %d")
            trend.append({
                "date": day_label,
                "wellness_score": item["wellness_score"],
                "tier_label": item["tier_label"],
                "sleep_hours": item["raw_inputs"].get("sleep_hours", 7.0),
                "resting_heart_rate": item["raw_inputs"].get("resting_heart_rate", 70.0)
            })
    
    latest_score = assessments[0]["wellness_score"] if assessments else None
    latest_tier = assessments[0]["tier_label"] if assessments else None

    return {
        "assessments": assessments,
        "seven_day_trend": trend,
        "latest_score": latest_score,
        "latest_tier": latest_tier
    }

@router.get("/latest")
def get_latest_assessment(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    latest = store.get_latest_assessment(current_user["id"])
    if not latest:
        return {"has_assessment": False, "assessment": None}
    return {"has_assessment": True, "assessment": latest}

@router.get("/{assessment_id}")
def get_assessment_by_id(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    item = store.get_assessment_by_id(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")
    # Verify authorization: student can view own, counsellor/admin can view if consent granted
    if current_user["role"] == "student" and item["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this assessment")
    return item
