"""
WellSense AI - Model Inference & Explainable AI (XAI) Engine
Loads the trained model pipeline and provides calibrated screening predictions,
wellness score (0-100), and transparent feature contribution explanations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

class WellSensePredictor:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.evaluation_report = {}
        self.feature_columns = []
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(self.models_dir, "wellsense_model.joblib")
        scaler_path = os.path.join(self.models_dir, "preprocessor.joblib")
        meta_path = os.path.join(self.models_dir, "feature_metadata.json")
        report_path = os.path.join(self.models_dir, "evaluation_report.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Train the model first.")
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            self.feature_columns = self.metadata.get("feature_columns", [])
        
        if os.path.exists(report_path):
            with open(report_path, "r") as f:
                self.evaluation_report = json.load(f)

    def get_model_info(self) -> Dict[str, Any]:
        """Return safe model metadata and evaluation metrics for transparency."""
        return {
            "model_version": self.metadata.get("model_version", "1.0.0"),
            "model_name": self.metadata.get("model_name", "WellSense Classifier"),
            "algorithm": self.model.__class__.__name__,
            "features_expected": self.feature_columns,
            "test_metrics": self.evaluation_report.get("test_metrics", {}),
            "dataset_split": self.evaluation_report.get("dataset_split", {}),
            "disclaimer": "WellSense AI is a screening aid, not a medical diagnostic system. Never claim to diagnose a mental health condition."
        }

    def predict(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate input, execute inference, calculate explainability attributions,
        and generate personalized wellness guidance.
        """
        # Validate that all required features exist
        missing = [f for f in self.feature_columns if f not in feature_data]
        if missing:
            raise ValueError(f"Missing required input features: {missing}")

        # Assemble row in exact feature order
        row_values = [float(feature_data[f]) for f in self.feature_columns]
        X_df = pd.DataFrame([row_values], columns=self.feature_columns)

        # Scale if required by model
        requires_scaled = self.metadata.get("requires_scaled_input", True)
        if requires_scaled and self.scaler is not None:
            X_input = self.scaler.transform(X_df)
        else:
            X_input = X_df.values

        # Class probabilities
        probabilities = self.model.predict_proba(X_input)[0]
        predicted_tier_idx = int(np.argmax(probabilities))

        tier_labels = ["Low Risk", "Moderate Risk", "High Risk"]
        tier_colors = ["#10B981", "#F59E0B", "#F43F5E"] # Soft green, warm amber, soft coral
        tier_severities = ["low", "moderate", "high"]

        # Calculate calibrated continuous 0-100 WellSense Wellness Score
        # 100 = optimal thriving wellness; 0 = severe distress
        # Distress weight: Tier 1 (Moderate) = 0.40, Tier 2 (High) = 1.00
        p_low = float(probabilities[0])
        p_mod = float(probabilities[1])
        p_high = float(probabilities[2])
        
        distress_factor = (p_mod * 0.40) + (p_high * 1.00)
        wellness_score = round(float(np.clip((1.0 - distress_factor) * 100.0, 5.0, 98.0)), 1)

        # Calculate Explainable AI (XAI) feature contributions
        contributions = self._compute_feature_attributions(
            X_raw=row_values,
            X_scaled=X_input[0] if requires_scaled else None,
            predicted_class_idx=predicted_tier_idx
        )

        # Generate empathetic personalized wellness recommendations
        recommendations = self._generate_recommendations(
            tier_idx=predicted_tier_idx,
            top_factors=contributions,
            raw_features=feature_data
        )

        return {
            "predicted_tier": predicted_tier_idx,
            "tier_label": tier_labels[predicted_tier_idx],
            "tier_color": tier_colors[predicted_tier_idx],
            "tier_severity": tier_severities[predicted_tier_idx],
            "wellness_score": wellness_score,
            "class_probabilities": {
                "low_risk": round(p_low, 4),
                "moderate_risk": round(p_mod, 4),
                "high_risk": round(p_high, 4)
            },
            "top_contributing_factors": contributions[:4],
            "all_feature_contributions": contributions,
            "recommendations": recommendations,
            "requires_counsellor_outreach": (predicted_tier_idx == 2),
            "disclaimer": "This result is a supportive screening aid and wellness guide, NOT a medical or clinical diagnosis."
        }

    def _compute_feature_attributions(
        self,
        X_raw: List[float],
        X_scaled: np.ndarray,
        predicted_class_idx: int
    ) -> List[Dict[str, Any]]:
        """
        Compute local feature importance attributions for the specific screening instance.
        """
        contributions = []

        # For Logistic Regression: attribution_j = coef_{class, j} * z_j
        if hasattr(self.model, "coef_"):
            coefs = self.model.coef_[predicted_class_idx]
            z_scores = X_scaled if X_scaled is not None else np.array(X_raw)
            raw_impacts = coefs * z_scores
        elif hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            raw_impacts = importances * np.array(X_raw)
        else:
            raw_impacts = np.zeros(len(self.feature_columns))

        total_abs = np.sum(np.abs(raw_impacts)) + 1e-6

        # Human-readable labels and descriptions
        factor_meta = {
            "phq9_score": ("Depressive Symptoms (PHQ-9)", "Self-reported mood, vitality, and interest indicators"),
            "gad7_score": ("Anxiety Level (GAD-7)", "Reported restlessness, worrying, and tension"),
            "perceived_stress": ("Perceived Stress (PSS-4)", "Feelings of control vs overwhelm in daily life"),
            "academic_pressure": ("Academic Pressure", "Academic workload and exam performance pressure"),
            "study_hours_per_day": ("Study Hours", "Daily continuous study workload"),
            "sleep_hours": ("Nightly Sleep Duration", "Average hours of restorative sleep"),
            "sleep_efficiency": ("Sleep Efficiency", "Percentage of time in bed spent asleep"),
            "resting_heart_rate": ("Resting Heart Rate", "Physiological autonomic/sympathetic baseline"),
            "daily_steps": ("Daily Step Activity", "Physical activity and movement level"),
            "physical_activity_minutes": ("Active Minutes", "Aerobic and cardiovascular movement"),
            "social_support_score": ("Social Support Network", "Peer, family, and campus connection strength"),
            "financial_stress": ("Financial Stress", "Financial concerns impacting well-being")
        }

        for i, col in enumerate(self.feature_columns):
            impact = float(raw_impacts[i])
            pct_impact = round(float((abs(impact) / total_abs) * 100.0), 1)
            friendly_name, desc = factor_meta.get(col, (col.replace("_", " ").title(), ""))
            
            # Impact direction: does this feature push towards distress (+) or act as a protective buffer (-)?
            is_risk_factor = impact > 0 if predicted_class_idx > 0 else impact < 0

            contributions.append({
                "feature": col,
                "display_name": friendly_name,
                "description": desc,
                "raw_value": X_raw[i],
                "impact_score": round(impact, 4),
                "importance_percentage": pct_impact,
                "is_risk_factor": bool(is_risk_factor),
                "insight": self._generate_feature_insight(col, X_raw[i], is_risk_factor)
            })

        # Sort by magnitude of importance percentage
        contributions.sort(key=lambda x: x["importance_percentage"], reverse=True)
        return contributions

    def _generate_feature_insight(self, feature: str, value: float, is_risk: bool) -> str:
        """Create empathetic, non-pathologizing feedback for each factor."""
        if feature == "sleep_hours":
            if value < 6.0:
                return f"Sleep duration of {value:.1f}h is below recommended baseline, which often compounds fatigue and stress."
            elif value >= 7.5:
                return f"Getting {value:.1f}h of sleep acts as a strong restorative anchor for your mental well-being."
            return f"Sleep is at {value:.1f}h. Small additions of 30-45 minutes could boost daytime clarity."
        
        if feature == "resting_heart_rate":
            if value > 82.0:
                return f"Resting HR of {value:.0f} bpm suggests elevated sympathetic nervous system arousal or physical strain."
            elif value < 70.0:
                return f"Resting HR of {value:.0f} bpm indicates balanced autonomic tone and good physical recovery."
            return f"Resting HR is steady at {value:.0f} bpm."

        if feature == "gad7_score":
            if value >= 10:
                return "Elevated anxiety responses suggest noticeable persistent worry that warrants supportive tools."
            return "Anxiety symptoms are currently within mild or manageable boundaries."

        if feature == "academic_pressure":
            if value >= 4:
                return "Substantial academic load is placing heavy cognitive demands on your schedule."
            return "Academic demands are currently reported at a moderate, sustainable level."

        if feature == "social_support_score":
            if value >= 4:
                return "Your strong peer and family support network is an exceptional protective asset."
            elif value <= 2:
                return "Feeling isolated can amplify daily stress; connecting with campus communities may help."
            return "Social connection is at a moderate level."

        if feature == "daily_steps":
            if value >= 8000:
                return f"Healthy movement of {int(value):,} steps daily stimulates endorphin release and stress relief."
            return f"Daily steps of {int(value):,} indicate an opportunity for short mindful campus walks."

        return f"Reported value: {value}."

    def _generate_recommendations(
        self,
        tier_idx: int,
        top_factors: List[Dict[str, Any]],
        raw_features: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Generate compassionate, practical steps tailored to student factors."""
        recs = []

        # Tier-based core advice
        if tier_idx == 2:
            recs.append({
                "category": "Counsellor Support",
                "title": "Confidential Campus Counsellor Consultation",
                "description": "Your responses indicate heightened stress. Talking with a campus wellness counsellor can provide personalized support and safe coping strategies.",
                "action_type": "counsellor_booking",
                "badge": "Priority Recommendation"
            })
        elif tier_idx == 1:
            recs.append({
                "category": "Stress Management",
                "title": "Targeted Stress Decompression",
                "description": "You are navigating noticeable strain. Integrating short 5-minute breathing pauses and structured study blocks can prevent burnout.",
                "action_type": "guided_breathing",
                "badge": "Action Plan"
            })
        else:
            recs.append({
                "category": "Wellness Maintenance",
                "title": "Maintain Positive Momentum",
                "description": "Your screening scores indicate healthy resilience. Continue your balanced sleep, hydration, and academic pacing habits.",
                "action_type": "wellness_tracker",
                "badge": "Positive Baseline"
            })

        # Feature-driven tailored recommendations
        sleep = float(raw_features.get("sleep_hours", 7.0))
        if sleep < 6.5:
            recs.append({
                "category": "Sleep Hygiene",
                "title": "Circadian Wind-Down Routine",
                "description": "Dim blue-light screens 45 minutes before bedtime and aim for a consistent sleep window to allow neurological recovery.",
                "action_type": "sleep_guide",
                "badge": "Sleep Factor"
            })

        rhr = float(raw_features.get("resting_heart_rate", 70.0))
        if rhr > 80.0 or tier_idx > 0:
            recs.append({
                "category": "Mindfulness",
                "title": "Interactive 4-7-8 Breathing Session",
                "description": "Engage in our guided rhythmic breathing exercise to stimulate the vagus nerve and down-regulate sympathetic heart rate.",
                "action_type": "breathing_tool",
                "badge": "Vagal Tone"
            })

        academic = float(raw_features.get("academic_pressure", 3))
        if academic >= 4:
            recs.append({
                "category": "Academic Strategy",
                "title": "Structured Workload Chunking",
                "description": "Divide intensive assignments into 25-minute Pomodoro sprints followed by 5-minute complete mental disengagements.",
                "action_type": "study_pacing",
                "badge": "Study Balance"
            })

        return recs

# Singleton instance
_predictor_instance = None

def get_predictor() -> WellSensePredictor:
    global _predictor_instance
    if _predictor_instance is None:
        # Check current working directory or relative path to models
        candidate_paths = [
            "models",
            "backend/models",
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        ]
        chosen_path = "models"
        for p in candidate_paths:
            if os.path.exists(os.path.join(p, "wellsense_model.joblib")):
                chosen_path = p
                break
        _predictor_instance = WellSensePredictor(models_dir=chosen_path)
    return _predictor_instance
