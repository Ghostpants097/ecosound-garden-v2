import numpy as np
import librosa
from typing import Tuple, List
import json

class AudioProcessor:
    """
    Process and extract features from plant acoustic recordings.
    Features: MFCC, mel-spectrogram, zero-crossing rate, etc.
    """
    
    def __init__(self, sr: int = 22050):
        self.sr = sr
        self.n_mfcc = 13
        self.n_fft = 2048
        self.hop_length = 512
        
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """Load audio file and return waveform and sample rate."""
        y, sr = librosa.load(file_path, sr=self.sr)
        return y, sr
    
    def extract_mfcc(self, y: np.ndarray, sr: int) -> np.ndarray:
        """Extract MFCC features from audio."""
        mfcc = librosa.feature.mfcc(
            y=y, sr=sr, n_mfcc=self.n_mfcc,
            n_fft=self.n_fft, hop_length=self.hop_length
        )
        # Return mean and std of MFCCs
        mfcc_mean = np.mean(mfcc, axis=1)
        mfcc_std = np.std(mfcc, axis=1)
        return np.concatenate([mfcc_mean, mfcc_std])
    
    def extract_mel_spectrogram(self, y: np.ndarray, sr: int) -> np.ndarray:
        """Extract mel-spectrogram features."""
        mel_spec = librosa.feature.melspectrogram(
            y=y, sr=sr, n_fft=self.n_fft, hop_length=self.hop_length
        )
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        # Return mean power across time
        return np.mean(mel_spec_db, axis=1)
    
    def extract_zero_crossing_rate(self, y: np.ndarray) -> float:
        """Extract zero-crossing rate (indicates noise/rustling)."""
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        return np.mean(zcr)
    
    def extract_spectral_centroid(self, y: np.ndarray, sr: int) -> float:
        """Extract spectral centroid (center of mass of spectrum)."""
        spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        return np.mean(spec_cent)
    
    def extract_spectral_rolloff(self, y: np.ndarray, sr: int) -> float:
        """Extract spectral rolloff."""
        spec_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        return np.mean(spec_rolloff)
    
    def extract_all_features(self, file_path: str) -> np.ndarray:
        """
        Extract all acoustic features from audio file.
        Returns a feature vector ready for ML model.
        """
        y, sr = self.load_audio(file_path)
        
        features = []
        
        # MFCC features (26 values: 13 mean + 13 std)
        features.extend(self.extract_mfcc(y, sr))
        
        # Mel-spectrogram (128 values)
        features.extend(self.extract_mel_spectrogram(y, sr))
        
        # Zero-crossing rate
        features.append(self.extract_zero_crossing_rate(y))
        
        # Spectral centroid
        features.append(self.extract_spectral_centroid(y, sr))
        
        # Spectral rolloff
        features.append(self.extract_spectral_rolloff(y, sr))
        
        return np.array(features)
    
    def compute_stress_indicators(self, features: np.ndarray) -> dict:
        """
        Compute plant stress indicators from acoustic features.
        Higher values indicate more stress.
        """
        mfcc_features = features[:26]
        mel_features = features[26:154]
        zcr = features[154]
        spec_centroid = features[155]
        spec_rolloff = features[156]
        
        # High variance in MFCC suggests stressed plant
        mfcc_variance = np.std(mfcc_features)
        
        # High zero-crossing rate indicates rustling/stress response
        zcr_normalized = min(1.0, zcr / 0.2)
        
        # Spectral centroid shift indicates abnormal acoustics
        spec_cent_stress = min(1.0, abs(spec_centroid - 3000) / 3000)
        
        # Combined stress indicator
        stress_level = (mfcc_variance / 10 * 0.3 + 
                       zcr_normalized * 0.4 + 
                       spec_cent_stress * 0.3)
        
        return {
            'mfcc_variance': float(mfcc_variance),
            'zcr_normalized': float(zcr_normalized),
            'spectral_stress': float(spec_cent_stress),
            'overall_stress': min(1.0, float(stress_level))
        }


class AcousticDataset:
    """Manage plant acoustic dataset for ML training."""
    
    def __init__(self):
        self.processor = AudioProcessor()
        self.data = []
    
    def add_recording(self, file_path: str, plant_id: int, 
                     plant_status: str, label: int):
        """
        Add audio recording to dataset.
        label: 0=healthy, 1=stressed, 2=critical
        """
        try:
            features = self.processor.extract_all_features(file_path)
            stress_indicators = self.processor.compute_stress_indicators(features)
            
            recording = {
                'plant_id': plant_id,
                'plant_status': plant_status,
                'label': label,
                'features': features.tolist(),
                'stress_indicators': stress_indicators,
                'file_path': file_path
            }
            self.data.append(recording)
            return True
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return False
    
    def get_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get feature matrix and labels for training."""
        if not self.data:
            return np.array([]), np.array([])
        
        X = np.array([d['features'] for d in self.data])
        y = np.array([d['label'] for d in self.data])
        return X, y
    
    def save_to_json(self, output_path: str):
        """Save dataset to JSON."""
        with open(output_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def load_from_json(self, input_path: str):
        """Load dataset from JSON."""
        with open(input_path, 'r') as f:
            self.data = json.load(f)
    
    def get_statistics(self) -> dict:
        """Get dataset statistics."""
        if not self.data:
            return {}
        
        labels = [d['label'] for d in self.data]
        return {
            'total_recordings': len(self.data),
            'healthy': labels.count(0),
            'stressed': labels.count(1),
            'critical': labels.count(2),
            'total_features_per_sample': len(self.data[0]['features'])
        }
