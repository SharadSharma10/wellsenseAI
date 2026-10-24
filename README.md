# WellSense AI — Full-Stack Student Mental Well-Being Screening Platform

> **Final-Year B.Tech Project in Computer Science & Artificial Intelligence**  
> *Developed as a supportive screening aid and early triage assistant, not a clinical diagnostic instrument.*

---

## 1. Project Objective & Clinical Framing

**WellSense AI** is a privacy-first, full-stack student mental well-being screening and early support system. The platform integrates:
- **Validated Psychometric Self-Reports:** Standard student mental health screening dimensions adapted from validated clinical scales (PHQ-9 for depressive symptoms, GAD-7 for generalized anxiety, and PSS-4 for perceived academic stress).
- **Wearable & Lifestyle Telemetry:** Physiological stress markers including resting heart rate (RHR), sleep duration, sleep efficiency, and daily physical activity (steps).
- **Trained Machine Learning Model:** Multi-class risk tier triage (Low Risk, Moderate Risk, High Risk) combined with an inverse calibrated 0–100 WellSense Wellness Index.
- **Explainable AI (XAI):** Local feature contribution attribution (SHAP/coefficient impact scores) translated into empathetic, plain-language student insights.
- **Compassionate Early Interventions:** Real-time guided 4-7-8 and box breathing relaxation tools, confidential campus counsellor appointment requests, and verified 24/7 crisis helplines.

> [!IMPORTANT]
> **Ethical Disclaimer:** WellSense AI is a **screening aid and triage assistant, not a medical or clinical diagnostic system**. It identifies self-reported strain and autonomic physiological patterns to recommend early wellness habits and campus support before acute burnout occurs. It never claims to make clinical diagnoses.

---

## 2. System Architecture

```text
wellsense-ai/
├── frontend/                              # Modern React.js Client
│   ├── src/
│   │   ├── api/                           # Centralized API fetcher with JWT tokens
│   │   │   └── client.js
│   │   ├── components/                    # Reusable UI components
│   │   │   ├── Navbar.jsx                 # Navigation, role switcher, emergency crisis button
│   │   │   ├── DisclaimerBanner.jsx       # Non-diagnostic clinical disclaimer banner
│   │   │   ├── SmartwatchPreview.jsx      # Interactive simulated smartwatch hardware bezel
│   │   │   └── BreathingExercise.jsx      # Guided 4-7-8 & box breathing relaxation circle
│   │   ├── pages/                         # 11 Screen Views
│   │   │   ├── AuthPage.jsx               # Login & Registration with 1-click demo logins
│   │   │   ├── StudentDashboard.jsx       # Student score card, 7-day trend, telemetry signals
│   │   │   ├── QuestionnairePage.jsx      # 1-question-at-a-time screening wizard with progress
│   │   │   ├── ScreeningResultPage.jsx    # 0-100 score, tier, XAI attributions, action steps
│   │   │   ├── SupportResourcesPage.jsx   # Breathing exercise, counsellor booking, helplines
│   │   │   ├── WearablesPage.jsx          # Fitbit, Google Health, Apple Health connections
│   │   │   ├── HistoryPage.jsx            # Dual longitudinal trend charts and assessment table
│   │   │   ├── SmartwatchPage.jsx         # Dedicated wrist wearable simulator view
│   │   │   ├── CounsellorDashboard.jsx    # Severity triage queue, tier filter, clinical notes
│   │   │   ├── AdminAnalyticsPage.jsx     # Anonymized campus aggregates & model metrics
│   │   │   └── ProfilePrivacyPage.jsx     # Consent toggles, JSON data export, account deletion
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Global auth state & role management
│   │   ├── App.jsx                        # Orchestrator & view routing
│   │   ├── index.css                      # Google Inter fonts & Tailwind base
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js                 # Brand colors: #14B8A6 (Primary), #FAFAF7 (Bg)
│   └── vite.config.js
├── backend/                               # Python FastAPI Machine Learning Backend
│   ├── app/
│   │   ├── main.py                        # FastAPI application & CORS setup
│   │   ├── config.py                      # Application configuration & Pydantic settings
│   │   ├── api/                           # Modular API Routers
│   │   │   ├── auth.py                    # User registration, login, JWT issuance, profile
│   │   │   ├── predict.py                 # ML inference & model-info transparency endpoints
│   │   │   ├── assessments.py             # Check-in submission, history, 7-day trend
│   │   │   ├── wearables.py               # Telemetry status, simulated sync, disconnection
│   │   │   ├── counsellor.py              # Prioritized triage queue & appointments
│   │   │   ├── admin.py                   # Anonymized campus trends & department breakdown
│   │   │   └── privacy.py                 # Consent updating, JSON data export, erasure
│   │   ├── schemas/                       # Pydantic validation schemas
│   │   │   ├── auth.py
│   │   │   ├── predict.py
│   │   │   └── assessment.py
│   │   ├── ml/                            # Machine Learning Engine
│   │   │   ├── generate_dataset.py        # University student cohort benchmark dataset
│   │   │   ├── train.py                   # 70/15/15 split training & multi-model evaluation
│   │   │   └── inference.py               # Singleton predictor & XAI factor attributions
│   │   ├── database/                      # Persistent SQLite Database Layer
│   │   │   └── store.py                   # Relational document store with demo seed data
│   │   └── security/                      # Password hashing (bcrypt) & JWT authorization
│   │       └── auth.py
│   ├── models/                            # Serialized Model Artifacts
│   │   ├── wellsense_model.joblib         # Winning trained classifier
│   │   ├── preprocessor.joblib            # Feature standard scaler
│   │   ├── feature_metadata.json          # Feature schemas and mappings
│   │   └── evaluation_report.json         # Comprehensive evaluation metrics report
│   ├── data/
│   │   └── student_wellbeing_benchmark.csv# Benchmark cohort dataset (N=3000)
│   ├── tests/                             # Automated Test Suite (pytest)
│   │   ├── test_health.py                 # Health and model-info endpoint tests
│   │   ├── test_ml_pipeline.py            # Valid, high-distress, and boundary validation
│   │   └── test_auth_and_privacy.py       # Auth, role security, wearables, and privacy
│   ├── requirements.txt                   # Pinned backend dependencies
│   ├── .env.example
│   └── wellsense.db                       # Local SQLite database
├── .gitignore
└── README.md
```

