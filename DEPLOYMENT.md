# EcoSound Garden - Deployment Guide

Complete guide to deploy EcoSound Garden with ML backend to production.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                      │
│  Next.js + TensorFlow.js + React                        │
│  https://ecosound.vercel.app                            │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls (HTTPS)
                     ↓
┌─────────────────────────────────────────────────────────┐
│          Cloud Platform (Backend)                        │
│  FastAPI + TensorFlow + PostgreSQL + Redis              │
│  - Railway/Heroku/AWS/GCP/Azure                         │
│  https://api.ecosound.com                               │
└─────────────────────────────────────────────────────────┘
```

## Part 1: Backend Deployment

### Option A: Deploy to Railway (Recommended for FastAPI)

#### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

#### 2. Connect GitHub Repository
```bash
# In Railway dashboard:
# 1. Click "New Project"
# 2. Select "GitHub Repo"
# 3. Authorize and select your repo
```

#### 3. Create Railway Plugin Services

**Database (PostgreSQL):**
```bash
# In Railway:
# 1. Add Plugin → PostgreSQL 15
# 2. Railway creates DATABASE_URL automatically
```

**Backend Application:**
```bash
# Create railway.json in project root:
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "dockerfile",
    "dockerfile": "api/Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port 8000"
  }
}
```

#### 4. Set Environment Variables
```bash
# In Railway Dashboard → Project Settings → Variables:

DATABASE_URL=postgresql://...  # Auto-generated
ML_MODEL_PATH=/models
AUDIO_UPLOAD_PATH=/uploads
ENVIRONMENT=production
CORS_ORIGINS=https://ecosound.vercel.app
```

#### 5. Deploy
```bash
# Push to main branch
git push origin main

# Railway auto-deploys
# Your API is now live at: https://your-project.railway.app
```

### Option B: Deploy to Heroku

#### 1. Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Or use Heroku website
heroku login
```

#### 2. Create Heroku App
```bash
heroku create ecosound-api
heroku addons:create heroku-postgresql:standard-0 -a ecosound-api
```

#### 3. Deploy
```bash
# Set buildpack
heroku buildpacks:set heroku/python

# Set config
heroku config:set ML_MODEL_PATH=/models -a ecosound-api
heroku config:set ENVIRONMENT=production -a ecosound-api

# Deploy
git push heroku main

# View logs
heroku logs --tail -a ecosound-api
```

### Option C: Deploy to AWS EC2 + RDS

#### 1. Create EC2 Instance
```bash
# AWS Console:
# 1. EC2 → Instances → Launch Instance
# 2. Select Ubuntu 22.04 LTS
# 3. Instance type: t3.medium (2 vCPU, 4GB RAM)
# 4. Security Group: Allow ports 8000 (API), 5432 (DB)
```

#### 2. Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install -y python3.11 python3-pip postgresql-client docker.io

# Clone repository
git clone https://github.com/your-repo/ecosound-garden.git
cd ecosound-garden

# Build Docker image
docker build -t ecosound-api ./api
```

#### 3. Create RDS Database
```bash
# AWS Console:
# 1. RDS → Databases → Create
# 2. Engine: PostgreSQL 15.2
# 3. DB instance: db.t3.micro
# 4. Username: admin
# 5. Get endpoint: your-db.c9akciq32.us-east-1.rds.amazonaws.com
```

#### 4. Deploy Container
```bash
# Run with Docker
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://admin:password@your-db.rds.amazonaws.com/ecosound" \
  -e ENVIRONMENT=production \
  ecosound-api

# Or use Docker Compose with environment file
docker-compose -f docker-compose.prod.yml up -d
```

---

## Part 2: Frontend Deployment to Vercel

### 1. Connect GitHub to Vercel
```bash
# Option A: Via Vercel Dashboard
# 1. Go to https://vercel.com
# 2. "New Project"
# 3. Select GitHub repo
# 4. Authorize Vercel

# Option B: Via CLI
npm i -g vercel
vercel auth
```

### 2. Configure Environment Variables
```bash
# Vercel Dashboard → Project Settings → Environment Variables

NEXT_PUBLIC_API_URL=https://api.ecosound.railway.app
# or
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 3. Build Settings
```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
```

### 4. Deploy
```bash
# Deploy from CLI
vercel deploy --prod

# Or push to GitHub main branch
# Vercel auto-deploys

# Your frontend is now live at: https://ecosound.vercel.app
```

---

## Part 3: Custom Domain Setup

### 1. Purchase Domain
- GoDaddy, Namecheap, Route 53, or your registrar

### 2. Configure Frontend (Vercel)
```bash
# Vercel Dashboard → Project Settings → Domains
# Add: ecosound.app
# Vercel provides nameserver records
```

### 3. Configure Backend Domain (Optional)
```bash
# Create: api.ecosound.app
# Point to your API platform's CNAME
# e.g., api.ecosound.railway.app
```

### 4. Update DNS Records
In your domain registrar:
```
Type: NS (Nameserver)
Value: Vercel's nameservers

# For API (if using custom domain)
Type: CNAME
Name: api
Value: your-api-platform.app
```

---

## Part 4: SSL/TLS Certificates

All major platforms provide free SSL:
- **Vercel**: Automatic Let's Encrypt
- **Railway**: Automatic with domains
- **Heroku**: Automatic ACM
- **AWS**: Use AWS Certificate Manager or Let's Encrypt

---

