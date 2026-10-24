"""
WellSense AI - Prediction and Model Transparency Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict

class PredictRequest(BaseModel):
    phq9_score: int = Field(..., ge=0, le=27, description="Patient Health Questionnaire (0-27)")
    gad7_score: int = Field(..., ge=0, le=21, description="Generalized Anxiety Disorder Scale (0-21)")
    perceived_stress: int = Field(..., ge=0, le=16, description="Perceived Stress Scale equivalent (0-16)")
    academic_pressure: int = Field(..., ge=1, le=5, description="Academic Pressure Likert scale (1-5)")
    study_hours_per_day: float = Field(..., ge=0.5, le=18.0, description="Daily study hours")
    sleep_hours: float = Field(..., ge=2.0, le=16.0, description="Nightly sleep duration in hours")
    sleep_efficiency: float = Field(..., ge=20.0, le=100.0, description="Sleep efficiency percentage (20-100)")
    resting_heart_rate: float = Field(..., ge=40.0, le=160.0, description="Resting heart rate in bpm")
    daily_steps: int = Field(..., ge=0, le=50000, description="Daily step count")
    physical_activity_minutes: int = Field(..., ge=0, le=360, description="Daily active minutes")
    social_support_score: int = Field(..., ge=1, le=5, description="Perceived social connection (1-5)")
    financial_stress: int = Field(..., ge=1, le=5, description="Financial strain (1-5)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "phq9_score": 5,
                "gad7_score": 4,
                "perceived_stress": 6,
                "academic_pressure": 3,
                "study_hours_per_day": 6.0,
                "sleep_hours": 7.2,
                "sleep_efficiency": 88.0,
                "resting_heart_rate": 68.0,
                "daily_steps": 8500,
                "physical_activity_minutes": 40,
                "social_support_score": 4,
                "financial_stress": 2
            }
        }
    )

class FeatureContribution(BaseModel):
    feature: str
    display_name: str
    description: str
    raw_value: float
    impact_score: float
    importance_percentage: float
    is_risk_factor: bool
    insight: str

class Recommendation(BaseModel):
    category: str
    title: str
    description: str
    action_type: str
    badge: str

class PredictResponse(BaseModel):
    predicted_tier: int
    tier_label: str
    tier_color: str
    tier_severity: str
    wellness_score: float
    class_probabilities: Dict[str, float]
    top_contributing_factors: List[FeatureContribution]
    all_feature_contributions: List[FeatureContribution]
    recommendations: List[Recommendation]
    requires_counsellor_outreach: bool
    disclaimer: str

class ModelInfoResponse(BaseModel):
    model_version: str
    model_name: str
    algorithm: str
    features_expected: List[str]
    test_metrics: Dict[str, Any]
    dataset_split: Dict[str, Any]
    disclaimer: str
