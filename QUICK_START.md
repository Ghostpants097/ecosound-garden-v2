# EcoSound Garden - Quick Start Guide

Get the complete ML-powered plant health monitoring system running in minutes!

## Prerequisites
- Docker & Docker Compose (recommended)
- OR Python 3.10+, Node.js 18+, PostgreSQL 15

## Quick Start (Docker - Recommended)

### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/ecosound-garden.git
cd ecosound-garden

# Copy environment file
cp .env.local.example .env.local
```

### 2. Start Everything with Docker Compose
```bash
docker-compose up -d
```

This starts:
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend API**: http://localhost:8000 (FastAPI)
- **Database**: localhost:5432 (PostgreSQL)
- **API Docs**: http://localhost:8000/docs (Swagger)

### 3. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Stop Services
```bash
docker-compose down
```

---

## Manual Setup (Without Docker)

### Backend Setup

#### 1. Create Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2. Install Backend Dependencies
```bash
cd api
pip install -r requirements.txt
```

#### 3. Start PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or use Docker just for DB
docker run --name ecosound-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ecosound -p 5432:5432 -d postgres:15
```

#### 4. Create Database
```bash
createdb -U postgres ecosound
```

#### 5. Train ML Models
```bash
python train_models.py
```

Output:
```
Training health prediction model...
Training complete!
Models exported to public/models/
```

#### 6. Start Backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend running at: http://localhost:8000

### Frontend Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Set Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3. Start Frontend
```bash
npm run dev
```

Frontend running at: http://localhost:3000

---

## Testing

### Test Backend API
```bash
# Health check
curl http://localhost:8000/api/health

# Get model status
curl http://localhost:8000/api/models/status

# Make prediction
curl -X POST http://localhost:8000/api/predict/health \
  -H "Content-Type: application/json" \
  -d '{
    "plants": [{
      "id": 1,
      "name": "Monstera",
      "healthScore": 85,
      "status": "healthy",
      "metrics": {
        "temperature": 23,
        "humidity": 65,
        "acousticPattern": "Normal"
      }
    }]
  }'
```

### View API Documentation
Open http://localhost:8000/docs in your browser for interactive Swagger documentation.

### Test Frontend
Visit http://localhost:3000 and you should see:
- Plant status cards with health scores
- ML health predictions dashboard
- Acoustic stress analysis
- Care recommendations
- Real-time updates

---

## Key Features

### 1. ML Health Predictions
- **Backend API** predictions for production-grade accuracy
- **TensorFlow.js** browser models as fallback
- **Automatic switching** if API unavailable

### 2. Acoustic Analysis
- Extracts MFCC, mel-spectrogram, spectral features
- Detects plant stress from ambient sounds
- Real-time classification

### 3. Environmental Monitoring
- Temperature and humidity tracking
- Trend analysis (improving/stable/declining)
- Smart care recommendations

### 4. Dashboard Components
- Analytics overview
- Watering checklist
- Health trends charts
- Plant status grid
- ML predictions display

---

## Common Issues & Solutions

### Issue: "API connection refused"
**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# If not running, start it
cd api && uvicorn main:app --reload
```

### Issue: "Models not loading"
**Solution:**
```bash
# Train models
cd api && python train_models.py

# Check models exist
ls public/models/
```

### Issue: "Database connection error"
**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -d ecosound

# If not, start PostgreSQL
brew services start postgresql@15

# Or use Docker
docker-compose up -d postgres
```

### Issue: "Port already in use"
**Solution:**
```bash
# Change port in environment or use different ports
# Frontend: NEXT_PUBLIC_PORT=3001 npm run dev
# Backend: uvicorn main:app --port 8001

# Or kill process using port
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

---

## Project Structure

```
ecosound-garden/
├── app/                    # Next.js frontend
│   ├── page.tsx           # Main dashboard
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── MLPredictionsDisplay.tsx
│   ├── PlantStatusGrid.tsx
│   └── ... (other components)
│
├── lib/
│   ├── apiClient.ts       # Backend communication
│   ├── tfModels.ts        # TensorFlow.js utilities
│   └── plantCareUtils.ts  # Plant care database
│
├── hooks/
│   └── useMLPredictions.ts # ML predictions hook
│
├── api/                    # FastAPI backend
│   ├── main.py            # FastAPI application
│   ├── models.py          # Database models
│   ├── audio_processor.py # Audio feature extraction
│   ├── train_models.py    # Model training
│   └── requirements.txt
│
├── public/
│   └── models/            # TensorFlow.js models
│
├── docker-compose.yml     # Docker services
├── Dockerfile            # Next.js Docker image
├── ML_IMPLEMENTATION.md   # Detailed ML guide
└── QUICK_START.md         # This file
```

---

## Next Steps

### 1. Collect Real Data
```bash
# Record plant audio
# Label plant health states
# Use AudioProcessor to extract features

from api.audio_processor import AcousticDataset
dataset = AcousticDataset()
dataset.add_recording('plant.wav', plant_id=1, plant_status='healthy', label=0)
```

### 2. Retrain Models
```bash
# Update train_models.py to use real data
python api/train_models.py
```

### 3. Deploy to Production
```bash
# Deploy backend
docker build -t ecosound-api ./api
# Push to your registry and deploy

# Deploy frontend to Vercel
vercel deploy --prod
```

### 4. Monitor & Improve
- Check model performance in `/api/logs/`
- Collect user feedback for active learning
- Continuously improve predictions

---

## Useful Commands

```bash
# Docker commands
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose exec backend bash  # SSH into container

# Database commands
psql -U postgres -d ecosound     # Connect to DB
\dt                              # List tables
SELECT * FROM health_predictions; # Query predictions

# Backend commands
cd api
uvicorn main:app --reload        # Start with hot reload
python train_models.py           # Train models
pytest tests/                    # Run tests

# Frontend commands
npm run dev                       # Development server
npm run build                     # Build for production
npm run lint                      # Check code quality
```

---

## Support & Documentation

- **ML Implementation Guide**: See `ML_IMPLEMENTATION.md`
- **API Documentation**: http://localhost:8000/docs
- **TensorFlow.js Docs**: https://js.tensorflow.org/
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

## License
MIT

---

## Contributing
Pull requests welcome! Please see CONTRIBUTING.md for guidelines.

Happy monitoring! 🌱🎵
