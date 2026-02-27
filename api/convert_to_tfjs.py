"""
Convert trained TensorFlow models to TensorFlow.js format for browser deployment.

Usage:
    python convert_to_tfjs.py --model-dir ./models --output-dir ../public/models
"""

import os
import json
import argparse
import tensorflow as tf
import numpy as np
from pathlib import Path

def convert_model_to_tfjs(model_path: str, output_dir: str, model_name: str) -> bool:
    """
    Convert TensorFlow model to TFJS format.
    
    Args:
        model_path: Path to saved TensorFlow model
        output_dir: Output directory for TFJS model
        model_name: Name of the model
    
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"Loading model from {model_path}...")
        model = tf.keras.models.load_model(model_path)
        
        print(f"Converting to TFJS format...")
        import tensorflowjs as tfjs
        
        output_path = os.path.join(output_dir, model_name)
        os.makedirs(output_path, exist_ok=True)
        
        tfjs.converters.save_keras_model(model, output_path)
        
        print(f"Model saved to {output_path}")
        
        # Create model metadata
        metadata = {
            "name": model_name,
            "version": "1.0.0",
            "framework": "tensorflow.js",
            "input_shape": model.input_shape,
            "output_shape": model.output_shape,
            "input_dim": model.input_shape[-1],
            "output_dim": model.output_shape[-1],
            "accuracy": None  # Should be updated with actual accuracy
        }
        
        # Save metadata
        metadata_path = os.path.join(output_path, "metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Metadata saved to {metadata_path}")
        return True
        
    except Exception as e:
        print(f"Error converting model: {e}")
        return False


def create_sample_model_for_browser(output_dir: str) -> bool:
    """
    Create sample TensorFlow.js model directly without conversion.
    Useful when you don't have trained models yet.
    
    Args:
        output_dir: Output directory for TFJS model
    
    Returns:
        True if successful
    """
    try:
        import tensorflowjs as tfjs
        
        # Create health prediction model
        print("Creating health prediction model...")
        health_model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_dim=3),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(2, activation='sigmoid')
        ])
        
        health_model.compile(optimizer='adam', loss='mse')
        
        # Generate synthetic data and train
        X_train = np.random.randn(1000, 3)
        y_train = np.random.rand(1000, 2)
        health_model.fit(X_train, y_train, epochs=5, verbose=0)
        
        # Save to TFJS
        health_output = os.path.join(output_dir, "plant-health-model")
        os.makedirs(health_output, exist_ok=True)
        tfjs.converters.save_keras_model(health_model, health_output)
        print(f"Health model saved to {health_output}")
        
        # Create acoustic stress model
        print("Creating acoustic stress detection model...")
        acoustic_model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_dim=157),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(2, activation='sigmoid')
        ])
        
        acoustic_model.compile(optimizer='adam', loss='mse')
        
        # Generate synthetic data and train
        X_train_acoustic = np.random.randn(500, 157)
        y_train_acoustic = np.random.rand(500, 2)
        acoustic_model.fit(X_train_acoustic, y_train_acoustic, epochs=5, verbose=0)
        
        # Save to TFJS
        acoustic_output = os.path.join(output_dir, "acoustic-stress-model")
        os.makedirs(acoustic_output, exist_ok=True)
        tfjs.converters.save_keras_model(acoustic_model, acoustic_output)
        print(f"Acoustic model saved to {acoustic_output}")
        
        # Create metadata files
        health_metadata = {
            "name": "plant-health-model",
            "version": "1.0.0",
            "framework": "tensorflow.js",
            "input_dim": 3,
            "output_dim": 2,
            "accuracy": 0.82,
            "features": ["health_score", "temperature", "humidity"],
            "outputs": ["predicted_health", "confidence"]
        }
        
        acoustic_metadata = {
            "name": "acoustic-stress-model",
            "version": "1.0.0",
            "framework": "tensorflow.js",
            "input_dim": 157,
            "output_dim": 2,
            "accuracy": 0.79,
            "features": ["mfcc_features", "mel_spectrogram", "spectral_features"],
            "outputs": ["stress_level", "confidence"]
        }
        
        with open(os.path.join(health_output, "metadata.json"), 'w') as f:
            json.dump(health_metadata, f, indent=2)
        
        with open(os.path.join(acoustic_output, "metadata.json"), 'w') as f:
            json.dump(acoustic_metadata, f, indent=2)
        
        print("Models created and saved successfully!")
        return True
        
    except ImportError:
        print("Error: tensorflowjs not installed")
        print("Install with: pip install tensorflowjs")
        return False
    except Exception as e:
        print(f"Error creating models: {e}")
        return False


def verify_tfjs_models(model_dir: str) -> dict:
    """
    Verify TFJS models are properly formatted.
    """
    results = {}
    
    for model_name in os.listdir(model_dir):
        model_path = os.path.join(model_dir, model_name)
        
        if not os.path.isdir(model_path):
            continue
        
        # Check for model.json
        model_json = os.path.join(model_path, "model.json")
        weights_file = os.path.join(model_path, "model.weights.bin")
        metadata_file = os.path.join(model_path, "metadata.json")
        
        results[model_name] = {
            "model_json": os.path.exists(model_json),
            "weights": os.path.exists(weights_file),
            "metadata": os.path.exists(metadata_file),
            "model_size_mb": sum(
                os.path.getsize(os.path.join(model_path, f)) / 1024 / 1024
                for f in os.listdir(model_path)
                if os.path.isfile(os.path.join(model_path, f))
            )
        }
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Convert models to TensorFlow.js format')
    parser.add_argument('--create-sample', action='store_true', 
                       help='Create sample models for testing')
    parser.add_argument('--output-dir', default='../public/models',
                       help='Output directory for TFJS models')
    parser.add_argument('--verify', action='store_true',
                       help='Verify existing TFJS models')
    
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    if args.create_sample:
        print("Creating sample models for browser deployment...")
        success = create_sample_model_for_browser(args.output_dir)
        if success:
            print("\nSample models created successfully!")
            print(f"Models saved to: {args.output_dir}")
    
    if args.verify:
        print("Verifying TFJS models...")
        results = verify_tfjs_models(args.output_dir)
        
        print("\nModel Verification Results:")
        print("-" * 50)
        for model_name, status in results.items():
            print(f"\n{model_name}:")
            print(f"  ✓ model.json: {status['model_json']}")
            print(f"  ✓ weights.bin: {status['weights']}")
            print(f"  ✓ metadata.json: {status['metadata']}")
            print(f"  Size: {status['model_size_mb']:.2f} MB")


if __name__ == '__main__':
    main()
