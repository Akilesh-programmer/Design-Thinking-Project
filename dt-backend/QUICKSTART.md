# Quick Start Guide — SCAAP Backend

## 5-Minute Setup

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services (MongoDB, Redis, API, Worker)
docker-compose up

# 3. API ready at http://localhost:4000
# 4. Check health: curl http://localhost:4000/api/health/status
```

### Option 2: Local Development

```bash
# 1. Prerequisites
#    - Node.js 18+
#    - MongoDB running: mongod
#    - Redis running: redis-server

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Terminal 1: Start API
npm run dev

# 5. Terminal 2: Start Worker (in another terminal)
npm run worker

# 6. API ready at http://localhost:4000
```

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Your Profile (use token from login response)
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create an Event (admin/instructor role required)
```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Physics 101 Lecture",
    "description": "Weekly physics lecture",
    "startTime": "2026-05-07T10:00:00Z",
    "endTime": "2026-05-07T11:30:00Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radiusMeters": 100
    },
    "capacity": 50,
    "requiresPhotoProof": true
  }'
```

### 5. Get Presigned Upload URL
```bash
curl -X POST http://localhost:4000/api/uploads/sign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fileName": "attendance-photo.jpg",
    "contentType": "image/jpeg",
    "purpose": "attendance"
  }'
```

### 6. Check Health Status
```bash
curl http://localhost:4000/api/health/status
```

## Environment Variables Quick Reference

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/scaap` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing key | `your-super-secret-key` |
| `S3_BUCKET` | AWS S3 bucket | `scaap-bucket` |
| `AI_API_BASE_URL` | AI service | `http://localhost:5000` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |

## Key Endpoints

### Auth
- `POST /api/auth/register` — Create new user
- `POST /api/auth/login` — Login (returns tokens)
- `GET /api/auth/me` — Get current user
- `POST /api/auth/refresh` — Refresh access token

### Attendance
- `POST /api/attendance` — Submit attendance
- `GET /api/attendance` — List attendance records
- `GET /api/attendance/:recordId` — Get record details
- `PUT /api/attendance/:recordId/flag` — Flag for review

### Events
- `POST /api/events` — Create event
- `GET /api/events` — List events
- `GET /api/events/:eventId` — Get event

### Admin
- `GET /api/admin/flagged` — List flagged records
- `PUT /api/admin/override/:recordId` — Override verification
- `GET /api/admin/statistics` — View statistics
- `GET /api/admin/export` — Export data

### Health
- `GET /api/health/status` — Full health check
- `GET /api/health/ready` — Readiness check

## Logs

View application logs:
```bash
# Real-time logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Docker Compose logs
docker-compose logs -f api
docker-compose logs -f worker
```

## Common Issues

### "Connection refused" — MongoDB
- Start MongoDB: `mongod` (or `brew services start mongodb-community`)
- Check `MONGO_URI` in `.env`

### "Connection refused" — Redis
- Start Redis: `redis-server`
- Check `REDIS_URL` in `.env`

### "Invalid token" — JWT
- Token expired? Use refresh token: `POST /api/auth/refresh`
- Wrong token format? Use: `Authorization: Bearer YOUR_TOKEN`

### Worker not processing jobs
- Check Redis is running
- Check logs: `docker-compose logs worker`
- Restart worker: `npm run worker`

## Next Steps

1. **Configure S3**: Update AWS credentials in `.env`
2. **Integrate AI Service**: Set `AI_API_BASE_URL` and `AI_API_KEY`
3. **Connect Frontend**: Update `CORS_ORIGIN` with frontend URL
4. **Deploy**: Use Docker or deploy to cloud (Render, Railway, AWS)
5. **Run Tests**: `npm test`

## Resources

- Full documentation: [README.md](./README.md)
- Architecture guide: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- API examples in code comments
- Sample test file: `__tests__/auth.test.js`

## Support

- Check logs for errors: `logs/error.log`
- Run health check: `GET /api/health/status`
- Review requirements: See provided requirements document