---

## 3. Machine Learning Architecture & Evaluation

### Features (12 Variables)
1. `phq9_score`: Patient Health Questionnaire depressive symptom score (0–27).
2. `gad7_score`: Generalized Anxiety Disorder anxiety symptom score (0–21).
3. `perceived_stress`: Perceived Stress Scale (PSS-4 equivalent, 0–16).
4. `academic_pressure`: Self-reported academic load & exam distress (Likert 1–5).
5. `study_hours_per_day`: Daily study/lab workload (1.0–15.0 hrs).
6. `sleep_hours`: Average nightly sleep duration (3.5–11.0 hrs).
7. `sleep_efficiency`: Sleep quality percentage (40–100%).
8. `resting_heart_rate`: Wearable resting heart rate baseline (50–110 bpm).
9. `daily_steps`: Wearable daily step count (1,000–25,000 steps).
10. `physical_activity_minutes`: Daily aerobic movement (0–180 mins).
11. `social_support_score`: Peer and mentor connectivity (Likert 1–5).
12. `financial_stress`: Financial strain factor (Likert 1–5).

### Strict 70 / 15 / 15 Train / Validation / Test Split
To prevent data snooping and data leakage:
- **Training Set (70%):** 2,100 student records used to fit candidate models and the preprocessor scaler.
- **Validation Set (15%):** 450 student records used strictly for hyperparameter selection across candidate algorithms.
- **Held-Out Test Set (15%):** 450 completely unseen records evaluated once on the winning model.

### Model Comparison & Test Set Results

| Candidate Model | Validation F1 (Macro) | Validation ROC-AUC | Test Accuracy | Test F1 (Macro) | Test ROC-AUC (OVR) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Selected)** | **0.9697** | **0.9987** | **96.44%** | **0.9660** | **0.9979** |
| Random Forest Classifier | 0.9025 | 0.9898 | — | — | — |
| Gradient Boosting (GBDT) | 0.9192 | 0.9910 | — | — | — |
| XGBoost Classifier | 0.9157 | 0.9912 | — | — | — |

