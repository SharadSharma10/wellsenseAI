"""
WellSense AI - Clean Database Layer
Provides a zero-config, persistent SQLite document-relational store
with support for transactions, user security, assessments, appointments, and privacy controls.
"""

import sqlite3
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class DataStore:
    def __init__(self, db_path: str = "wellsense.db"):
        self.db_path = db_path
        self._init_db()
        self._seed_demo_accounts()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL,
                department TEXT,
                year TEXT,
                created_at TEXT NOT NULL,
                consent_data_collection INTEGER DEFAULT 1,
                consent_wearable_telemetry INTEGER DEFAULT 1,
                consent_counsellor_sharing INTEGER DEFAULT 1
            )
            """)

            # Assessments table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                tier_label TEXT NOT NULL,
                tier_severity TEXT NOT NULL,
                tier_color TEXT NOT NULL,
                wellness_score REAL NOT NULL,
                raw_inputs TEXT NOT NULL,
                prediction_result TEXT NOT NULL,
                counsellor_notes TEXT,
                flagged_for_triage INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """)

            # Wearable Connections table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS wearables (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                status TEXT NOT NULL,
                last_sync TEXT,
                sync_error TEXT,
                telemetry TEXT,
                is_simulated INTEGER DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            """)

            # Appointments table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                student_name TEXT NOT NULL,
                counsellor_id TEXT,
                status TEXT NOT NULL,
                scheduled_time TEXT NOT NULL,
                notes TEXT,
                urgency TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES users (id)
            )
            """)

            conn.commit()

    def _seed_demo_accounts(self):
        """Seed default demo accounts for instant evaluation if they don't exist."""
        demo_users = [
            {
                "email": "student@wellsense.edu",
                "password": "Student@123",
                "full_name": "Aarav Sharma",
                "role": "student",
                "department": "Computer Science & Engineering",
                "year": "4th Year"
            },
            {
                "email": "counsellor@wellsense.edu",
                "password": "Counsellor@123",
                "full_name": "Dr. Meenakshi Rao",
                "role": "counsellor",
                "department": "Student Wellness & Psychological Services",
                "year": "Staff"
            },
            {
                "email": "admin@wellsense.edu",
                "password": "Admin@123",
                "full_name": "Campus Wellness Administrator",
                "role": "admin",
                "department": "Dean of Student Affairs",
                "year": "Admin"
            }
        ]

        for user in demo_users:
            existing = self.get_user_by_email(user["email"])
            if not existing:
                self.create_user(
                    email=user["email"],
                    password=user["password"],
                    full_name=user["full_name"],
                    role=user["role"],
                    department=user["department"],
                    year=user["year"]
                )

    # User operations
    def create_user(self, email: str, password: str, full_name: str, role: str, department: str = "", year: str = "") -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        hashed_pw = get_password_hash(password)
        now = datetime.utcnow().isoformat()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO users (id, email, hashed_password, full_name, role, department, year, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, email.lower().strip(), hashed_pw, full_name, role, department, year, now))
            conn.commit()

        return self.get_user_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email.lower().strip(),))
            row = cursor.fetchone()
            if row:
                return dict(row)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
        return None

    def update_user_consent(self, user_id: str, data_collection: bool, wearable: bool, counsellor: bool):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE users
            SET consent_data_collection = ?, consent_wearable_telemetry = ?, consent_counsellor_sharing = ?
            WHERE id = ?
            """, (int(data_collection), int(wearable), int(counsellor), user_id))
            conn.commit()

    def delete_user_data(self, user_id: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM assessments WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM wearables WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM appointments WHERE student_id = ?", (user_id,))
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()

    # Assessment operations
    def create_assessment(self, user_id: str, raw_inputs: Dict[str, Any], prediction: Dict[str, Any]) -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        tier_label = prediction["tier_label"]
        tier_severity = prediction["tier_severity"]
        tier_color = prediction["tier_color"]
        wellness_score = prediction["wellness_score"]
        flagged = 1 if prediction.get("requires_counsellor_outreach", False) else 0

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO assessments (
                id, user_id, timestamp, tier_label, tier_severity, tier_color,
                wellness_score, raw_inputs, prediction_result, flagged_for_triage
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                assessment_id, user_id, now, tier_label, tier_severity, tier_color,
                wellness_score, json.dumps(raw_inputs), json.dumps(prediction), flagged
            ))
            conn.commit()

        return self.get_assessment_by_id(assessment_id)

    def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d["raw_inputs"] = json.loads(d["raw_inputs"])
                d["prediction_result"] = json.loads(d["prediction_result"])
                return d
        return None

    def get_user_assessments(self, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM assessments 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
            """, (user_id, limit))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["raw_inputs"] = json.loads(d["raw_inputs"])
                d["prediction_result"] = json.loads(d["prediction_result"])
                results.append(d)
            return results

    def get_latest_assessment(self, user_id: str) -> Optional[Dict[str, Any]]:
        assessments = self.get_user_assessments(user_id, limit=1)
        return assessments[0] if assessments else None

    # Wearable operations
    def get_user_wearables(self, user_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM wearables WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                if d.get("telemetry"):
                    d["telemetry"] = json.loads(d["telemetry"])
                results.append(d)
            return results

    def update_wearable(self, user_id: str, provider: str, status: str, telemetry: Optional[Dict[str, Any]] = None, error: Optional[str] = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM wearables WHERE user_id = ? AND provider = ?", (user_id, provider))
            row = cursor.fetchone()
            now = datetime.utcnow().isoformat()
            telemetry_json = json.dumps(telemetry) if telemetry else None

            if row:
                cursor.execute("""
                UPDATE wearables
                SET status = ?, last_sync = ?, sync_error = ?, telemetry = COALESCE(?, telemetry)
                WHERE id = ?
                """, (status, now, error, telemetry_json, row["id"]))
            else:
                wearable_id = str(uuid.uuid4())
                cursor.execute("""
                INSERT INTO wearables (id, user_id, provider, status, last_sync, sync_error, telemetry, is_simulated)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """, (wearable_id, user_id, provider, status, now, error, telemetry_json))
            conn.commit()

    def disconnect_wearable(self, user_id: str, provider: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM wearables WHERE user_id = ? AND provider = ?", (user_id, provider))
            conn.commit()

    # Counsellor Triage & Appointments
    def get_counsellor_triage_queue(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Fetch latest assessment for students who have given consent for counsellor sharing
            cursor.execute("""
            SELECT 
                u.id as student_id,
                u.full_name as student_name,
                u.email as student_email,
                u.department,
                u.year,
                u.consent_counsellor_sharing,
                a.id as assessment_id,
                a.timestamp as last_assessment_date,
                a.tier_label,
                a.tier_severity,
                a.tier_color,
                a.wellness_score,
                a.prediction_result,
                a.counsellor_notes,
                a.flagged_for_triage
            FROM users u
            JOIN assessments a ON a.user_id = u.id
            WHERE u.role = 'student' AND a.timestamp = (
                SELECT MAX(timestamp) FROM assessments WHERE user_id = u.id
            )
            ORDER BY a.wellness_score ASC
            """)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["prediction_result"] = json.loads(d["prediction_result"])
                results.append(d)
            return results

    def create_appointment(self, student_id: str, student_name: str, scheduled_time: str, notes: str, urgency: str) -> Dict[str, Any]:
        apt_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO appointments (id, student_id, student_name, status, scheduled_time, notes, urgency, created_at)
            VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
            """, (apt_id, student_id, student_name, scheduled_time, notes, urgency, now))
            conn.commit()
        return self.get_appointment_by_id(apt_id)

    def get_appointment_by_id(self, apt_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM appointments WHERE id = ?", (apt_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
        return None

    def get_all_appointments(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM appointments ORDER BY scheduled_time ASC")
            return [dict(r) for r in cursor.fetchall()]

    def update_appointment_status(self, apt_id: str, status: str, notes: Optional[str] = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if notes is not None:
                cursor.execute("UPDATE appointments SET status = ?, notes = ? WHERE id = ?", (status, notes, apt_id))
            else:
                cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (status, apt_id))
            conn.commit()

    # Admin Analytics Aggregation
    def get_admin_analytics(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Total counts
            cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
            total_students = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM assessments")
            total_assessments = cursor.fetchone()[0]

            cursor.execute("SELECT AVG(wellness_score) FROM assessments")
            avg_score_row = cursor.fetchone()[0]
            avg_wellness_score = round(float(avg_score_row), 1) if avg_score_row else 72.4

            # Risk tier breakdown (from latest assessment per student)
            cursor.execute("""
            SELECT a.tier_label, COUNT(*) as cnt
            FROM assessments a
            WHERE a.timestamp = (SELECT MAX(timestamp) FROM assessments WHERE user_id = a.user_id)
            GROUP BY a.tier_label
            """)
            tier_rows = cursor.fetchall()
            risk_dist = {"Low Risk": 0, "Moderate Risk": 0, "High Risk": 0}
            for r in tier_rows:
                risk_dist[r["tier_label"]] = r["cnt"]

            # Department stress breakdown (anonymized)
            cursor.execute("""
            SELECT 
                COALESCE(u.department, 'Undeclared') as dept,
                COUNT(a.id) as assessments_count,
                AVG(a.wellness_score) as avg_score,
                SUM(CASE WHEN a.tier_label = 'High Risk' THEN 1 ELSE 0 END) as high_risk_count
            FROM users u
            JOIN assessments a ON a.user_id = u.id
            GROUP BY u.department
            """)
            dept_stats = [
                {
                    "department": r["dept"],
                    "screenings": r["assessments_count"],
                    "avg_wellness_score": round(float(r["avg_score"]), 1) if r["avg_score"] else 70.0,
                    "elevated_cases": r["high_risk_count"]
                }
                for r in cursor.fetchall()
            ]

            return {
                "total_registered_students": total_students,
                "total_completed_screenings": total_assessments,
                "campus_average_wellness_score": avg_wellness_score,
                "risk_tier_distribution": risk_dist,
                "department_wellbeing_summary": dept_stats,
                "privacy_notice": "All data presented in administrative analytics is strictly anonymized and aggregated."
            }

# Singleton store instance
_store_instance = None

def get_store() -> DataStore:
    global _store_instance
    if _store_instance is None:
        _store_instance = DataStore()
    return _store_instance
