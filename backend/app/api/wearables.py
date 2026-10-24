"""
WellSense AI - Wearable Device Integration API
Provides integration interfaces for Fitbit Web API, Google Health Connect, and Apple HealthKit.
Clearly labels simulated telemetry and handles consent, sync failures, and disconnection.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.store import get_store, DataStore
from app.security.auth import get_current_user
from app.schemas.assessment import WearableConnectRequest, WearableSyncRequest

router = APIRouter(prefix="/wearables", tags=["Wearable Integration"])

SUPPORTED_PROVIDERS = {
    "fitbit": {
        "name": "Fitbit (Google)",
        "protocol": "OAuth 2.0 PKCE",
        "scopes": ["activity", "heartrate", "sleep"],
        "bridge_type": "Cloud REST API"
    },
    "google_health": {
        "name": "Google Health Connect",
        "protocol": "Android Jetpack Health Connect API",
        "scopes": ["Steps", "HeartRate", "SleepSession"],
        "bridge_type": "Native Android Bridge"
    },
    "apple_health": {
        "name": "Apple Health (HealthKit)",
        "protocol": "iOS HealthKit Permissions",
        "scopes": ["HKQuantityTypeIdentifierStepCount", "HKQuantityTypeIdentifierRestingHeartRate", "HKCategoryTypeIdentifierSleepAnalysis"],
        "bridge_type": "Native iOS Bridge"
    }
}

@router.get("/status")
def get_wearables_status(
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Returns connection and telemetry status for each supported wearable provider.
    Explicitly labels simulated vs real telemetry and documents bridge requirements.
    """
    connected_rows = store.get_user_wearables(current_user["id"])
    connected_map = {row["provider"]: row for row in connected_rows}

    status_list = []
    for provider_key, meta in SUPPORTED_PROVIDERS.items():
        if provider_key in connected_map:
            row = connected_map[provider_key]
            status_list.append({
                "provider": provider_key,
                "provider_name": meta["name"],
                "protocol": meta["protocol"],
                "scopes": meta["scopes"],
                "bridge_type": meta["bridge_type"],
                "status": row["status"],
                "last_sync": row.get("last_sync"),
                "sync_error": row.get("sync_error"),
                "telemetry": row.get("telemetry"),
                "is_simulated": bool(row.get("is_simulated", 1)),
                "integration_notice": "Connected via simulated student telemetry bridge for academic evaluation."
            })
        else:
            status_list.append({
                "provider": provider_key,
                "provider_name": meta["name"],
                "protocol": meta["protocol"],
                "scopes": meta["scopes"],
                "bridge_type": meta["bridge_type"],
                "status": "disconnected",
                "last_sync": None,
                "sync_error": None,
                "telemetry": None,
                "is_simulated": True,
                "integration_notice": "Device not connected. Connect to link resting heart rate, sleep, and steps."
            })

    return {
        "wearables": status_list,
        "consent_telemetry_enabled": bool(current_user.get("consent_wearable_telemetry", 1)),
        "disclaimer": "Wearable metrics are supplementary observational signals and are never used as standalone diagnostic indicators."
    }

@router.post("/connect")
def connect_wearable(
    request: WearableConnectRequest,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Simulates the OAuth / OS permission flow for connecting a wearable device.
    Generates realistic, transparently labeled sample telemetry for demonstration.
    """
    if request.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported wearable provider.")

    if not request.grant_consent:
        raise HTTPException(status_code=400, detail="Consent for telemetry sharing is required to link a device.")

    # Generate realistic simulated telemetry readings
    mock_telemetry = {
        "resting_heart_rate": round(random.uniform(62.0, 78.0), 1),
        "sleep_hours": round(random.uniform(6.2, 8.4), 1),
        "sleep_efficiency": round(random.uniform(80.0, 95.0), 1),
        "daily_steps": random.randint(5500, 11500),
        "physical_activity_minutes": random.randint(20, 65),
        "sync_timestamp": datetime.utcnow().isoformat(),
        "device_battery": f"{random.randint(45, 95)}%"
    }

    store.update_wearable(
        user_id=current_user["id"],
        provider=request.provider,
        status="connected",
        telemetry=mock_telemetry,
        error=None
    )

    return {
        "success": True,
        "provider": request.provider,
        "status": "connected",
        "telemetry": mock_telemetry,
        "message": f"Successfully authorized and connected {SUPPORTED_PROVIDERS[request.provider]['name']} (Simulated Student Bridge).",
        "is_simulated": True
    }

@router.post("/sync")
def sync_wearable(
    request: WearableSyncRequest,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Simulates re-syncing wearable telemetry from the device cloud/bridge.
    """
    connected = [w for w in store.get_user_wearables(current_user["id"]) if w["provider"] == request.provider]
    if not connected or connected[0]["status"] != "connected":
        raise HTTPException(status_code=400, detail="Device is not currently connected.")

    # Update telemetry with latest readings
    updated_telemetry = {
        "resting_heart_rate": round(random.uniform(61.0, 76.0), 1),
        "sleep_hours": round(random.uniform(6.5, 8.2), 1),
        "sleep_efficiency": round(random.uniform(82.0, 96.0), 1),
        "daily_steps": random.randint(6200, 12800),
        "physical_activity_minutes": random.randint(25, 70),
        "sync_timestamp": datetime.utcnow().isoformat(),
        "device_battery": f"{random.randint(40, 92)}%"
    }

    store.update_wearable(
        user_id=current_user["id"],
        provider=request.provider,
        status="connected",
        telemetry=updated_telemetry,
        error=None
    )

    return {
        "success": True,
        "provider": request.provider,
        "telemetry": updated_telemetry,
        "last_sync": updated_telemetry["sync_timestamp"],
        "is_simulated": True
    }

@router.post("/disconnect")
def disconnect_wearable(
    request: WearableSyncRequest,
    current_user: dict = Depends(get_current_user),
    store: DataStore = Depends(get_store)
):
    """
    Disconnects the wearable provider and deletes all cached telemetry.
    """
    store.disconnect_wearable(current_user["id"], request.provider)
    return {
        "success": True,
        "provider": request.provider,
        "message": f"Successfully disconnected {request.provider} and revoked telemetry access."
    }
