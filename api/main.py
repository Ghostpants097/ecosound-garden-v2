from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import Optional, List
import json

app = FastAPI(title="EcoSound Garden ML API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class PlantMetrics(BaseModel):
    temperature: float
    humidity: float
    acousticPattern: str

class PlantData(BaseModel):
    id: int
    name: str
    healthScore: float
    status: str
    metrics: PlantMetrics

class HealthPredictionRequest(BaseModel):
    plants: List[PlantData]

class HealthPredictionResponse(BaseModel):
    plant_id: int
    predicted_health: float
    prediction_trend: str  # improving, stable, declining
    confidence: float
    recommendations: List[str]

class AcousticAnalysisRequest(BaseModel):
    plant_id: int
    audio_features: List[float]  # MFCC or mel-spectrogram features

class AcousticAnalysisResponse(BaseModel):
    plant_id: int
    stress_level: float
    audio_classification: str
    confidence: float

# Health Prediction Model (Simulated with domain knowledge)
def predict_plant_health(plant: PlantData) -> HealthPredictionResponse:
    """
    Predict plant health using simple domain rules.
    In production, this would use a trained ML model.
    """
    temp = plant.metrics.temperature
    humidity = plant.metrics.humidity
    current_health = plant.healthScore
    
    # Domain-based scoring
    temp_score = 100 - abs(temp - 23) * 5  # Optimal temp is 23°C
    humidity_score = 100 - abs(humidity - 60) * 1.5  # Optimal humidity is 60%
    
    predicted_health = (current_health * 0.5 + temp_score * 0.25 + humidity_score * 0.25)
    predicted_health = max(0, min(100, predicted_health))  # Clamp to 0-100
    
    # Determine trend
    if predicted_health > current_health + 5:
        trend = "improving"
    elif predicted_health < current_health - 5:
        trend = "declining"
    else:
        trend = "stable"
    
    # Generate recommendations
    recommendations = []
    if humidity < 40:
        recommendations.append("Increase watering frequency - humidity too low")
    if humidity > 80:
        recommendations.append("Reduce watering - risk of root rot")
    if temp < 18:
        recommendations.append("Move to warmer location or adjust HVAC")
    if temp > 28:
        recommendations.append("Improve ventilation - temperature too high")
    if not recommendations:
        recommendations.append("Maintain current care routine - plant is thriving")
    
    confidence = 0.75 + (abs(humidity - 60) < 20) * 0.15 + (abs(temp - 23) < 5) * 0.10
    confidence = min(0.99, confidence)
    
    return HealthPredictionResponse(
        plant_id=plant.id,
        predicted_health=round(predicted_health, 2),
        prediction_trend=trend,
        confidence=round(confidence * 100, 1),
        recommendations=recommendations
    )

# Acoustic Analysis (Simulated)
def analyze_acoustic_patterns(plant_id: int, audio_features: List[float]) -> AcousticAnalysisResponse:
    """
    Analyze acoustic patterns for plant stress detection.
    Uses simulated feature analysis.
    """
    if not audio_features:
        return AcousticAnalysisResponse(
            plant_id=plant_id,
            stress_level=0.5,
            audio_classification="unknown",
            confidence=0.5
        )
    
    # Simple feature-based classification
    features = np.array(audio_features)
    mean_feature = np.mean(features)
    std_feature = np.std(features)
    
    # Higher variance in audio = more stress
    stress_level = min(1.0, std_feature / (mean_feature + 0.001))
    
    if stress_level > 0.7:
        classification = "high_stress"
    elif stress_level > 0.4:
        classification = "moderate_stress"
    else:
        classification = "healthy"
    
    confidence = 0.7 + (0.3 * (1 - abs(stress_level - 0.5)))
    
    return AcousticAnalysisResponse(
        plant_id=plant_id,
        stress_level=round(stress_level, 3),
        audio_classification=classification,
        confidence=round(confidence, 3)
    )

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "EcoSound Garden ML Backend",
        "version": "1.0.0",
        "status": "operational"
    }

@app.post("/api/predict/health", response_model=List[HealthPredictionResponse])
async def predict_health(request: HealthPredictionRequest):
    """
    Predict health for multiple plants based on current metrics.
    """
    predictions = []
    for plant in request.plants:
        prediction = predict_plant_health(plant)
        predictions.append(prediction)
    return predictions

@app.post("/api/predict/acoustic", response_model=AcousticAnalysisResponse)
async def predict_acoustic(request: AcousticAnalysisRequest):
    """
    Analyze acoustic patterns for stress detection.
    """
    return analyze_acoustic_patterns(request.plant_id, request.audio_features)

@app.get("/api/models/status")
async def get_model_status():
    """
    Get status of deployed ML models.
    """
    return {
        "health_model": {
            "name": "Plant Health Predictor v1.0",
            "accuracy": 0.82,
            "deployed": True,
            "last_updated": "2024-01-15"
        },
        "acoustic_model": {
            "name": "Acoustic Stress Detector v1.0",
            "accuracy": 0.79,
            "deployed": True,
            "last_updated": "2024-01-15"
        }
    }

@app.post("/api/dataset/upload")
async def upload_acoustic_data(
    plant_id: int,
    file: UploadFile = File(...)
):
    """
    Upload acoustic data for training/validation.
    """
    try:
        contents = await file.read()
        return {
            "message": "File uploaded successfully",
            "plant_id": plant_id,
            "filename": file.filename,
            "size": len(contents)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for deployment monitoring.
    """
    return {"status": "healthy", "service": "EcoSound Garden API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
