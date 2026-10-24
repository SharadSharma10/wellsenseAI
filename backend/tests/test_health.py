"""
Unit & Integration Tests - Health and Model Info
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "WellSense AI" in data["message"]
    assert data["health_url"] == "/health"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "screening aid" in data["disclaimer"]

def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "test_metrics" in data
    assert "accuracy" in data["test_metrics"]
    assert len(data["features_expected"]) == 12
