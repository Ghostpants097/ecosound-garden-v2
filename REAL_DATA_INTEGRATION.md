# Real Data Integration Guide

This guide covers all three approaches to integrate real data into your EcoSound Garden system.

## Overview

Your system now supports three data sources:
1. **IoT Sensors** - Real hardware sensors (DHT22, soil moisture, light sensors)
2. **Public Datasets** - Free academic and research datasets
3. **Simulated Data** - Realistic synthetic data for testing and development

---

## Option 1: IoT Sensor Data Integration

### What You Get
- Real-time temperature, humidity, soil moisture, and light intensity readings
- Acoustic pattern detection from plant stress
- Live sensor dashboard in the UI

### Components
- `lib/iotSimulator.ts` - Simulates realistic sensor behavior
- `app/api/sensors/ingest/route.ts` - API endpoint to receive sensor data
- `components/RealTimeSensorDashboard.tsx` - Real-time display dashboard

### Setup Steps

#### Step 1: Connect IoT Sensors

Use any of these sensors:
- **Temperature/Humidity**: DHT22, BME280, SHT31
- **Soil Moisture**: Capacitive moisture sensor, TDS sensor
- **Light**: BH1750 light sensor, LDR with ADC
- **Microphone**: MEMS microphone, analog microphone with amplifier

#### Step 2: Send Data to Backend

From your IoT device (Arduino, Raspberry Pi, ESP32):

```python
import requests
import json

# Read sensor values from your hardware
temperature = read_temperature()  # Your sensor code
humidity = read_humidity()
soil_moisture = read_soil_moisture()
light_intensity = read_light_intensity()

# Send to backend
data = {
    'plantId': 1,
    'temperature': temperature,
    'humidity': humidity,
    'soilMoisture': soil_moisture,
    'lightIntensity': light_intensity,
    'acousticData': None  # Optional: send audio features if available
}

response = requests.post(
    'http://localhost:3000/api/sensors/ingest',
    json=data,
    headers={'Content-Type': 'application/json'}
)

print(response.json())
```

#### Step 3: View in Dashboard

1. Open the Real-Time Sensor Dashboard component
2. Click "Start Live" to begin receiving updates
3. The dashboard updates every 5 seconds with new readings

### Example Arduino/ESP32 Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "http://192.168.1.100:3000/api/sensors/ingest";

void setup() {
    Serial.begin(115200);
    dht.begin();
    WiFi.begin(ssid, password);
}

void loop() {
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    if (WiFi.connected()) {
        HTTPClient http;
        http.begin(serverURL);
        http.addHeader("Content-Type", "application/json");
        
        String payload = "{\"plantId\":1,\"temperature\":" + String(temp) + 
                        ",\"humidity\":" + String(humidity) + "}";
        
        int httpResponseCode = http.POST(payload);
        http.end();
    }
    
    delay(5000); // Send every 5 seconds
}
```

---

## Option 2: Public Dataset Integration

### Available Datasets

1. **ESC-50** (Environmental Sounds)
   - 2,000 audio recordings
   - Includes rustling, wind, water sounds
   - Use for acoustic stress pattern training
   - Download: https://github.com/karolpiczak/ESC-50

2. **Plant Village Dataset**
   - 54,000 plant images
   - Healthy and diseased plants
   - Use for visual health assessment
   - Download: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset

3. **Open Images Dataset**
   - 100,000+ plant images
   - Highly diverse plant types and conditions
   - Use for general plant recognition
   - Download: https://storage.googleapis.com/openimages/

4. **COCO-plants (Subset)**
   - 500,000+ object detection samples
   - Plant-specific subset available
   - Use for advanced plant detection
   - Download: https://cocodataset.org

5. **Acoustic Plant Stress Recordings**
   - 500+ research recordings
   - Real plant stress acoustic emissions
   - Use for stress detection model training
   - Download: https://zenodo.org/search?q=plant+acoustic

### Components
- `lib/publicDatasets.ts` - Dataset registry and feature extraction
- `components/DatasetBrowser.tsx` - Browse and download datasets

### Setup Steps

#### Step 1: Browse Available Datasets
1. Open the Dataset Browser in your dashboard
2. Select a category (Acoustic, Plant Health, or Environmental)
3. Click a dataset to view details

#### Step 2: Download Dataset

```bash
# ESC-50 example
git clone https://github.com/karolpiczak/ESC-50.git
cd ESC-50/audio

# Plant Village example
# Download from Kaggle (requires free account)
kaggle datasets download -d abdallahalidev/plantvillage-dataset
unzip plantvillage-dataset.zip
```

#### Step 3: Extract Features

```python
# For audio (ESC-50)
import librosa
import numpy as np

