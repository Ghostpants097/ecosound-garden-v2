#!/usr/bin/env python3
"""
Training script for EcoSound Garden ML models.
Trains health predictor and acoustic stress detector on real data.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import os
import json
from datetime import datetime

from models.plant_health_model import PlantHealthPredictor, AcousticStressDetector
from models.acoustic_processor import AcousticDatasetProcessor


def generate_synthetic_training_data(n_samples=1000):
    """Generate synthetic training data for initial model training"""
    print("Generating synthetic training data...")
    
    X = []
    y = []
    
    # Generate healthy plant data (y=1)
    for _ in range(n_samples // 2):
        temp = np.random.normal(24, 3)  # Optimal around 24°C
        humidity = np.random.normal(65, 10)  # Optimal around 65%
        light = np.random.normal(500, 100)  # Optimal around 500 lux
        moisture = np.random.normal(50, 10)  # Optimal around 50%
        ph = np.random.normal(6.5, 0.5)  # Optimal around 6.5
        ec = np.random.normal(1.2, 0.2)  # Optimal EC level
        
        X.append([temp, humidity, light, moisture, ph, ec])
        y.append(1)  # Healthy
    
    # Generate stressed plant data (y=0)
    for _ in range(n_samples // 2):
        temp = np.random.choice([np.random.normal(10, 3), np.random.normal(35, 3)])
        humidity = np.random.choice([np.random.normal(20, 5), np.random.normal(85, 5)])
        light = np.random.normal(200, 100)  # Too low
        moisture = np.random.choice([np.random.normal(15, 5), np.random.normal(85, 5)])
        ph = np.random.choice([np.random.normal(5, 0.5), np.random.normal(8, 0.5)])
        ec = np.random.normal(2.5, 0.3)  # Too high
        
        X.append([temp, humidity, light, moisture, ph, ec])
        y.append(0)  # Stressed
    
    return np.array(X), np.array(y)


def train_health_predictor():
    """Train the plant health predictor model"""
    print("\n" + "="*60)
    print("Training Plant Health Predictor Model")
    print("="*60)
    
    # Generate training data
    X, y = generate_synthetic_training_data(n_samples=2000)
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    
    # Initialize model
    predictor = PlantHealthPredictor()
    
    # Train model
    print(f"\nTraining on {len(X_train)} samples...")
    history = predictor.model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            )
        ]
    )
    
    # Evaluate
    test_loss, test_accuracy = predictor.model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Accuracy: {test_accuracy*100:.1f}%")
    print(f"Test Loss: {test_loss:.4f}")
    
    # Save model
    predictor.save_model()
    print("\nHealth Predictor model saved!")
    
    return {
        'model': 'PlantHealthPredictor',
        'accuracy': float(test_accuracy),
        'loss': float(test_loss),
        'trained_samples': len(X_train),
        'test_samples': len(X_test)
    }


def generate_synthetic_acoustic_data(n_samples=500):
    """Generate synthetic acoustic training data"""
    print("\nGenerating synthetic acoustic training data...")
    
    X = []
    y = []
    processor = AcousticDatasetProcessor()
    
    for i in range(n_samples):
        # Generate synthetic sounds
        healthy, stressed, _ = processor.generate_synthetic_plant_sounds()
        
        # For simplicity, use the first 128 samples as features
        if i % 2 == 0:
            # Healthy plant sound
            features = healthy[:128]
            X.append(features)
            y.append(1)
        else:
            # Stressed plant sound
            features = stressed[:128]
            X.append(features)
            y.append(0)
    
    return np.array(X), np.array(y)


def train_acoustic_detector():
    """Train the acoustic stress detector model"""
    print("\n" + "="*60)
    print("Training Acoustic Stress Detector Model")
    print("="*60)
    
    # Generate training data
    X, y = generate_synthetic_acoustic_data(n_samples=1000)
    
    # Reshape for CNN input
    X = X.reshape(X.shape[0], X.shape[1], 1)
    
    # Normalize
    X = (X - np.mean(X)) / (np.std(X) + 1e-8)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize model
    detector = AcousticStressDetector()
    
    # Train
    print(f"\nTraining on {len(X_train)} audio samples...")
    history = detector.model.fit(
        X_train, y_train,
        epochs=30,
        batch_size=32,
        validation_split=0.2,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True
            )
        ]
    )
    
    # Evaluate
    test_loss, test_accuracy = detector.model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Accuracy: {test_accuracy*100:.1f}%")
    print(f"Test Loss: {test_loss:.4f}")
    
    # Save model
    detector.model.save('acoustic_detector_model.h5')
    print("\nAcoustic Detector model saved!")
    
    return {
        'model': 'AcousticStressDetector',
        'accuracy': float(test_accuracy),
        'loss': float(test_loss),
        'trained_samples': len(X_train),
        'test_samples': len(X_test)
    }


def train_on_custom_data(data_directory: str):
    """Train models on custom plant acoustic data"""
    print("\n" + "="*60)
    print(f"Training on Custom Data: {data_directory}")
    print("="*60)
    
    processor = AcousticDatasetProcessor()
    
    try:
        dataset = processor.create_dataset_from_directory(data_directory)
        print(f"\nDataset Summary: {dataset['summary']}")
        print(f"Total Samples: {len(dataset['labels'])}")
        
        # Train on custom data
        X = dataset['features']
        y = np.array(dataset['labels'])
        
        # Normalize
        X = (X - np.mean(X)) / (np.std(X) + 1e-8)
        
        # Train acoustic model
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        detector = AcousticStressDetector()
        detector.model.fit(
            X_train, y_train,
            epochs=25,
            batch_size=16,
            validation_split=0.2,
            verbose=1
        )
        
        test_loss, test_accuracy = detector.model.evaluate(X_test, y_test, verbose=0)
        print(f"\nCustom Data Test Accuracy: {test_accuracy*100:.1f}%")
        
        return {
            'model': 'AcousticStressDetector (Custom Data)',
            'accuracy': float(test_accuracy),
            'loss': float(test_loss),
            'data_source': data_directory
        }
    except Exception as e:
        print(f"Error training on custom data: {e}")
        return None


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("EcoSound Garden - Model Training Pipeline")
    print("="*60)
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'models': []
    }
    
    # Train health predictor
    health_results = train_health_predictor()
    results['models'].append(health_results)
    
    # Train acoustic detector
    acoustic_results = train_acoustic_detector()
    results['models'].append(acoustic_results)
    
    # Optional: Train on custom data if directory exists
    if os.path.exists('data/plant_recordings'):
        custom_results = train_on_custom_data('data/plant_recordings')
        if custom_results:
            results['models'].append(custom_results)
    
    # Save training results
    with open('training_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*60)
    print("Training Complete!")
    print("="*60)
    print(f"\nResults saved to training_results.json")
    print(f"\nModel Summary:")
    for model in results['models']:
        print(f"  - {model['model']}: {model['accuracy']*100:.1f}% accuracy")


if __name__ == '__main__':
    main()
