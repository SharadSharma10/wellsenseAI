"""
WellSense AI - Benchmark Student Well-being Dataset Generator
Generates a reproducible, clinically-grounded synthetic benchmark dataset
based on published distributions from college health surveys (ACHA-NCHA, Healthy Minds).
Clearly labeled as a synthetic benchmark dataset for training and validation.
"""

import os
import numpy as np
import pandas as pd

def generate_benchmark_dataset(
    n_samples: int = 3000,
    random_seed: int = 42,
    output_path: str = "data/student_wellbeing_benchmark.csv"
) -> pd.DataFrame:
    """
    Generate synthetic student well-being dataset with realistic physiological,
    academic, and psychological correlations.
    """
    np.random.seed(random_seed)
    
    # 1. Base academic & lifestyle drivers
    academic_pressure = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.10, 0.20, 0.35, 0.22, 0.13])
    study_hours = np.clip(np.random.normal(loc=5.5 + 0.6 * academic_pressure, scale=1.8, size=n_samples), 1.0, 15.0)
    financial_stress = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.20, 0.25, 0.28, 0.17, 0.10])
    social_support = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.08, 0.17, 0.35, 0.25, 0.15])
    
    # 2. Wearable Telemetry (Physiology & Sleep)
    # Sleep hours inversely correlated with high academic pressure and study hours
    base_sleep = 7.5 - 0.35 * (academic_pressure - 3) - 0.15 * (study_hours - 5.5) + np.random.normal(0, 1.1, size=n_samples)
    sleep_hours = np.clip(np.round(base_sleep, 1), 3.5, 11.0)
    
    # Sleep efficiency (%) correlated with sleep hours and stress
    base_eff = 85.0 - 1.5 * academic_pressure - 1.0 * financial_stress + 1.2 * (sleep_hours - 7.0) + np.random.normal(0, 5.0, size=n_samples)
    sleep_efficiency = np.clip(np.round(base_eff, 1), 45.0, 98.0)
    
    # Physical activity & daily steps
    active_lifestyle_factor = np.random.normal(0, 1, size=n_samples) + (social_support - 3) * 0.3
    daily_steps = np.clip(
        np.round(7500 + 2200 * active_lifestyle_factor - 350 * academic_pressure + np.random.normal(0, 800, size=n_samples)),
        1200, 24000
    ).astype(int)
    
    physical_activity_minutes = np.clip(
        np.round(35 + 18 * active_lifestyle_factor - 3.5 * academic_pressure + np.random.normal(0, 12, size=n_samples)),
        0, 180
    ).astype(int)
    
    # Resting heart rate (bpm): Elevated with high stress, low sleep, and sedentary habits
    base_rhr = 68.0 + 2.2 * (academic_pressure - 2.5) + 1.5 * (financial_stress - 2.5) - 1.2 * (sleep_hours - 7.0) - 0.0008 * (daily_steps - 7500) + np.random.normal(0, 4.5, size=n_samples)
    resting_heart_rate = np.clip(np.round(base_rhr, 1), 50.0, 110.0)
    
    # 3. Psychometric Screening Scales
    # Perceived Stress Scale (PSS-4 equivalent, range 0-16)
    latent_stress = (
        0.35 * academic_pressure +
        0.25 * financial_stress -
        0.30 * social_support -
        0.25 * (sleep_hours - 7.0) +
        0.15 * ((resting_heart_rate - 68.0) / 10.0) +
        np.random.normal(0, 0.8, size=n_samples)
    )
    # Scale latent stress to 0-16
    pss_scores = np.clip(np.round(7.5 + 2.2 * latent_stress), 0, 16).astype(int)
    
    # GAD-7 (Anxiety, range 0-21)
    gad_latent = 0.45 * pss_scores + 0.15 * (resting_heart_rate - 68.0) + 0.3 * academic_pressure + np.random.normal(0, 2.5, size=n_samples)
    gad7_scores = np.clip(np.round(gad_latent * 0.8 + 2.0), 0, 21).astype(int)
    
    # PHQ-9 (Depressive symptoms, range 0-27)
    phq_latent = (
        0.40 * pss_scores +
        0.30 * (10.0 - sleep_hours * 1.2) -
        0.8 * social_support +
        0.35 * financial_stress +
        np.random.normal(0, 3.0, size=n_samples)
    )
    phq9_scores = np.clip(np.round(phq_latent * 0.9 + 2.5), 0, 27).astype(int)
    
    # 4. Composite Well-being Severity Index & Tier Assignment
    # Standard clinical cutoffs:
    # PHQ-9: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 mod-severe, 20-27 severe
    # GAD-7: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe
    # PSS: 0-5 low, 6-10 moderate, 11-16 high
    distress_index = (
        (phq9_scores / 27.0) * 0.35 +
        (gad7_scores / 21.0) * 0.30 +
        (pss_scores / 16.0) * 0.20 +
        (np.clip(resting_heart_rate - 65, 0, 45) / 45.0) * 0.08 +
        (np.clip(7.5 - sleep_hours, 0, 4.5) / 4.5) * 0.07
    )
    
    # Assign Tiers with clinically realistic cohort distribution:
    # 0 = Low Risk (distress_index < 0.26) ~45-50%
    # 1 = Moderate Risk (0.26 <= distress_index < 0.38) ~38-42%
    # 2 = High Risk (distress_index >= 0.38) ~10-14%
    wellbeing_tier = np.zeros(n_samples, dtype=int)
    wellbeing_tier[(distress_index >= 0.26) & (distress_index < 0.38)] = 1
    wellbeing_tier[distress_index >= 0.38] = 2
    
    # Continuous WellSense Score (0-100, where 100 is optimal thriving wellness, 0 is severe strain)
    wellbeing_score = np.clip(np.round((1.0 - distress_index) * 100.0, 1), 5.0, 98.0)
    
    # Assemble DataFrame
    student_ids = [f"STU-{1000 + i}" for i in range(n_samples)]
    
    df = pd.DataFrame({
        "student_id": student_ids,
        "phq9_score": phq9_scores,
        "gad7_score": gad7_scores,
        "perceived_stress": pss_scores,
        "academic_pressure": academic_pressure,
        "study_hours_per_day": study_hours,
        "sleep_hours": sleep_hours,
        "sleep_efficiency": sleep_efficiency,
        "resting_heart_rate": resting_heart_rate,
        "daily_steps": daily_steps,
        "physical_activity_minutes": physical_activity_minutes,
        "social_support_score": social_support,
        "financial_stress": financial_stress,
        "wellbeing_score": wellbeing_score,
        "wellbeing_tier": wellbeing_tier
    })
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    
    print(f"Generated {n_samples} benchmark student records saved to {output_path}")
    print("Class Distribution for wellbeing_tier:")
    tier_counts = df['wellbeing_tier'].value_counts().sort_index()
    tier_names = {0: "0 (Low Risk)", 1: "1 (Moderate Risk)", 2: "2 (High Risk)"}
    for tier, count in tier_counts.items():
        pct = (count / n_samples) * 100
        print(f"  Tier {tier_names[tier]}: {count} ({pct:.1f}%)")
        
    return df

if __name__ == "__main__":
    generate_benchmark_dataset()
