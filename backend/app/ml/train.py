"""
WellSense AI - Model Training & Evaluation Suite
Trains multiple candidate classifiers using strict 70/15/15 train/val/test split.
Evaluates on validation set, selects best performing model,
and performs final evaluation on held-out test set.
Exports model artifacts, preprocessor, and full metrics report.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

FEATURE_COLUMNS = [
    "phq9_score",
    "gad7_score",
    "perceived_stress",
    "academic_pressure",
    "study_hours_per_day",
    "sleep_hours",
    "sleep_efficiency",
    "resting_heart_rate",
    "daily_steps",
    "physical_activity_minutes",
    "social_support_score",
    "financial_stress"
]

TARGET_COLUMN = "wellbeing_tier"
CLASS_NAMES = ["Low Risk", "Moderate Risk", "High Risk"]

def load_and_split_data(dataset_path: str = "data/student_wellbeing_benchmark.csv"):
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_dataset.py first.")
    
    df = pd.read_csv(dataset_path)
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    
    # Strict 70/15/15 split:
    # First split 70% train and 30% temp (val + test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    # Next split 30% temp equally into 15% validation and 15% test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    print(f"Dataset split complete:")
    print(f"  Training set:   {len(X_train)} samples ({(len(X_train)/len(df))*100:.1f}%)")
    print(f"  Validation set: {len(X_val)} samples ({(len(X_val)/len(df))*100:.1f}%)")
    print(f"  Held-out Test:  {len(X_test)} samples ({(len(X_test)/len(df))*100:.1f}%)")
    
    return X_train, X_val, X_test, y_train, y_val, y_test

def train_and_evaluate_models(dataset_path: str = "data/student_wellbeing_benchmark.csv", output_dir: str = "models"):
    os.makedirs(output_dir, exist_ok=True)
    
    X_train, X_val, X_test, y_train, y_val, y_test = load_and_split_data(dataset_path)
    
    # Preprocessor scaler fit ONLY on training set
    scaler = StandardScaler()
    scaler.fit(X_train)
    
    X_train_scaled = scaler.transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=120, max_depth=4, learning_rate=0.08, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=120, max_depth=4, learning_rate=0.08, eval_metric="mlogloss", random_state=42)
    }
    
    val_results = {}
    fitted_models = {}
    
    print("\n--- Model Training & Validation Selection ---")
    for name, model in candidates.items():
        if name in ["LogisticRegression"]:
            # LogisticRegression benefits from scaled features
            model.fit(X_train_scaled, y_train)
            val_preds = model.predict(X_val_scaled)
            val_probs = model.predict_proba(X_val_scaled)
        else:
            # Tree models can use raw features directly
            model.fit(X_train, y_train)
            val_preds = model.predict(X_val)
            val_probs = model.predict_proba(X_val)
            
        f1_macro = f1_score(y_val, val_preds, average="macro")
        acc = accuracy_score(y_val, val_preds)
        auc = roc_auc_score(y_val, val_probs, multi_class="ovr", average="macro")
        
        val_results[name] = {
            "validation_accuracy": round(float(acc), 4),
            "validation_f1_macro": round(float(f1_macro), 4),
            "validation_roc_auc": round(float(auc), 4)
        }
        fitted_models[name] = model
        print(f"[{name}] Val Acc: {acc:.4f} | Val F1-Macro: {f1_macro:.4f} | Val ROC-AUC: {auc:.4f}")
        
    # Select best model based on validation F1-macro score
    best_name = max(val_results, key=lambda k: val_results[k]["validation_f1_macro"])
    best_model = fitted_models[best_name]
    print(f"\nWinning Model Selected on Validation Set: {best_name}")
    
    # Final Evaluation on Held-Out Test Set (15%)
    print("\n--- Final Evaluation on Held-Out Test Set (Unseen 15%) ---")
    if best_name == "LogisticRegression":
        test_preds = best_model.predict(X_test_scaled)
        test_probs = best_model.predict_proba(X_test_scaled)
    else:
        test_preds = best_model.predict(X_test)
        test_probs = best_model.predict_proba(X_test)
        
    test_accuracy = float(accuracy_score(y_test, test_preds))
    test_precision_macro = float(precision_score(y_test, test_preds, average="macro"))
    test_recall_macro = float(recall_score(y_test, test_preds, average="macro"))
    test_f1_macro = float(f1_score(y_test, test_preds, average="macro"))
    test_f1_weighted = float(f1_score(y_test, test_preds, average="weighted"))
    test_roc_auc = float(roc_auc_score(y_test, test_probs, multi_class="ovr", average="macro"))
    cm = confusion_matrix(y_test, test_preds).tolist()
    
    # Class-wise metrics
    class_report = classification_report(y_test, test_preds, target_names=CLASS_NAMES, output_dict=True)
    
    # Feature importances
    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
        feature_importance_dict = {
            col: round(float(imp), 4)
            for col, imp in sorted(zip(FEATURE_COLUMNS, raw_importances), key=lambda x: x[1], reverse=True)
        }
    else:
        feature_importance_dict = {}
        
    class_dist_test = {
        CLASS_NAMES[i]: int((y_test == i).sum())
        for i in range(len(CLASS_NAMES))
    }
    
    report = {
        "model_name": best_name,
        "algorithm": best_model.__class__.__name__,
        "dataset_split": {
            "train_ratio": 0.70,
            "validation_ratio": 0.15,
            "test_ratio": 0.15,
            "train_samples": len(X_train),
            "validation_samples": len(X_val),
            "test_samples": len(X_test)
        },
        "validation_comparison": val_results,
        "test_metrics": {
            "accuracy": round(test_accuracy, 4),
            "precision_macro": round(test_precision_macro, 4),
            "recall_macro": round(test_recall_macro, 4),
            "f1_score_macro": round(test_f1_macro, 4),
            "f1_score_weighted": round(test_f1_weighted, 4),
            "roc_auc_macro_ovr": round(test_roc_auc, 4),
            "confusion_matrix": cm,
            "class_distribution_test": class_dist_test,
            "per_class_metrics": {
                name: {
                    "precision": round(class_report[name]["precision"], 4),
                    "recall": round(class_report[name]["recall"], 4),
                    "f1_score": round(class_report[name]["f1-score"], 4),
                    "support": int(class_report[name]["support"])
                }
                for name in CLASS_NAMES
            }
        },
        "feature_importances": feature_importance_dict,
        "disclaimer": "This model is a supportive screening aid for student wellness triage, not a medical diagnostic instrument."
    }
    
    # Print Test Results
    print(f"Test Accuracy:           {test_accuracy:.4f}")
    print(f"Test Precision (Macro):  {test_precision_macro:.4f}")
    print(f"Test Recall (Macro):     {test_recall_macro:.4f}")
    print(f"Test F1-Score (Macro):   {test_f1_macro:.4f}")
    print(f"Test ROC-AUC (Macro OVR):{test_roc_auc:.4f}")
    print("\nConfusion Matrix:")
    print(np.array(cm))
    
    # Save artifacts
    model_path = os.path.join(output_dir, "wellsense_model.joblib")
    scaler_path = os.path.join(output_dir, "preprocessor.joblib")
    meta_path = os.path.join(output_dir, "feature_metadata.json")
    report_path = os.path.join(output_dir, "evaluation_report.json")
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    meta = {
        "model_name": best_name,
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "class_mapping": {0: "Low Risk", 1: "Moderate Risk", 2: "High Risk"},
        "requires_scaled_input": (best_name == "LogisticRegression"),
        "model_version": "1.0.0"
    }
    
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
        
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
        
    print(f"\nArtifacts successfully serialized to {output_dir}/")
    return report

if __name__ == "__main__":
    train_and_evaluate_models()
