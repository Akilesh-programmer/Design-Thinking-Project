# SCAAP Backend — Secure Campus Attendance Verification Platform

A production-ready Node.js backend for reliable, auditable, multimodal attendance verification with image analysis, geolocation validation, real-time updates, and comprehensive audit logging.

## Overview

This backend implements:
- **Authentication & Authorization** — JWT-based auth with role-based access control (student, instructor, admin)
- **Signed Uploads** — Time-limited presigned S3 URLs for secure file uploads
- **Attendance Management** — Submit, verify, and track attendance records
- **Job Queue & Workers** — Asynchronous verification processing with Bull/Redis
- **AI Integration** — Image analysis, liveness detection, OCR, and confidence scoring
- **Real-time Notifications** — Socket.io for pushing verification results
- **Audit Logging** — Comprehensive action tracking with tamper-evident tokens
- **Admin Tools** — Flagged record review, statistics, data export, overrides
- **Health Monitoring** — Service health checks and readiness probes

## Architecture

```
Frontend (React + Vite)
    ↓
API Gateway (Node.js/Express)
    ├─ Auth → User Management
    ├─ Uploads → S3 Presigned URLs
    ├─ Attendance → Record Creation
    ├─ Admin → Flags, Overrides, Logs
    ├─ AI → Chat & Image Analysis
    └─ Health → Monitoring
    ↓
Job Queue (Bull/Redis)
    ↓
Worker Pool (Verification)
    ├─ Download blob from S3
    ├─ Compute file hash
    ├─ Call AI Vision API
    ├─ Validate geo-fence
    ├─ Validate timeline
    ├─ Compute confidence
    └─ Persist results + audit log
    ↓
Persistence (MongoDB)
    ├─ Users
    ├─ Events
    ├─ AttendanceRecords
    ├─ AuditLogs
    └─ Assignments/Submissions
    ↓
Cache (Redis)
    ├─ Job Queue
    └─ Session Cache
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Redis (local or cloud)
- AWS S3 or S3-compatible storage (MinIO)
- AI service endpoint (Grok-style chat, Gemini-style vision)

### Installation

1. **Clone and install:**
   ```bash
   cd dt-backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start services (if local):**
   ```bash
   # Terminal 1: MongoDB
   mongod
   
   # Terminal 2: Redis
   redis-server
   ```

4. **Run the backend:**
   ```bash
   npm run dev  # Development with auto-reload
   npm start    # Production
   ```

5. **Start the worker in another terminal:**
   ```bash
   npm run worker
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive tokens
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/logout` — Logout

### Uploads
- `POST /api/uploads/sign` — Get presigned upload URL
- `POST /api/uploads/confirm` — Confirm upload completion

### Attendance
- `POST /api/attendance` — Submit attendance with photo + geo + timestamp
- `GET /api/attendance` — List attendance records (filtered by role)
- `GET /api/attendance/:recordId` — Get single record with evidence
- `PUT /api/attendance/:recordId/flag` — Flag record for review (admin/instructor)

### Events
- `POST /api/events` — Create event (admin/instructor)
- `GET /api/events` — List events
- `GET /api/events/:eventId` — Get event details
- `PUT /api/events/:eventId` — Update event (admin/instructor)

### AI
- `POST /api/ai/chat` — Chat with conversational AI
- `POST /api/ai/image` — Async image analysis
- `POST /api/ai/callback` — Webhook for AI service results

### Admin
- `GET /api/admin/flagged` — List flagged records
- `PUT /api/admin/override/:recordId` — Admin override verification
- `GET /api/admin/audit-logs` — View audit trail
- `GET /api/admin/statistics` — Attendance analytics
- `GET /api/admin/export` — Export data (CSV/JSON)

### Health
- `GET /api/health/status` — Full service health check
- `GET /api/health/ready` — Readiness probe for K8s

## Data Models

### User
```javascript
{
  _id, name, email, passwordHash, role,
  institutionId, phoneNumber, profilePhoto, isActive,
  lastLogin, consents { locationTracking, photoCapture },
  createdAt, updatedAt
}
```

### AttendanceRecord
```javascript
{
  _id, userId, eventId, blobUrl, photoHash,
  geo { latitude, longitude, accuracy, timestamp },
  submittedAt, processedAt, verified, confidence,
  evidence {
    faceMatch, geoMatch, timelineMatch, imageQuality,
    exif, ocrText, tamperDetection
  },
  verificationToken, status, flagReason, flaggedBy,
  deviceMetadata, createdAt, updatedAt
}
```

### AuditLog
```javascript
{
  _id, actorId, action, targetType, targetId,
  metadata, changes { before, after },
  ipAddress, userAgent, createdAt
}
```

## Environment Variables

See [.env.example](.env.example) for a complete list. Key variables:

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `S3_BUCKET`, `AWS_*` | S3 credentials for uploads |
| `AI_API_BASE_URL`, `AI_API_KEY` | AI service endpoint |
| `CORS_ORIGIN` | Frontend URL for CORS |

## Deployment

### Docker

```bash
docker build -t scaap-backend .
docker run -p 4000:4000 --env-file .env scaap-backend
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Render / Railway

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy (auto-scales on demand)

## Testing

```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Monitoring

### Logging
- Structured logs (Winston) → `logs/` directory and console
- Log levels: debug, info, warn, error

### Metrics
- Request counts (middleware)
- Job queue depth (Bull)
- Worker success/failure rates
- AI service latency

### Health Checks
- `GET /api/health/status` — Detailed service health
- `GET /api/health/ready` — Readiness for orchestrators

## Security Best Practices

1. **Secrets Management**
   - Store all secrets in environment variables
   - Use `.env` for local dev (never commit)
   - Rotate JWT and verification secrets in production

2. **Input Validation**
   - Express-validator for all inputs
   - Rate limiting on sensitive endpoints

3. **Access Control**
   - JWT + role-based authorization
   - Presigned URLs for S3 (avoid proxying blobs)
   - Audit logs for all sensitive actions

4. **Data Protection**
   - TLS/HTTPS in all deployments
   - AES256 encryption for S3 at rest
   - Data minimization: delete raw images after retention period
   - Hash-based verification tokens (tamper-evident)

5. **Compliance**
   - FERPA-equivalent consent tracking
   - Data subject request handling (export/delete)
   - Privacy policy and data retention documentation

## Troubleshooting

### Worker not processing jobs
- Check Redis connection: `redis-cli ping`
- Verify Bull queue initialized: check logs
- Restart worker: `npm run worker`

### AI service timeouts
- Increase timeout in `utils/aiClient.js`
- Check AI service health: `GET /api/health/status`
- Enable fallback (mark records pending_review)

### Database connection refused
- Verify MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- Test connection: `mongosh $MONGO_URI`

### S3 upload failures
- Verify AWS credentials and S3 bucket exist
- Check bucket policy allows PutObject
- Confirm CORS settings on bucket

## Contributing

1. Fork and create feature branch (`git checkout -b feature/my-feature`)
2. Commit changes (`git commit -am 'Add feature'`)
3. Push to branch (`git push origin feature/my-feature`)
4. Create Pull Request with tests

## License

MIT

## Support

For issues, questions, or suggestions:
- GitHub Issues: [Create issue](https://github.com/scaap/backend/issues)
- Email: support@scaap.example
