"""
Unit & Integration Tests - Auth, Roles, Wearables, and Privacy
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_demo_student():
    response = client.post("/api/auth/login", json={
        "email": "student@wellsense.edu",
        "password": "Student@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_login_demo_counsellor():
    response = client.post("/api/auth/login", json={
        "email": "counsellor@wellsense.edu",
        "password": "Counsellor@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "counsellor"

def test_role_restricted_admin_endpoint_forbidden_for_student():
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "email": "student@wellsense.edu",
        "password": "Student@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try accessing admin overview
    admin_res = client.get("/api/admin/overview", headers=headers)
    assert admin_res.status_code == 403

def test_wearable_connect_and_disconnect():
    # Login as student
    login_res = client.post("/api/auth/login", json={
        "email": "student@wellsense.edu",
        "password": "Student@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Connect Fitbit
    conn_res = client.post("/api/wearables/connect", json={
        "provider": "fitbit",
        "grant_consent": True
    }, headers=headers)
    assert conn_res.status_code == 200
    conn_data = conn_res.json()
    assert conn_data["status"] == "connected"
    assert conn_data["is_simulated"] is True
    assert "resting_heart_rate" in conn_data["telemetry"]

    # Check status
    status_res = client.get("/api/wearables/status", headers=headers)
    assert status_res.status_code == 200

    # Disconnect
    disc_res = client.post("/api/wearables/disconnect", json={
        "provider": "fitbit"
    }, headers=headers)
    assert disc_res.status_code == 200