## Part 5: Database Backups & Monitoring

### PostgreSQL Backups
```bash
# Automated backups (set on platform)
# Manual backup
pg_dump -U admin -h your-db.rds.amazonaws.com ecosound > backup.sql

# Restore
psql -U admin -h your-db.rds.amazonaws.com ecosound < backup.sql
```

### Monitoring
```bash
# Application Performance
# - Railway: Dashboard logs
# - Heroku: heroku logs --tail
# - AWS: CloudWatch

# Database Monitoring
# - Railway: Connection stats
# - AWS RDS: CloudWatch metrics
# - Heroku: Database insights
```

---

## Part 6: CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r api/requirements.txt
      - run: pytest api/tests/
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway deploy
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Secrets to Add
```
RAILWAY_TOKEN: From Railway dashboard
VERCEL_TOKEN: From Vercel account settings
VERCEL_ORG_ID: From Vercel dashboard
VERCEL_PROJECT_ID: From Vercel project settings
```

---

## Part 7: Post-Deployment Checklist

- [ ] API health check: `curl https://api.your-domain.com/api/health`
- [ ] Frontend loads: `https://your-domain.com`
- [ ] Models load: Check browser console for TensorFlow.js
- [ ] API calls work: Check Network tab in DevTools
- [ ] Database connected: Check Backend logs
- [ ] SSL certificate valid: HTTPS with green lock
- [ ] Environment variables set: `echo $DATABASE_URL` in backend
- [ ] Backups enabled: Verify automated backups
- [ ] Monitoring active: Check logs in platform dashboard
- [ ] Performance: Run Lighthouse audit

---

## Part 8: Troubleshooting Deployment

### Frontend Not Connecting to API
```bash
# Check environment variable
# Vercel Dashboard → Settings → Environment Variables
# Ensure NEXT_PUBLIC_API_URL is correct

# Check CORS
# Backend should allow: https://your-domain.vercel.app

# Check browser console
# Look for fetch errors and CORS issues
```

### Database Connection Errors
```bash
# Verify connection string format
postgresql://username:password@host:5432/database

# Test connection
psql -U admin -h your-host -d ecosound

# Check security groups/firewall
# Ensure port 5432 is open
```

### Model Loading Fails
```bash
# Ensure models exist in public/models/
# Train models: python api/train_models.py

# Check file permissions
chmod -R 755 public/models/

# Verify TFJS model.json
# Should be valid JSON with correct paths
```

### Slow Performance
```bash
# Check database queries
# Enable query logging in PostgreSQL

# Monitor API latency
# Platform dashboards show response times

# Optimize TensorFlow.js
# Use quantized models for smaller size
# Consider model pruning or distillation

# Use CDN
# Vercel automatically uses Vercel Edge Network
# Add Redis cache for API responses
```

---

## Part 9: Scaling Recommendations

### Horizontal Scaling
```
As traffic grows:

1. Multiple Backend Instances
   - Use load balancer (Railway/AWS ALB)
   - Deploy 2-3 API instances

2. Database Replication
   - Primary-replica PostgreSQL setup
   - Read replicas for analytics

3. Caching Layer
   - Add Redis for API caching
   - Cache model predictions

4. CDN
   - Vercel already includes Edge Network
   - Cache static assets globally
```

### Vertical Scaling
```
Upgrade instance sizes:
- Railway: Change plan tier
- AWS EC2: Change instance type
- Database: Increase RDS class
```

---

## Part 10: Security Best Practices

### Environment Variables
```bash
# Never commit secrets
# Use .env.local locally
# Use platform secrets in production
# Rotate credentials regularly
```

### Database Security
```bash
# Use strong passwords
# Enable SSL for connections
# Restrict IP access (if possible)
# Regular backups
# Monitor access logs
```

### API Security
```bash
# Enable CORS only for your domain
# Use HTTPS everywhere
# Rate limiting on endpoints
# Input validation
# SQL injection prevention (SQLAlchemy)
```

### Frontend Security
```bash
# Content Security Policy headers
# No hardcoded secrets in frontend code
# Use environment variables
# Regular dependency updates
```

---

## Part 11: Monitoring & Analytics

### Application Monitoring
```bash
# Platform built-in dashboards:
# - Railway: Metrics & Monitoring
# - Vercel: Analytics
# - AWS: CloudWatch

# Third-party services:
# - Sentry: Error tracking
# - DataDog: Infrastructure monitoring
# - New Relic: APM
```

### Database Monitoring
```bash
# Query performance
# Connection pool usage
# Backup status
# Disk space usage
```

### Model Performance
```bash
# Prediction accuracy
# Inference latency
# Feature drift detection
# Retraining schedule
```

---

## Appendix: Useful Commands

```bash
# View deployment logs
# Railway
railway logs -s backend

# Vercel
vercel logs

# Heroku
heroku logs --tail

# Restart services
docker-compose restart
heroku restart

# Database backup/restore
pg_dump ... > backup.sql
psql ... < backup.sql

# Check health
curl https://api.your-domain.com/api/health
curl https://your-domain.com

# Performance check
time curl https://api.your-domain.com/api/predict/health
```

---

## Support

- Railway Support: https://docs.railway.app
- Vercel Support: https://vercel.com/support
- FastAPI Docs: https://fastapi.tiangolo.com
- PostgreSQL Docs: https://www.postgresql.org/docs

---

Happy deploying! Your EcoSound Garden ML system is now in production.
