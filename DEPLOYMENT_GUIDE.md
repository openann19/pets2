# 🚀 PawfectMatch Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Web App Deployment](#web-app-deployment)
5. [Mobile App Deployment](#mobile-app-deployment)
6. [Database Migration](#database-migration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Deployment Verification](#post-deployment-verification)

---

## 🔍 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed and approved
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] TypeScript compilation successful
- [ ] Linting passed with no errors
- [ ] Bundle size within limits

### Documentation
- [ ] API documentation updated
- [ ] Changelog updated
- [ ] README files current
- [ ] Environment variables documented
- [ ] Migration scripts documented

### Infrastructure
- [ ] Database backups verified
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] CDN configured
- [ ] Load balancers ready
- [ ] Auto-scaling configured

### Security
- [ ] Security audit completed
- [ ] Secrets rotated
- [ ] API keys secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] DDoS protection active

---

## 🌍 Environment Setup

### Required Environment Variables

#### Backend (.env)
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
API_URL=https://api.pawfectmatch.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch_test
REDIS_URL=redis://username:password@redis-host:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@pawfectmatch.com
EMAIL_FROM_NAME=PawfectMatch

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# AI Services
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxx

# File Storage
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=pawfectmatch-production
AWS_REGION=us-east-1
CLOUDINARY_URL=cloudinary://xxxxxxxxxxxxxxxxxxxxx

# Monitoring
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxx
NEW_RELIC_LICENSE_KEY=xxxxxxxxxxxxxxxxxxxxx

# Feature Flags
ENABLE_VIDEO_CALLS=true
ENABLE_AI_FEATURES=true
ENABLE_PREMIUM_FEATURES=true
```

#### Web App (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.pawfectmatch.com
NEXT_PUBLIC_WS_URL=wss://api.pawfectmatch.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxx
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

#### Mobile App (.env.production)
```bash
EXPO_PUBLIC_API_URL=https://api.pawfectmatch.com
EXPO_PUBLIC_WS_URL=wss://api.pawfectmatch.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxx
```

---

## 🖥️ Backend Deployment

### Option 1: AWS EC2 / DigitalOcean

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/pawfectmatch.git
cd pawfectmatch/server

# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start dist/server.js --name pawfectmatch-api
pm2 save
pm2 startup
```

#### 3. Configure Nginx
```nginx
# /etc/nginx/sites-available/pawfectmatch
server {
    listen 80;
    server_name api.pawfectmatch.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pawfectmatch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d api.pawfectmatch.com
```

### Option 2: Docker Deployment

#### 1. Build Docker Image
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

```bash
# Build image
docker build -t pawfectmatch-api:latest .

# Run container
docker run -d \
  --name pawfectmatch-api \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env.production \
  pawfectmatch-api:latest
```

#### 2. Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    image: pawfectmatch-api:latest
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - pawfectmatch

  mongodb:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    networks:
      - pawfectmatch

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - pawfectmatch

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - pawfectmatch

volumes:
  mongodb_data:
  redis_data:

networks:
  pawfectmatch:
    driver: bridge
```

```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

### Option 3: Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pawfectmatch-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pawfectmatch-api
  template:
    metadata:
      labels:
        app: pawfectmatch-api
    spec:
      containers:
      - name: api
        image: pawfectmatch-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: pawfectmatch-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: pawfectmatch-api-service
spec:
  selector:
    app: pawfectmatch-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 🌐 Web App Deployment

### Vercel Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
cd apps/web
vercel --prod
```

#### 3. Configure Environment Variables
```bash
# Via Vercel CLI
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

# Or via Vercel Dashboard
# https://vercel.com/your-project/settings/environment-variables
```

### Alternative: AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Alternative: Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📱 Mobile App Deployment

### iOS Deployment

#### 1. Build with EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

#### 2. Submit to App Store
```bash
# Submit to App Store Connect
eas submit --platform ios --latest

# Or manual submission
# Download .ipa from EAS
# Upload via Transporter app or Xcode
```

#### 3. App Store Connect Configuration
- App Name: PawfectMatch
- Bundle ID: com.pawfectmatch.app
- Version: 1.0.0
- Build Number: Auto-increment
- Privacy Policy URL: https://pawfectmatch.com/privacy
- Support URL: https://pawfectmatch.com/support

### Android Deployment

#### 1. Build with EAS
```bash
# Build for Android
eas build --platform android --profile production
```

#### 2. Submit to Google Play
```bash
# Submit to Google Play Console
eas submit --platform android --latest

# Or manual submission
# Download .aab from EAS
# Upload via Google Play Console
```

#### 3. Google Play Console Configuration
- App Name: PawfectMatch
- Package Name: com.pawfectmatch.app
- Version Code: Auto-increment
- Version Name: 1.0.0
- Privacy Policy URL: https://pawfectmatch.com/privacy
- Support Email: support@pawfectmatch.com

### OTA Updates Configuration

```javascript
// app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

```bash
# Publish OTA update
eas update --branch production --message "Bug fixes and improvements"
```

---

## 🗄️ Database Migration

### Pre-Migration Checklist
- [ ] Full database backup completed
- [ ] Migration scripts tested on staging
- [ ] Rollback plan prepared
- [ ] Maintenance window scheduled
- [ ] Team notified

