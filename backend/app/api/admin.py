"""
WellSense AI - Administrator Aggregate Analytics API
Provides campus-wide, strictly anonymized well-being insights and department trends.
Restricted to Administrator role.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from app.database.store import get_store, DataStore
from app.security.auth import require_role

router = APIRouter(prefix="/admin", tags=["Campus Admin Analytics"])

@router.get("/overview")
def get_admin_overview(
    current_user: dict = Depends(require_role(["admin"])),
    store: DataStore = Depends(get_store)
):
    """
    Returns campus-wide anonymized aggregate mental health indicators.
    Never exposes individual student names or specific screening forms.
    """
    analytics = store.get_admin_analytics()
    
    # 14-day campus trend (aggregate mean scores)
    campus_trend = [
        {"day": "Day 1", "avg_wellness_score": 74.2, "high_risk_pct": 11.2},
        {"day": "Day 2", "avg_wellness_score": 73.8, "high_risk_pct": 11.5},
        {"day": "Day 3", "avg_wellness_score": 72.1, "high_risk_pct": 12.8},
        {"day": "Day 4", "avg_wellness_score": 70.4, "high_risk_pct": 14.1},
        {"day": "Day 5", "avg_wellness_score": 68.9, "high_risk_pct": 15.6}, # Mid-term exam spike
        {"day": "Day 6", "avg_wellness_score": 69.2, "high_risk_pct": 15.2},
        {"day": "Day 7", "avg_wellness_score": 71.5, "high_risk_pct": 13.0},
        {"day": "Day 8", "avg_wellness_score": 73.0, "high_risk_pct": 12.1},
        {"day": "Day 9", "avg_wellness_score": 74.5, "high_risk_pct": 10.8},
        {"day": "Day 10", "avg_wellness_score": 75.1, "high_risk_pct": 10.2},
        {"day": "Day 11", "avg_wellness_score": 73.6, "high_risk_pct": 11.9},
        {"day": "Day 12", "avg_wellness_score": 72.8, "high_risk_pct": 12.5},
        {"day": "Day 13", "avg_wellness_score": 73.4, "high_risk_pct": 11.8},
        {"day": "Day 14", "avg_wellness_score": 74.0, "high_risk_pct": 11.4}
    ]

    analytics["campus_trend"] = campus_trend
    return analytics
