"""
Unit & Integration Tests - ML Prediction & Explainability
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VALID_STUDENT_PAYLOAD = {
    "phq9_score": 6,
    "gad7_score": 5,
    "perceived_stress": 7,
    "academic_pressure": 3,
    "study_hours_per_day": 5.5,
    "sleep_hours": 7.0,
    "sleep_efficiency": 85.0,
    "resting_heart_rate": 68.0,
    "daily_steps": 8000,
    "physical_activity_minutes": 35,
    "social_support_score": 4,
    "financial_stress": 2
}

HIGH_DISTRESS_PAYLOAD = {
    "phq9_score": 18,
    "gad7_score": 16,
    "perceived_stress": 14,
    "academic_pressure": 5,
    "study_hours_per_day": 8.0,
    "sleep_hours": 4.5,
    "sleep_efficiency": 60.0,
    "resting_heart_rate": 88.0,
    "daily_steps": 2500,
    "physical_activity_minutes": 10,
    "social_support_score": 1,
    "financial_stress": 5
}

def test_predict_endpoint_valid_input():
    response = client.post("/predict", json=VALID_STUDENT_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    
    # Verify required keys in response
    assert "predicted_tier" in data
    assert "tier_label" in data
    assert "wellness_score" in data
    assert "class_probabilities" in data
    assert "top_contributing_factors" in data
    assert "recommendations" in data
    assert "disclaimer" in data
    
    # Assert score is bounded 0 to 100
    assert 0.0 <= data["wellness_score"] <= 100.0
    # Assert feature attributions are present
    assert len(data["top_contributing_factors"]) > 0
    assert "insight" in data["top_contributing_factors"][0]

def test_predict_endpoint_high_distress():
    response = client.post("/predict", json=HIGH_DISTRESS_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_tier"] == 2
    assert data["tier_label"] == "High Risk"
    assert data["requires_counsellor_outreach"] is True
    assert data["wellness_score"] < 40.0

def test_predict_endpoint_missing_feature():
    # Omitting sleep_hours should trigger 422 Unprocessable Entity
    invalid_payload = VALID_STUDENT_PAYLOAD.copy()
    del invalid_payload["sleep_hours"]
    
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422

def test_predict_endpoint_out_of_bounds():
    # PHQ-9 cannot be greater than 27
    invalid_payload = VALID_STUDENT_PAYLOAD.copy()
    invalid_payload["phq9_score"] = 99
    
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422