### MongoDB Migration

```bash
# Backup database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch" --out=/backup/$(date +%Y%m%d)

# Run migrations
cd server
npm run migrate:up

# Verify migration
npm run migrate:status

# Rollback if needed
npm run migrate:down
```

### Migration Script Example

```javascript
// migrations/001-add-analytics-fields.js
module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { analytics: { $exists: false } },
      {
        $set: {
          analytics: {
            totalSwipes: 0,
            totalLikes: 0,
            totalMatches: 0,
            events: []
          }
        }
      }
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { analytics: '' } }
    );
  }
};
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Sentry Setup
```javascript
// server/src/config/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});
```

#### New Relic Setup
```javascript
// server/newrelic.js
exports.config = {
  app_name: ['PawfectMatch API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  }
};
```

### Log Aggregation

#### CloudWatch Logs
```bash
# Install CloudWatch agent
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

#### ELK Stack
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 🔄 Rollback Procedures

### Backend Rollback

#### PM2 Rollback
```bash
# List deployments
pm2 list

# Rollback to previous version
pm2 reload pawfectmatch-api --update-env

# Or restore from backup
cd /var/www/pawfectmatch/releases
cp -r previous-release current
pm2 restart pawfectmatch-api
```

#### Docker Rollback
```bash
# List images
docker images

# Rollback to previous image
docker stop pawfectmatch-api
docker rm pawfectmatch-api
docker run -d \
  --name pawfectmatch-api \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env.production \
  pawfectmatch-api:previous-tag
```

#### Kubernetes Rollback
```bash
# View rollout history
kubectl rollout history deployment/pawfectmatch-api

# Rollback to previous version
kubectl rollout undo deployment/pawfectmatch-api

# Rollback to specific revision
kubectl rollout undo deployment/pawfectmatch-api --to-revision=2
```

### Database Rollback

```bash
# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch" --drop /backup/20251010

# Run down migration
npm run migrate:down
```

### Mobile App Rollback

```bash
# Rollback OTA update
eas update:rollback --branch production

# Or publish previous version
eas update --branch production --message "Rollback to stable version"
```

---

## ✅ Post-Deployment Verification

### Automated Health Checks

```bash
#!/bin/bash
# health-check.sh

API_URL="https://api.pawfectmatch.com"
WEB_URL="https://pawfectmatch.com"

# Check API health
echo "Checking API health..."
curl -f $API_URL/health || exit 1

# Check database connection
echo "Checking database..."
curl -f $API_URL/health/db || exit 1

# Check Redis connection
echo "Checking Redis..."
curl -f $API_URL/health/redis || exit 1

# Check web app
echo "Checking web app..."
curl -f $WEB_URL || exit 1

echo "✅ All health checks passed!"
```

### Manual Verification Checklist

#### Backend
- [ ] API responds to /health endpoint
- [ ] Database connection successful
- [ ] Redis connection successful
- [ ] WebSocket connections working
- [ ] File uploads working
- [ ] Email sending functional
- [ ] Payment processing working
- [ ] Analytics tracking active

#### Web App
- [ ] Homepage loads correctly
- [ ] User can login
- [ ] User can register
- [ ] Pet profiles display
- [ ] Matching works
- [ ] Chat functionality works
- [ ] Video calls connect
- [ ] Premium features accessible

#### Mobile App
- [ ] App launches successfully
- [ ] Login works
- [ ] Push notifications received
- [ ] Camera access works
- [ ] Location services work
- [ ] Payments process correctly
- [ ] OTA updates apply

### Performance Verification

```bash
# Load testing with Artillery
artillery quick --count 100 --num 10 https://api.pawfectmatch.com/health

# Response time check
curl -w "@curl-format.txt" -o /dev/null -s https://api.pawfectmatch.com/health
```

### Security Verification

```bash
# SSL certificate check
openssl s_client -connect api.pawfectmatch.com:443 -servername api.pawfectmatch.com

# Security headers check
curl -I https://api.pawfectmatch.com

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://api.pawfectmatch.com
```

---

## 📞 Emergency Contacts

### On-Call Rotation
- **Primary**: Lead Developer (+1-XXX-XXX-XXXX)
- **Secondary**: DevOps Engineer (+1-XXX-XXX-XXXX)
- **Escalation**: CTO (+1-XXX-XXX-XXXX)

### Service Providers
- **AWS Support**: 1-866-XXX-XXXX
- **MongoDB Atlas**: support@mongodb.com
- **Stripe Support**: support@stripe.com
- **Sentry Support**: support@sentry.io

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Code freeze announced
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Database backup completed
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Maintenance window scheduled

### During Deployment
- [ ] Enable maintenance mode
- [ ] Run database migrations
- [ ] Deploy backend
- [ ] Deploy web app
- [ ] Deploy mobile app updates
- [ ] Verify health checks
- [ ] Disable maintenance mode
- [ ] Monitor error rates

### Post-Deployment
- [ ] Verify all services running
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test critical user flows
- [ ] Verify analytics tracking
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Document any issues

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: 2025-10-10  
**Maintained By**: PawfectMatch DevOps Team  
**Next Review**: Quarterly
