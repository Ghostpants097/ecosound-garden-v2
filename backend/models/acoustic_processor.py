import numpy as np
import librosa
from scipy import signal
from scipy.fft import fft
import soundfile as sf

class AcousticDatasetProcessor:
    """Process real acoustic data from plant recordings"""
    
    def __init__(self, sr=22050):
        self.sr = sr  # Sample rate
        self.n_mfcc = 13  # Number of MFCC coefficients
        self.n_fft = 2048
        self.hop_length = 512

    def extract_mfcc_features(self, audio_path: str) -> np.ndarray:
        """Extract MFCC features from audio file"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Extract MFCC
            mfcc = librosa.feature.mfcc(
                y=y, sr=sr, n_mfcc=self.n_mfcc,
                n_fft=self.n_fft, hop_length=self.hop_length
            )
            
            # Return mean values for each MFCC coefficient
            return np.mean(mfcc, axis=1)
        except Exception as e:
            print(f"Error processing audio: {e}")
            return np.zeros(self.n_mfcc)

    def extract_spectral_features(self, audio_path: str) -> dict:
        """Extract spectral features from audio"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Spectral centroid
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y)
            
            # RMS Energy
            rms = librosa.feature.rms(y=y)
            
            # Spectral rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            
            return {
                'spectral_centroid': np.mean(spectral_centroid),
                'zero_crossing_rate': np.mean(zcr),
                'rms_energy': np.mean(rms),
                'spectral_rolloff': np.mean(spectral_rolloff)
            }
        except Exception as e:
            print(f"Error extracting spectral features: {e}")
            return {}

    def generate_synthetic_plant_sounds(self, duration=3.0) -> np.ndarray:
        """Generate synthetic acoustic patterns for healthy and stressed plants"""
        t = np.linspace(0, duration, int(self.sr * duration))
        
        # Healthy plant: mixture of low-frequency rustling + leaf vibrations
        healthy = (
            0.3 * signal.sawtooth(2 * np.pi * 120 * t) +  # Base rustling
            0.2 * np.sin(2 * np.pi * 240 * t) +  # Leaf vibrations
            0.1 * np.sin(2 * np.pi * 480 * t) +  # Harmonics
            0.05 * np.random.normal(0, 0.1, len(t))  # Soft noise
        )
        
        # Stressed plant: irregular patterns + stress clicks
        stressed = (
            0.4 * signal.square(2 * np.pi * 80 * t) +  # Irregular rustling
            0.25 * np.sin(2 * np.pi * 160 * t) +  # Frequency shift
            0.15 * signal.sawtooth(2 * np.pi * 320 * t) +  # Stress pattern
            0.1 * np.random.normal(0, 0.2, len(t))  # Higher noise floor
        )
        
        return healthy, stressed, t

    def extract_temporal_features(self, audio_path: str) -> dict:
        """Extract time-domain features"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Onset strength
            onset_strength = librosa.onset.onset_strength(y=y, sr=sr)
            
            # Tempogram
            tempogram = librosa.feature.tempogram(onset_strength=onset_strength)
            
            return {
                'onset_strength_mean': np.mean(onset_strength),
                'onset_strength_std': np.std(onset_strength),
                'tempogram_mean': np.mean(tempogram)
            }
        except Exception as e:
            print(f"Error extracting temporal features: {e}")
            return {}

    def create_spectrogram(self, audio_path: str, n_mels=128) -> np.ndarray:
        """Create mel-spectrogram for visualization"""
        try:
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            mel_spec = librosa.feature.melspectrogram(
                y=y, sr=sr, n_fft=self.n_fft,
                hop_length=self.hop_length, n_mels=n_mels
            )
            
            # Convert to dB scale
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            return mel_spec_db
        except Exception as e:
            print(f"Error creating spectrogram: {e}")
            return None

    def normalize_features(self, features: np.ndarray) -> np.ndarray:
        """Normalize features for ML model input"""
        mean = np.mean(features)
        std = np.std(features)
        
        if std == 0:
            return features - mean
        return (features - mean) / std

    def create_dataset_from_directory(self, directory_path: str, healthy_ratio=0.7):
        """Create training dataset from plant audio recordings"""
        import os
        
        dataset = {'features': [], 'labels': [], 'plant_names': []}
        
        healthy_count = 0
        stressed_count = 0
        
        for filename in os.listdir(directory_path):
            if filename.endswith('.wav'):
                audio_path = os.path.join(directory_path, filename)
                
                # Extract features
                mfcc = self.extract_mfcc_features(audio_path)
                spectral = self.extract_spectral_features(audio_path)
                temporal = self.extract_temporal_features(audio_path)
                
                # Combine all features
                combined_features = np.concatenate([
                    mfcc,
                    [spectral.get('spectral_centroid', 0)],
                    [spectral.get('zero_crossing_rate', 0)],
                    [temporal.get('onset_strength_mean', 0)]
                ])
                
                # Determine label based on filename
                is_healthy = 'healthy' in filename.lower() or healthy_count < len(os.listdir(directory_path)) * healthy_ratio
                
                dataset['features'].append(combined_features)
                dataset['labels'].append(1 if is_healthy else 0)
                dataset['plant_names'].append(filename.split('.')[0])
                
                if is_healthy:
                    healthy_count += 1
                else:
                    stressed_count += 1
        
        return {
            'features': np.array(dataset['features']),
            'labels': np.array(dataset['labels']),
            'plant_names': dataset['plant_names'],
            'summary': f"Healthy: {healthy_count}, Stressed: {stressed_count}"
        }
