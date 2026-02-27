"""
SQLAlchemy database models for EcoSound Garden.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class Plant(Base):
    """Plant entity in the garden."""
    __tablename__ = "plants"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=True)
    user_id = Column(Integer, nullable=False)  # Link to user
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metrics = relationship("PlantMetrics", back_populates="plant", cascade="all, delete-orphan")
    predictions = relationship("HealthPrediction", back_populates="plant", cascade="all, delete-orphan")
    recordings = relationship("AcousticRecording", back_populates="plant", cascade="all, delete-orphan")


class PlantMetrics(Base):
    """Time-series environmental metrics for plants."""
    __tablename__ = "plant_metrics"
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Environmental metrics
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    soil_moisture = Column(Float, nullable=True)
    light_level = Column(Float, nullable=True)
    
    # Health metrics
    health_score = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)  # healthy, stressed, critical
    
    # Plant relationships
    plant = relationship("Plant", back_populates="metrics")


class HealthPrediction(Base):
    """ML model predictions for plant health."""
    __tablename__ = "health_predictions"
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Prediction results
    predicted_health = Column(Float, nullable=False)
    prediction_trend = Column(String(20), nullable=False)  # improving, stable, declining
    confidence = Column(Float, nullable=False)
    
    # Recommendations
    recommendations = Column(JSON, nullable=True)
    
    # Model metadata
    model_version = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    
    plant = relationship("Plant", back_populates="predictions")


class AcousticRecording(Base):
    """Acoustic recordings of plants."""
    __tablename__ = "acoustic_recordings"
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # File information
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    duration = Column(Float, nullable=False)  # seconds
    sample_rate = Column(Integer, nullable=False)
    
    # Extracted features (stored as JSON for flexibility)
    mfcc_features = Column(JSON, nullable=True)
    mel_spectrogram = Column(JSON, nullable=True)
    zero_crossing_rate = Column(Float, nullable=True)
    spectral_centroid = Column(Float, nullable=True)
    
    # Analysis results
    stress_indicators = Column(JSON, nullable=True)
    acoustic_classification = Column(String(50), nullable=True)
    
    plant = relationship("Plant", back_populates="recordings")


class UserFeedback(Base):
    """User corrections and feedback for model improvement."""
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("health_predictions.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Feedback data
    feedback_type = Column(String(50), nullable=False)  # correction, confirmation, uncertainty
    actual_health_score = Column(Float, nullable=True)
    actual_status = Column(String(20), nullable=True)  # healthy, stressed, critical
    
    # User notes
    notes = Column(String(500), nullable=True)
    
    # For active learning
    used_for_training = Column(Integer, default=0)  # 0=no, 1=yes


class ModelMetadata(Base):
    """Track ML model versions and performance."""
    __tablename__ = "model_metadata"
    
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100), nullable=False, unique=True)
    model_version = Column(String(50), nullable=False)
    
    # Model performance metrics
    training_accuracy = Column(Float, nullable=True)
    validation_accuracy = Column(Float, nullable=True)
    test_accuracy = Column(Float, nullable=True)
    
    # Model information
    model_type = Column(String(50), nullable=False)  # health_prediction, acoustic_stress, etc.
    input_dim = Column(Integer, nullable=False)
    output_dim = Column(Integer, nullable=False)
    
    # Deployment info
    deployed = Column(Integer, default=0)  # 0=no, 1=yes
    deployment_date = Column(DateTime, nullable=True)
    
    # Training data info
    training_samples = Column(Integer, nullable=True)
    training_date = Column(DateTime, default=datetime.utcnow)
    framework = Column(String(50), nullable=False)  # tensorflow, sklearn, etc.


class PredictionLog(Base):
    """Log all predictions for monitoring and debugging."""
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Request info
    model_used = Column(String(100), nullable=False)
    inference_time_ms = Column(Float, nullable=False)
    
    # Input
    input_features = Column(JSON, nullable=False)
    
    # Output
    prediction_result = Column(JSON, nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Status
    success = Column(Integer, default=1)  # 0=failed, 1=success
    error_message = Column(String(255), nullable=True)


# Database initialization utilities

def init_db(engine):
    """Initialize database tables."""
    Base.metadata.create_all(engine)


def drop_all_tables(engine):
    """Drop all tables (for testing/cleanup)."""
    Base.metadata.drop_all(engine)


def get_session(engine):
    """Create a database session."""
    from sqlalchemy.orm import sessionmaker
    Session = sessionmaker(bind=engine)
    return Session()
