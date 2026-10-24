"""
WellSense AI - Prediction and Model Transparency API
"""

from fastapi import APIRouter, HTTPException, status
from app.ml.inference import get_predictor
from app.schemas.predict import PredictRequest, PredictResponse, ModelInfoResponse

router = APIRouter(tags=["Prediction & Model"])

@router.post("/predict", response_model=PredictResponse)
def predict_wellbeing(request: PredictRequest):
    """
    Executes trained ML inference on student self-report and wearable telemetry inputs.
    Returns predicted tier, calibrated 0-100 wellness score, SHAP/feature attributions,
    tailored wellness recommendations, and disclaimer.
    """
    try:
        predictor = get_predictor()
        result = predictor.predict(request.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """
    Returns verified model specifications, algorithm name, training/val/test split details,
    and actual test set evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC).
    """
    try:
        predictor = get_predictor()
        return predictor.get_model_info()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model info: {str(e)}"
        )
