"""
Train ML models for plant health prediction and acoustic stress detection.
Models are saved in TensorFlow.js format for browser deployment.
"""

import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Tuple
import json
import os

def create_health_prediction_model(input_dim: int = 3) -> tf.keras.Model:
    """
    Create neural network for plant health prediction.
    Input: [healthScore, temperature, humidity] (normalized)
    Output: [predicted_health, confidence]
    """
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_dim=input_dim),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dense(2, activation='sigmoid')  # [health_score, confidence]
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def create_acoustic_stress_model(input_dim: int = 157) -> tf.keras.Model:
    """
    Create neural network for acoustic stress detection.
    Input: 157-dimensional acoustic feature vector (MFCC + mel-spec + etc.)
    Output: [stress_level, confidence]
    """
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_dim=input_dim),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dense(2, activation='sigmoid')  # [stress_level, confidence]
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def generate_synthetic_health_data(n_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic training data for health prediction.
    In production, use real plant data.
    """
    np.random.seed(42)
    
    # Generate random inputs
    health_scores = np.random.uniform(20, 100, n_samples)
    temperatures = np.random.uniform(15, 30, n_samples)
    humidity = np.random.uniform(30, 90, n_samples)
    
    X = np.column_stack([
        health_scores / 100,  # Normalize
        temperatures / 30,
        humidity / 100
    ])
    
    # Generate synthetic outputs based on simple rules
    predicted_health = np.zeros(n_samples)
    confidence = np.zeros(n_samples)
    
    for i in range(n_samples):
        # Simple domain model
        temp_score = 1 - abs(temperatures[i] - 23) / 15
        humidity_score = 1 - abs(humidity[i] - 60) / 30
        
        predicted_health[i] = (health_scores[i] / 100 * 0.5 + 
                              temp_score * 0.25 + 
                              humidity_score * 0.25)
        
        # Higher confidence when conditions are optimal
        confidence[i] = 0.5 + (temp_score * 0.25) + (humidity_score * 0.25)
    
    y = np.column_stack([predicted_health, confidence])
    
    return X, y

def generate_synthetic_acoustic_data(n_samples: int = 500) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic acoustic training data.
    In production, use real plant acoustic recordings.
    """
    np.random.seed(42)
    
    # Generate 157-dimensional acoustic feature vectors
    X = np.random.randn(n_samples, 157)
    
    # Generate stress levels and confidence
    stress_levels = np.random.uniform(0, 1, n_samples)
    confidence = np.random.uniform(0.6, 1, n_samples)
    
    y = np.column_stack([stress_levels, confidence])
    
    return X, y

def train_health_model(X: np.ndarray, y: np.ndarray, epochs: int = 50):
    """Train health prediction model."""
    print("Training health prediction model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Normalize
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create and train model
    model = create_health_prediction_model(input_dim=X_train.shape[1])
    
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_test_scaled, y_test),
        epochs=epochs,
        batch_size=32,
        verbose=1
    )
    
    # Evaluate
    loss, mae = model.evaluate(X_test_scaled, y_test)
    print(f"Test Loss: {loss:.4f}, MAE: {mae:.4f}")
    
    return model, scaler, history

def train_acoustic_model(X: np.ndarray, y: np.ndarray, epochs: int = 50):
    """Train acoustic stress detection model."""
    print("Training acoustic stress detection model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Normalize
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create and train model
    model = create_acoustic_stress_model(input_dim=X_train.shape[1])
    
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_test_scaled, y_test),
        epochs=epochs,
        batch_size=16,
        verbose=1
    )
    
    # Evaluate
    loss, mae = model.evaluate(X_test_scaled, y_test)
    print(f"Test Loss: {loss:.4f}, MAE: {mae:.4f}")
    
    return model, scaler, history

def export_tfjs_model(model: tf.keras.Model, output_dir: str, model_name: str):
    """Export model to TensorFlow.js format."""
    os.makedirs(output_dir, exist_ok=True)
    
    tfjs_model_path = os.path.join(output_dir, model_name)
    
    # Export using tfjs converter
    import tensorflowjs as tfjs
    tfjs.converters.save_keras_model(model, tfjs_model_path)
    
    print(f"Model exported to {tfjs_model_path}")

def main():
    """Main training pipeline."""
    print("EcoSound Garden - ML Model Training Pipeline")
    print("=" * 50)
    
    # Create output directories
    os.makedirs('public/models/plant-health-model', exist_ok=True)
    os.makedirs('public/models/acoustic-stress-model', exist_ok=True)
    
    # Train health prediction model
    print("\n1. Training Health Prediction Model...")
    X_health, y_health = generate_synthetic_health_data(1000)
    health_model, health_scaler, health_history = train_health_model(X_health, y_health)
    
    # Export health model
    try:
        export_tfjs_model(
            health_model,
            'public/models/plant-health-model',
            'plant-health-model'
        )
    except ImportError:
        print("Warning: tensorflowjs not installed. Skipping TFJS export.")
        print("To export TFJS models, install: pip install tensorflowjs")
    
    # Train acoustic model
    print("\n2. Training Acoustic Stress Detection Model...")
    X_acoustic, y_acoustic = generate_synthetic_acoustic_data(500)
    acoustic_model, acoustic_scaler, acoustic_history = train_acoustic_model(X_acoustic, y_acoustic)
    
    # Export acoustic model
    try:
        export_tfjs_model(
            acoustic_model,
            'public/models/acoustic-stress-model',
            'acoustic-stress-model'
        )
    except ImportError:
        print("Warning: tensorflowjs not installed. Skipping TFJS export.")
    
    # Save scalers for inference
    import pickle
    with open('models/health_scaler.pkl', 'wb') as f:
        pickle.dump(health_scaler, f)
    with open('models/acoustic_scaler.pkl', 'wb') as f:
        pickle.dump(acoustic_scaler, f)
    
    print("\n" + "=" * 50)
    print("Training complete!")
    print(f"Health model accuracy: {health_history.history['mae'][-1]:.4f}")
    print(f"Acoustic model accuracy: {acoustic_history.history['mae'][-1]:.4f}")

if __name__ == '__main__':
    main()