def extract_mfcc_features(audio_file):
    """Extract MFCC features from audio file"""
    y, sr = librosa.load(audio_file)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return np.mean(mfcc, axis=1)

# For images (Plant Village)
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image

def extract_image_features(image_file):
    """Extract ResNet50 embeddings from plant image"""
    model = ResNet50(weights='imagenet', include_top=False)
    img = image.load_img(image_file, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    return model.predict(x).flatten()
```

#### Step 4: Upload to Backend

```bash
# Upload processed features
curl -X POST http://localhost:8000/api/dataset/upload \
  -F "file=@features.json" \
  -F "dataset_name=ESC-50"
```

---

## Option 3: Hybrid Approach

Use all three sources together for maximum data quality:

```
┌─────────────────────────────────────────────┐
│         EcoSound Garden Dashboard           │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   IoT Sensors  Datasets   Simulated Data
        │          │          │
        └──────────┼──────────┘
                   │
        ┌──────────▼──────────┐
        │  Data Normalization │
        │  Feature Fusion     │
        │  Conflict Resolution│
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   ML Model Training │
        │   & Inference       │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Real-time Health   │
        │  Predictions        │
        └─────────────────────┘
```

### Implementation

```typescript
// Combine all data sources
import { generateSensorReading } from '@/lib/iotSimulator';
import { getPublicDatasetSamples } from '@/lib/publicDatasets';

export async function getCombinedPlantData(plantId: number) {
  // Get real-time sensor data
  const sensorData = generateSensorReading(plantId);
  
  // Get public dataset examples for comparison
  const datasetExamples = getPublicDatasetSamples('plant-health');
  
  // Combine for ML model input
  const combinedFeatures = {
    sensorReadings: sensorData,
    historicalExamples: datasetExamples,
    timestamp: new Date(),
  };
  
  return combinedFeatures;
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│           EcoSound Garden Data Pipeline             │
└─────────────────────────────────────────────────────┘

1. Data Collection
   └─> IoT Sensors / Public Datasets / Simulated Data

2. Data Ingestion
   └─> API endpoint: POST /api/sensors/ingest
   └─> Validation & Normalization
   └─> Storage (In-memory / PostgreSQL)

3. Feature Extraction
   └─> MFCC for audio
   └─> ResNet embeddings for images
   └─> Sensor value normalization

4. Model Inference
   └─> TensorFlow.js (Browser)
   └─> FastAPI Backend (Server)
   └─> Ensemble predictions

5. Visualization
   └─> Real-time dashboards
   └─> Health trends
   └─> Stress predictions
   └─> Care recommendations
```

---

## API Endpoints

### Ingest Sensor Data
```http
POST /api/sensors/ingest

{
  "plantId": 1,
  "temperature": 22.5,
  "humidity": 65.0,
  "soilMoisture": 60.0,
  "lightIntensity": 500,
  "acousticData": [100, 150, 200, ...]  // Optional
}

Response:
{
  "success": true,
  "message": "Sensor data ingested successfully",
  "reading": { ... }
}
```

### Get Recent Readings
```http
GET /api/sensors/ingest?plantId=1&limit=100

Response:
{
  "success": true,
  "plantId": 1,
  "readingCount": 50,
  "readings": [ ... ]
}
```

---

## Best Practices

### For IoT Sensors
- Send readings every 5-30 minutes (adjust based on plant needs)
- Include error handling and retry logic
- Validate data before sending (check ranges)
- Use HTTPS in production

### For Public Datasets
- Pre-process data to match your feature dimensions
- Normalize values to 0-1 range
- Remove outliers and invalid samples
- Document data source and license

### For Hybrid Systems
- Prioritize real sensor data over simulated
- Use datasets for model training
- Use simulation for testing
- Implement data versioning

---

## Troubleshooting

### Sensor Data Not Appearing
1. Check API endpoint is accessible: `curl http://localhost:3000/api/sensors/ingest`
2. Verify JSON format matches specification
3. Check browser console for errors
4. Verify plantId matches plant in your system (1-10)

### Datasets Not Loading
1. Check dataset URL is accessible
2. Verify you have internet connection
3. Check browser DevTools Network tab
4. Ensure dataset format is correct

### Poor Model Predictions
1. Collect more training data (at least 100 samples per plant)
2. Verify sensor calibration
3. Check for data normalization issues
4. Use balanced dataset (similar samples per category)

---

## Next Steps

1. **Day 1-2**: Set up IoT sensors and test basic data ingestion
2. **Day 3-5**: Download and process public datasets
3. **Day 6-7**: Retrain ML models with your combined data
4. **Week 2+**: Deploy to production with continuous data pipeline

See DEPLOYMENT.md for production setup instructions.
