import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import StandardScaler
import joblib

class PlantHealthPredictor:
    def __init__(self, model_path='plant_health_model.h5'):
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.model = self._build_model()
        self.feature_names = [
            'temperature', 'humidity', 'light_level', 
            'soil_moisture', 'ph_level', 'ec_level'
        ]

    def _build_model(self):
        """Build LSTM neural network for plant health prediction"""
        model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(6,)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model

    def preprocess_data(self, sensor_data: dict) -> np.ndarray:
        """Normalize sensor input data"""
        features = np.array([[
            sensor_data.get('temperature', 22),
            sensor_data.get('humidity', 60),
            sensor_data.get('light_level', 500),
            sensor_data.get('soil_moisture', 50),
            sensor_data.get('ph_level', 6.5),
            sensor_data.get('ec_level', 1.2)
        ]])
        
        return self.scaler.fit_transform(features)

    def predict_health(self, sensor_data: dict) -> dict:
        """Predict plant health based on sensor readings"""
        processed_data = self.preprocess_data(sensor_data)
        
        # Predict health score (0-100)
        raw_prediction = self.model.predict(processed_data, verbose=0)[0][0]
        health_score = int(raw_prediction * 100)
        
        # Determine status
        if health_score >= 80:
            status = 'healthy'
        elif health_score >= 60:
            status = 'stressed'
        else:
            status = 'critical'
        
        return {
            'health_score': health_score,
            'status': status,
            'confidence': round(abs(raw_prediction - 0.5) * 200, 1),
            'recommendations': self._get_recommendations(sensor_data, status)
        }

    def _get_recommendations(self, sensor_data: dict, status: str) -> list:
        """Generate care recommendations based on sensor data and status"""
        recommendations = []
        
        temp = sensor_data.get('temperature', 22)
        humidity = sensor_data.get('humidity', 60)
        moisture = sensor_data.get('soil_moisture', 50)
        
        if temp < 15:
            recommendations.append("Temperature too low - increase warmth")
        elif temp > 30:
            recommendations.append("Temperature too high - provide shade/ventilation")
        
        if humidity < 30:
            recommendations.append("Too dry - increase misting/humidity")
        elif humidity > 85:
            recommendations.append("Too humid - improve air circulation")
        
        if moisture < 30:
            recommendations.append("Soil too dry - water plant")
        elif moisture > 80:
            recommendations.append("Soil too wet - reduce watering")
        
        if status == 'critical':
            recommendations.append("Urgent: Check for pests/disease")
        
        return recommendations[:3]  # Return top 3 recommendations

    def save_model(self):
        """Save trained model to disk"""
        self.model.save(self.model_path)
        joblib.dump(self.scaler, 'scaler.pkl')

    def load_model(self):
        """Load pre-trained model"""
        try:
            self.model = keras.models.load_model(self.model_path)
            self.scaler = joblib.load('scaler.pkl')
        except:
            pass


class AcousticStressDetector:
    def __init__(self):
        self.model = self._build_acoustic_model()

    def _build_acoustic_model(self):
        """Build CNN for acoustic stress pattern detection"""
        model = keras.Sequential([
            keras.layers.Conv1D(32, 3, activation='relu', input_shape=(128, 1)),
            keras.layers.MaxPooling1D(2),
            keras.layers.Conv1D(64, 3, activation='relu'),
            keras.layers.MaxPooling1D(2),
            keras.layers.Flatten(),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model

    def analyze_acoustic_pattern(self, acoustic_features: np.ndarray) -> dict:
        """Analyze plant acoustic patterns for stress detection"""
        # Ensure input shape is correct
        if acoustic_features.shape != (128, 1):
            acoustic_features = np.reshape(acoustic_features, (-1, 128, 1))
        
        stress_score = self.model.predict(acoustic_features, verbose=0)[0][0]
        
        return {
            'acoustic_stress_level': round(stress_score * 100, 1),
            'stress_detected': stress_score > 0.5,
            'confidence': round(abs(stress_score - 0.5) * 200, 1)
        }