#### Held-Out Test Set Confusion Matrix (N=450)
$$\begin{pmatrix}
179 & 6 & 0 \\
6 & 187 & 1 \\
0 & 3 & 68
\end{pmatrix}$$

#### WellSense Score Derivation (0–100)
The continuous score is derived from the calibrated distress probability:
$$\text{distress\_risk} = 0.40 \cdot P(\text{Moderate Risk}) + 1.00 \cdot P(\text{High Risk})$$
$$\text{WellSense Score} = \text{round}\big((1.0 - \text{distress\_risk}) \times 100, 1\big)$$
- **Low Risk:** ~70 – 100
- **Moderate Risk:** ~40 – 69
- **High Risk:** ~0 – 39

---

## 4. Environment Setup & Installation

### Mandatory Python Virtual Environment (`backend/.venv`)

The project uses Python 3.11 with an isolated virtual environment inside `backend/.venv`.

#### On Windows (PowerShell):
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment with Python 3.11
py -3.11 -m venv .venv

# Activate environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install pinned backend dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

#### On macOS / Linux:
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

## 5. Running the Application

### 1. Start the FastAPI Backend
With `backend/.venv` active:
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **Model Info:** [http://localhost:8000/model-info](http://localhost:8000/model-info)

### 2. Start the React Frontend
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)

---

## 6. Pre-Seeded Demo Credentials (Instant 1-Click Login)

The platform includes pre-configured demo accounts for instant evaluator demonstration:

| Role | Email | Password | Name | Primary Use |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@wellsense.edu` | `Student@123` | Aarav Sharma | Screening check-in, dashboard, history, wearables |
| **Counsellor** | `counsellor@wellsense.edu` | `Counsellor@123` | Dr. Meenakshi Rao | Triage queue, clinical notes, appointment status |
| **Admin** | `admin@wellsense.edu` | `Admin@123` | Campus Dean Office | Campus-wide analytics, department metrics, model audit |

*(You can also use the **Quick Evaluator Switcher** in the top navigation bar to change roles with one click at any time).*

---

## 7. Working Features vs. Demo-Only Features

| Feature | Status | Implementation Details |
| :--- | :---: | :--- |
| **User Authentication & RBAC** | **Working** | JWT tokens with bcrypt password hashing and role enforcement. |
| **ML Inference & 0-100 Score** | **Working** | Real trained scikit-learn pipeline loaded at startup; calibrated probabilities. |
| **Explainable AI (XAI)** | **Working** | Local feature contribution percentages and empathetic explanations. |
| **Screening Questionnaire** | **Working** | 1-question-at-a-time wizard with progress bar and validation. |
| **Assessment History & Charts** | **Working** | Recharts line and bar visualizations; past check-in records table and modal. |
| **Guided Breathing Tool** | **Working** | Real-time animated 4-7-8 and box breathing countdown timers with sound cues. |
| **Counsellor Triage & Notes** | **Working** | Student severity triage queue, tier filtering, and appointment status workflow. |
| **Anonymized Admin Analytics** | **Working** | Aggregated department stress breakdowns and 14-day campus trajectories. |
| **GDPR Privacy & Data Export** | **Working** | Granular consent toggles, machine-readable JSON dossier export, account erasure. |
| **Smartwatch Companion** | **Working Demo** | High-fidelity interactive bezel with live HR pulse and 1-tap wrist check-in. |
| **Wearable Device Bridge** | **Simulated Integration** | Realistic simulated student telemetry bridge (Fitbit, Google Health, Apple Health); clearly labeled as simulated telemetry for academic evaluation. |

---

## 8. Verification & Test Suite

Run the automated backend test suite with:
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest tests/
```
**Test Results: 11 / 11 Passed (100% pass rate)**
- `tests/test_health.py`: Validates `/health`, `/`, and `/model-info` endpoints.
- `tests/test_ml_pipeline.py`: Validates normal inputs, high distress triage, missing inputs, and bounds validation.
- `tests/test_auth_and_privacy.py`: Validates student/counsellor login, RBAC protection on admin endpoints, and wearable connect/disconnect.
