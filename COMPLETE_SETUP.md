# Complete EcoSound Garden Setup Guide

Real Data Integration for Plant Health Monitoring with ML

---

## Table of Contents

1. [What You Have](#what-you-have)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Real Data Integration (Choose One)](#real-data-integration-choose-one)
4. [Production Deployment](#production-deployment)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)

---

## What You Have

Your EcoSound Garden system now includes:

### Frontend (Next.js 16)
- Real-time sensor dashboard showing live IoT data
- Public dataset browser for academic datasets
- ML prediction visualizations
- Interactive plant health monitoring
- CCTV-style plant imagery
- Synthetic acoustic analysis

### Backend (FastAPI)
- REST API for sensor data ingestion
- ML model serving endpoints
- Dataset management
- Real-time data processing
- PostgreSQL database integration

### Data Sources
1. **IoT Sensors** - Real hardware sensors (DHT22, soil moisture, light)
2. **Public Datasets** - Free datasets (ESC-50, Plant Village, COCO)
3. **Simulated Data** - Realistic synthetic data for testing

### ML Models
- Plant health prediction model
- Acoustic stress detection model
- TensorFlow.js for browser inference
- FastAPI model serving

---

## Quick Start (5 minutes)

### 1. Frontend Setup

```bash
cd /vercel/share/v0-project

# Install dependencies (auto-installed by v0)
npm install

# Or use preferred package manager
pnpm install    # if using pnpm
yarn install    # if using yarn
bun install     # if using bun

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

### 2. Backend Setup (Optional - for full ML features)

```bash
cd /vercel/share/v0-project/api

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000

# API documentation available at:
# http://localhost:8000/docs
```

### 3. Generate Sample Data

Click "Start Live" on the Real-Time Sensor Dashboard to generate simulated sensor data.

### 4. Browse Datasets

Scroll to "Public Plant Health Datasets" to explore available datasets.

---

## Real Data Integration: Choose One

### Option A: Use IoT Sensors (Recommended for Production)

**Setup Time:** 1-2 hours

#### Hardware Required
- Microcontroller: Arduino, ESP32, or Raspberry Pi
- Sensors:
  - DHT22 (temperature/humidity)
  - Capacitive soil moisture sensor
  - BH1750 light sensor (optional)
  - MEMS microphone (optional, for acoustics)

#### Implementation

1. **Flash IoT Device Code**

   Use the example Arduino code provided in REAL_DATA_INTEGRATION.md

2. **Connect to WiFi**

   Update your SSID and password in the code

3. **Configure Backend URL**

   Point to your backend server:
   ```cpp
   const char* serverURL = "http://YOUR_IP:3000/api/sensors/ingest";
   ```

4. **Test Connection**

   ```bash
   curl -X POST http://localhost:3000/api/sensors/ingest \
     -H "Content-Type: application/json" \
     -d '{
       "plantId": 1,
       "temperature": 22.5,
       "humidity": 65,
       "soilMoisture": 60
     }'
   ```

5. **View in Dashboard**

   - Open Real-Time Sensor Dashboard
   - Click "Start Live"
   - View real-time updates

### Option B: Use Public Datasets (Recommended for Development)

**Setup Time:** 30 minutes - 2 hours depending on dataset size

#### Step 1: Download Dataset

```bash
# ESC-50 (Audio) - ~600MB
git clone https://github.com/karolpiczak/ESC-50.git
cd ESC-50

# OR

# Plant Village (Images) - ~4GB
# Download from: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
# Requires Kaggle account (free)
kaggle datasets download -d abdallahalidev/plantvillage-dataset
unzip plantvillage-dataset.zip
```

#### Step 2: Extract Features

```python
# For ESC-50 (audio features)
import librosa
import numpy as np
import json

features_data = []

for audio_file in os.listdir('audio'):
    y, sr = librosa.load(f'audio/{audio_file}')
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    features_data.append({
        'filename': audio_file,
        'features': np.mean(mfcc, axis=1).tolist(),
        'label': 'healthy'  # or 'stressed'/'critical'
    })

# Save features
with open('features.json', 'w') as f:
    json.dump(features_data, f)
```

#### Step 3: Upload to Backend

```bash
# The browser already shows dataset options
# Click "Download Dataset" from the Dataset Browser
# Follow the instructions provided
```

### Option C: Hybrid (IoT + Datasets)

Use real sensor data for production, datasets for model training:

1. Set up IoT sensors (Option A)
2. Download and process public datasets (Option B)
3. System automatically combines both sources
4. ML models train on datasets, validate with real sensors

---

## Production Deployment

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
```bash
# 1. Connect GitHub repository
git push origin main

# 2. In Vercel dashboard:
# - Import repository
# - Select root directory: /
# - Deploy

# 3. Environment variables (in Vercel dashboard):
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Backend on Railway:**
```bash
# 1. Create account at railway.app
# 2. Deploy from GitHub or Docker
# 3. Set environment variables:
#    - DATABASE_URL=postgresql://...
#    - API_KEY=your_secret_key

# 4. Get backend URL and update frontend
```

#### Option 2: Docker (Self-hosted)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Services available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# PostgreSQL: localhost:5432
```

#### Option 3: AWS (Production Scale)

```bash
# 1. Frontend on CloudFront + S3
npm run build
aws s3 sync .next s3://your-bucket/

# 2. Backend on EC2 + RDS
# - Launch EC2 instance (t3.medium recommended)
# - Create RDS PostgreSQL instance
# - Deploy FastAPI with Gunicorn + Nginx

# 3. Database migrations
alembic upgrade head
```

### Environment Variables

Create `.env.local`:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
DATABASE_URL=postgresql://user:password@localhost/ecogardendb
API_KEY=your_secure_api_key_here
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# ML Models
MODEL_CACHE_DIR=/path/to/models
TFJS_MODEL_URL=https://your-cdn.com/models/

# Optional
KAFKA_BROKERS=kafka:9092  # If using Kafka for streaming
REDIS_URL=redis://localhost:6379  # If using Redis caching
```

---

## Testing & Validation

### Test 1: Hydration Mismatch Fixed

```bash
# Should load without hydration errors
npm run dev

# Visit: http://localhost:3000
# Check browser console - no hydration errors
```

### Test 2: Real-Time Sensor Dashboard

```bash
# 1. Open dashboard
# 2. Click "Start Live"
# 3. Should see sensor readings update every 5 seconds
# 4. Try "Generate Reading" button to add data

# 5. Verify API endpoint
curl http://localhost:3000/api/sensors/ingest?plantId=1&limit=10
```

### Test 3: IoT Data Ingestion

```bash
# 1. Send test data to API
curl -X POST http://localhost:3000/api/sensors/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": 1,
    "temperature": 23.5,
    "humidity": 62,
    "soilMoisture": 55,
    "lightIntensity": 450
  }'

# 2. Retrieve readings
curl http://localhost:3000/api/sensors/ingest?plantId=1

# 3. Verify in dashboard
```

### Test 4: Dataset Browser

```bash
# 1. Scroll to "Public Plant Health Datasets"
# 2. Select category: "Acoustic Data"
# 3. Click a dataset to view details
# 4. See sample data and download links
```

### Test 5: ML Predictions

```bash
# 1. Start backend API (optional)
# 2. Open http://localhost:3000
# 3. Scroll to "ML Predictions Display"
# 4. Should show model status and predictions
# 5. TensorFlow.js models should load automatically
```

---

## Troubleshooting

### Hydration Errors
**Problem:** "Hydration failed because the server rendered text didn't match the client"

**Solution:** Already fixed in PlantCareDashboard using deterministic calculations based on plant IDs instead of random values.

### Sensor Data Not Showing
**Problem:** Real-Time Sensor Dashboard is empty

**Solution:**
1. Click "Generate Reading" to create test data
2. Click "Start Live" to enable real-time updates
3. Check browser console for errors
4. Verify plantId is between 1-10

### Dataset Browser Not Loading
**Problem:** "Datasets fail to load"

**Solution:**
1. Check internet connection
2. Verify CORS headers if fetching from external API
3. Check browser DevTools Network tab
4. Try refreshing page

### API Endpoint 404
**Problem:** POST /api/sensors/ingest returns 404

**Solution:**
1. Verify path is exactly `/api/sensors/ingest`
2. Check request method is POST
3. Verify Content-Type header is application/json
4. Restart dev server: `npm run dev`

### ML Models Fail to Load
**Problem:** "TensorFlow.js model failed to load"

**Solution:**
1. Check browser console for specific error
2. Verify model files are in `/public/models/`
3. Clear browser cache
4. Try different browser

### Backend Connection Fails
**Problem:** "Failed to connect to FastAPI backend"

**Solution:**
1. Verify backend is running: `python -m uvicorn main:app --port 8000`
2. Check CORS settings in FastAPI
3. Verify NEXT_PUBLIC_API_URL environment variable
4. Test API directly: `curl http://localhost:8000/docs`

---

## Performance Optimization

### Frontend
```javascript
// Enable Next.js caching
// next.config.mjs
export default {
  cacheComponents: true,  // Cache Component results
  compress: true,  // Gzip compression
  poweredByHeader: false,  // Remove X-Powered-By
};
```

### Backend
```python
# FastAPI caching
from functools import lru_cache

@app.get("/api/predictions")
@lru_cache(maxsize=128)
async def get_predictions(plant_id: int):
    return predict_health(plant_id)
```

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_plant_readings ON sensor_readings(plant_id, timestamp);
CREATE INDEX idx_plant_health ON plants(health_score);
```

---

## Next Steps

### Week 1: Setup & Testing
- Choose data source (IoT, Datasets, or Hybrid)
- Perform basic testing with simulated data
- Verify all components load without errors

### Week 2: Real Data Collection
- Deploy IoT sensors or download datasets
- Start collecting real plant data
- Monitor data quality and completeness

### Week 3: Model Training
- Retrain ML models with real data
- Validate predictions against ground truth
- Deploy improved models

### Week 4: Production Deployment
- Deploy to cloud (Vercel + Railway or AWS)
- Set up monitoring and logging
- Configure continuous data pipeline

### Ongoing: Maintenance
- Monitor model performance
- Retrain models monthly with new data
- Update dependencies and security patches
- Analyze predictions and adjust thresholds

---

## Support & Documentation

- **Real Data Integration:** See REAL_DATA_INTEGRATION.md
- **ML Architecture:** See ML_IMPLEMENTATION.md
- **API Documentation:** http://localhost:8000/docs (after starting backend)
- **TensorFlow.js:** https://www.tensorflow.org/js
- **FastAPI:** https://fastapi.tiangolo.com/
- **Next.js:** https://nextjs.org/docs

---

## Quick Command Reference

```bash
# Start frontend
npm run dev

# Start backend
cd api && python -m uvicorn main:app --reload

# Build for production
npm run build

# Docker compose
docker-compose up -d

# Send test data
curl -X POST http://localhost:3000/api/sensors/ingest \
  -H "Content-Type: application/json" \
  -d '{"plantId":1,"temperature":22,"humidity":65}'

# View sensor readings
curl http://localhost:3000/api/sensors/ingest?plantId=1&limit=50
```

You're all set! Start with Quick Start, then choose your data integration option. Happy monitoring!
