# EcoSound Garden - Production Deployment Guide

## Overview
Complete guide for deploying the ML-powered EcoSound Garden application to production.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│          TensorFlow.js Models (In-Browser)                   │
│                                                               │
│  ├─ PlantHealthTFJS                                          │
│  └─ AcousticStressTFJS                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
┌────────────────────────┴────────────────────────────────────┐
│              FastAPI Backend Server                          │
│          (Docker Container / Cloud Instance)                 │
│                                                               │
│  ├─ /api/predict-health                                      │
│  ├─ /api/analyze-acoustic                                    │
│  ├─ /api/batch-predict                                       │
│  └─ /api/model-info                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────┴────────────────────────────────────┐
│               PostgreSQL Database                            │
│          (RDS / Managed Service)                             │
│                                                               │
│  ├─ Plant Sensor Data                                        │
│  ├─ Prediction History                                       │
│  ├─ User Preferences                                         │
│  └─ Training Logs                                            │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Local Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train models
python train_models.py

# Run server
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend
```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

Set environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Phase 2: Docker Containerization

### Build Images
```bash
# Backend
docker build -t ecosound-backend:latest ./backend

# Frontend
docker build -t ecosound-frontend:latest .

# Or use docker-compose
docker-compose build
```

### Run with Docker Compose
```bash
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Services available:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Backend API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Phase 3: Cloud Deployment (AWS)

### 1. Setup ECR (Elastic Container Registry)
```bash
# Create ECR repositories
aws ecr create-repository --repository-name ecosound-backend
aws ecr create-repository --repository-name ecosound-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag ecosound-backend:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/ecosound-backend:latest
docker tag ecosound-frontend:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/ecosound-frontend:latest

# Push images
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/ecosound-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/ecosound-frontend:latest
```

### 2. Setup RDS (PostgreSQL Database)
```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier ecosound-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password [STRONG_PASSWORD] \
  --allocated-storage 20
```

### 3. Deploy on ECS (Elastic Container Service)

Create task definition file: `task-definition.json`
```json
{
  "family": "ecosound-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "ecosound-backend",
      "image": "[ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/ecosound-backend:latest",
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://..."},
        {"name": "ML_MODEL_PATH", "value": "/models"}
      ]
    }
  ]
}
```

Register and deploy:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json

aws ecs create-service \
  --cluster ecosound-cluster \
  --service-name ecosound-backend \
  --task-definition ecosound-backend \
  --desired-count 1 \
  --launch-type FARGATE
```

### 4. Setup CloudFront CDN
```bash
# Create CloudFront distribution for frontend static assets
# Point to S3 bucket or ELB

aws cloudfront create-distribution \
  --origin-domain-name [your-alb-domain].elb.amazonaws.com \
  --default-root-object index.html
```

## Phase 4: Kubernetes Deployment (Advanced)

### Create Deployments

Backend Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecosound-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecosound-backend
  template:
    metadata:
      labels:
        app: ecosound-backend
    spec:
      containers:
      - name: backend
        image: ecosound-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ecosound-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

Frontend Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecosound-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ecosound-frontend
  template:
    metadata:
      labels:
        app: ecosound-frontend
    spec:
      containers:
      - name: frontend
        image: ecosound-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: https://api.ecosound.app
```

Deploy:
```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Expose services
kubectl expose deployment ecosound-backend --type=LoadBalancer --port=8000
kubectl expose deployment ecosound-frontend --type=LoadBalancer --port=3000
```

## Phase 5: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy EcoSound

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker images
        run: |
          docker build -t ecosound-backend:${{ github.sha }} ./backend
          docker push ecosound-backend:${{ github.sha }}
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws ecs update-service --cluster ecosound --service ecosound-backend --force-new-deployment
```

## Environment Variables (Production)

```env
# Backend
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/ecosound
ML_MODEL_PATH=/models
AUDIO_UPLOAD_PATH=/uploads
SECRET_KEY=your-secret-key
DEBUG=false

# Frontend
NEXT_PUBLIC_API_URL=https://api.ecosound.app
NEXT_PUBLIC_ENV=production

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=strong-password
```

## Monitoring & Logging

### CloudWatch Monitoring
```bash
# Backend logs
aws logs tail /ecs/ecosound-backend --follow

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name ecosound-api-errors \
  --metric-name Errors \
  --namespace AWS/ECS \
  --statistic Sum \
  --period 300
```

### Application Metrics
- API response time: < 200ms
- ML prediction latency: < 100ms (browser), < 500ms (API)
- Database query time: < 50ms
- Model accuracy: > 90%

## Security Checklist

- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Setup AWS WAF for DDoS protection
- [ ] Configure VPC with security groups
- [ ] Enable database encryption at rest
- [ ] Use Secrets Manager for sensitive data
- [ ] Enable audit logging for all services
- [ ] Regular security patches and updates
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API key authentication for sensitive endpoints

## Scaling

### Horizontal Scaling
```bash
# Auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ecosound-backend-asg \
  --launch-template LaunchTemplateName=ecosound-backend \
  --min-size 1 \
  --max-size 10 \
  --desired-capacity 3
```

### Performance Optimization
1. **Caching**: Redis for ML model predictions
2. **CDN**: CloudFront for static assets
3. **Database**: Read replicas for heavy queries
4. **API**: Load balancing with ALB/NLB
5. **Models**: Model quantization for faster inference

## Backup & Disaster Recovery

```bash
# Database backups
aws rds create-db-snapshot \
  --db-instance-identifier ecosound-db \
  --db-snapshot-identifier ecosound-backup-$(date +%Y%m%d)

# S3 backup
aws s3 sync /models s3://ecosound-backups/models/
```

## Cost Optimization

- Use Spot Instances for non-critical workloads
- Reserved Instances for steady-state workloads
- S3 Intelligent-Tiering for backups
- CloudFront caching to reduce origin requests
- Auto-scaling to match demand

## Support & Troubleshooting

Common issues and solutions documented in `TROUBLESHOOTING.md`

For production support, contact: support@ecosound.app
