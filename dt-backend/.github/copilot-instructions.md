# SCAAP Backend Development Guide

## Overview
The SCAAP backend is a Node.js/Express API for secure campus attendance verification with image analysis, geolocation validation, real-time updates, and comprehensive audit logging.

## Key Features
- JWT-based authentication with role-based access control
- Signed S3 uploads for secure file handling
- Async job queue for attendance verification processing
- AI integration for image analysis and chat
- Real-time notifications via Socket.io
- Comprehensive audit logging with tamper-evident tokens
- Admin tools for flagged record review and data export
- Health monitoring and readiness checks

## Project Structure
```
dt-backend/
├── config/           # Configuration files (DB, Redis, S3)
├── models/           # MongoDB schemas
├── controllers/      # Business logic
├── routes/           # API endpoints
├── middleware/       # Auth, validation, error handling
├── utils/            # Utilities (JWT, crypto, AI client)
├── services/         # Queue management
├── workers/          # Verification worker
├── logs/             # Application logs
├── server.js         # Main entry point
├── package.json      # Dependencies
├── .env.example      # Environment template
├── README.md         # Full documentation
└── Dockerfile        # Container image
```

## Getting Started

### Local Development
1. Install: `npm install`
2. Setup: `cp .env.example .env` and configure
3. Start MongoDB and Redis locally
4. Run: `npm run dev` (API) and `npm run worker` (worker in another terminal)
5. API available at `http://localhost:4000`

### Testing
- Run tests: `npm test`
- Watch mode: `npm run test:watch`
- Linting: `npm run lint`

## API Documentation
Full API endpoints are documented in [README.md](./README.md). Key categories:
- **Auth** — Registration, login, token refresh
- **Uploads** — Presigned URL generation
- **Attendance** — Record submission and retrieval
- **Events** — Event creation and management
- **AI** — Chat and image analysis
- **Admin** — Flagged records, overrides, audit logs, statistics
- **Health** — Service status and readiness

## Architecture

The system uses:
- **Express.js** for the REST API
- **MongoDB** for persistence (users, events, attendance records, audit logs)
- **Redis** for caching and job queue
- **Bull** for job queue management
- **JWT** for authentication
- **AWS S3** for blob storage
- **External AI Service** for image analysis and chat

## Verification Flow

1. Frontend submits attendance with photo URL, location, timestamp
2. Backend enqueues verification job
3. Worker processes job:
   - Downloads image from S3
   - Calls AI Vision API for analysis
   - Validates geofence (location radius check)
   - Validates timeline (within event window)
   - Computes confidence score
   - Generates verification token
4. Worker updates record with results
5. Real-time notification sent to frontend
6. Admin can review flagged or low-confidence records

## Key Concepts

### Verification Token
HMAC-based token containing record ID, photo hash, verification result, and timestamp. Enables tamper detection and legal auditability.

### Confidence Score
Computed from:
- Image quality (AI service)
- Face match score (AI service)
- Geofence validation (distance check)
- Timeline validation (event window)
- Tamper detection (AI service)

Range: 0–1. Decision threshold: >0.75 for auto-approval.

### Role-Based Access Control
- **student** — View own records, submit attendance
- **instructor** — Create events, view class attendance, flag suspicious records
- **admin** — Full system access, overrides, exports, user management

### Graceful Fallback
If AI service is unavailable, records are marked `pending_review` for manual adjudication by admins.

## Environment Variables
See [.env.example](.env.example) for complete list. Critical variables:
- `MONGO_URI` — MongoDB connection
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — JWT signing key
- `S3_BUCKET`, `AWS_*` — S3 credentials
- `AI_API_BASE_URL`, `AI_API_KEY` — AI service endpoint

## Deployment

### Docker
```bash
docker build -t scaap-backend .
docker run -p 4000:4000 --env-file .env scaap-backend
```

### Kubernetes
Apply manifests in `k8s/` folder for scalable, resilient deployment.

### Cloud Platforms
Deploy to Render, Railway, AWS ECS, GCP Cloud Run, or Azure Container Instances using environment variables and auto-scaling.

## Monitoring & Observability

- **Logs** — Structured logs in `logs/` folder (error.log, combined.log)
- **Health** — `GET /api/health/status` and `GET /api/health/ready`
- **Metrics** — Request counts, job queue depth, worker success rate
- **Tracing** — Request IDs in logs for end-to-end tracing

## Security
- All secrets in environment variables
- TLS/HTTPS in production
- Rate limiting on sensitive endpoints
- Input validation on all endpoints
- Role-based authorization
- Audit logging for all actions
- Presigned S3 URLs (no proxying)
- Tamper-evident verification tokens

## Troubleshooting

**Worker not processing jobs**
- Check Redis: `redis-cli ping`
- Check logs: `tail -f logs/combined.log`
- Restart worker: `npm run worker`

**AI service errors**
- Verify `AI_API_BASE_URL` and `AI_API_KEY`
- Check AI service health
- Records marked pending_review if AI unavailable

**Database errors**
- Verify `MONGO_URI`
- Check MongoDB is running
- Check network connectivity

## Contributing
1. Create feature branch from `main`
2. Make changes and add tests
3. Run linting: `npm run lint`
4. Submit PR with description

## Contact
For questions or issues, reach out to the SCAAP team.
