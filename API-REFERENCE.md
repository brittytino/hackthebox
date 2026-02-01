# 🔌 API Reference - Operation DARKWEAVE

## Base URL
```
http://localhost:3001
```

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📖 Story Endpoints

### Get Story State
**Public endpoint - no auth required**

```http
GET /story/state
```

**Response:**
```json
{
  "storyStarted": true,
  "storyEnded": false,
  "round3Winner": null,
  "winnerTeamName": null,
  "winTimestamp": null,
  "finalOutcome": null
}
```

---

### Get Team Progress
**Requires: Authentication**

```http
GET /story/progress
```

**Response:**
```json
{
  "id": "uuid",
  "teamId": "uuid",
  "currentRound": 2,
  "round1Completed": true,
  "round2Completed": false,
  "round3Completed": false,
  "round1Artifacts": {
    "systemTarget": "UKKADAM_WATER_TREATMENT",
    "darkweaveCode": "DARKWEAVE_2026_COIMB",
    "credentialHash": "a1b2c3d4e5f6"
  },
  "round2Artifacts": null,
  "round3Winner": false,
  "storyEnding": null,
  "team": {
    "name": "Alpha Team"
  }
}
```

---

### Get Round Challenge Content
**Requires: Authentication**

```http
GET /story/round/:roundNumber
```

**Parameters:**
- `roundNumber`: 1, 2, or 3

**Response for Round 1:**
```json
{
  "title": "ROUND 1: THE LEAK",
  "description": "Decode intercepted communications to discover the breach",
  "story": "Coimbatore Police cybercrime division has...",
  "encryptedMessages": [
    {
      "id": 1,
      "content": "VNNBEBZ_XBGRV_TVRGZAGR",
      "hint": "Simple substitution cipher - think Caesar"
    }
  ],
  "requiredOutputs": ["systemTarget", "darkweaveCode", "credentialHash"]
}
```

**Error Response (Round Locked):**
```json
{
  "error": "Round locked",
  "message": "Complete previous rounds to unlock this round"
}
```

---

### Submit Round 1 Solution
**Requires: Authentication**

```http
POST /story/submit/round1
```

**Request Body:**
```json
{
  "systemTarget": "UKKADAM_WATER_TREATMENT",
  "darkweaveCode": "DARKWEAVE_2026_COIMB",
  "credentialHash": "a1b2c3d4e5f6"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Round 1 completed. You have unlocked access to the compromised VPN.",
  "nextRound": 2
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Decoding incomplete or incorrect. Review the intercepted messages."
}
```

---

### Submit Round 2 Solution
**Requires: Authentication, Round 1 Completed**

```http
POST /story/submit/round2
```

**Request Body:**
```json
{
  "masterKey": "SCCC_MASTER_KEY_7F8E9D0A",
  "backdoorLocation": "SCCC_VPN_NODE_47"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Round 2 completed. SCCC network access granted. The countdown has begun.",
  "nextRound": 3
}
```

---

### Submit Round 3 Flag
**Requires: Authentication, Rounds 1 & 2 Completed**

```http
POST /story/submit/round3
```

**Request Body:**
```json
{
  "flag": "HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}"
}
```

**Success Response (Winner):**
```json
{
  "success": true,
  "winner": true,
  "message": "🎉 MISSION COMPLETE! Alpha Team has successfully disabled the kill switch. Coimbatore is saved!",
  "finalOutcome": "CITY_SAVED"
}
```

**Response (Already Won):**
```json
{
  "success": false,
  "message": "The kill switch has already been disabled by Beta Squad. Coimbatore is safe.",
  "alreadyWon": true
}
```

---

## 🔐 Admin Story Endpoints

### Start Story
**Requires: ADMIN role**

```http
POST /story/admin/start
```

**Response:**
```json
{
  "message": "Story has begun. Operation DARKWEAVE is active."
}
```

---

### End Story
**Requires: ADMIN role**

```http
POST /story/admin/end
```

**Request Body:**
```json
{
  "outcome": "CITY_SAVED" // or "BREACH_EXECUTED"
}
```

**Response:**
```json
{
  "message": "Story ended: Coimbatore saved!",
  "outcome": "CITY_SAVED"
}
```

---

### Reset Story
**Requires: ADMIN role**

⚠️ **WARNING:** This deletes all story progress!

```http
POST /story/admin/reset
```

**Response:**
```json
{
  "message": "Story reset successfully"
}
```

---

### Get All Teams Progress
**Requires: ADMIN or JUDGE role**

```http
GET /story/admin/all-progress
```

**Response:**
```json
[
  {
    "id": "uuid",
    "teamId": "uuid",
    "currentRound": 3,
    "round1Completed": true,
    "round2Completed": true,
    "round3Completed": false,
    "round3Winner": false,
    "storyEnding": null,
    "team": {
      "name": "Alpha Team"
    },
    "updatedAt": "2026-02-01T10:30:00Z"
  }
]
```

---

## 🔒 Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "player1",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "role": "PARTICIPANT"
  }
}
```

---

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "role": "PARTICIPANT",
    "teamId": "uuid"
  }
}
```

---

### Get Profile
**Requires: Authentication**

```http
GET /auth/profile
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "player1",
  "role": "PARTICIPANT",
  "teamId": "uuid",
  "team": {
    "id": "uuid",
    "name": "Alpha Team"
  }
}
```

---

## 👥 Team Endpoints

### Create Team
**Requires: Authentication**

```http
POST /teams
```

**Request Body:**
```json
{
  "name": "Alpha Team"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Alpha Team",
  "members": [],
  "createdAt": "2026-02-01T10:00:00Z"
}
```

---

### Join Team
**Requires: Authentication**

```http
POST /teams/join
```

**Request Body:**
```json
{
  "teamId": "uuid"
}
```

**Response:**
```json
{
  "message": "Successfully joined team",
  "team": {
    "id": "uuid",
    "name": "Alpha Team"
  }
}
```

---

### Get All Teams
**Public endpoint**

```http
GET /teams
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Alpha Team",
    "members": [
      {
        "id": "uuid",
        "username": "player1"
      }
    ],
    "qualified": false,
    "disqualified": false
  }
]
```

---

## 🏆 Scoreboard Endpoint

### Get Scoreboard
**Public endpoint**

```http
GET /scoreboard
```

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Alpha Team",
      "totalPoints": 850,
      "lastSolved": "2026-02-01T11:45:00Z",
      "solvedChallenges": 5,
      "members": ["player1", "player2"],
      "qualified": true
    }
  ],
  "topSolvers": [
    {
      "username": "player1",
      "teamName": "Alpha Team",
      "solves": 3
    }
  ],
  "recentSubmissions": [
    {
      "teamName": "Alpha Team",
      "challengeTitle": "Round 1: THE LEAK",
      "points": 300,
      "timestamp": "2026-02-01T11:45:00Z"
    }
  ]
}
```

---

## 🔧 Admin Endpoints

### Get Stats
**Requires: ADMIN role**

```http
GET /admin/stats
```

**Response:**
```json
{
  "totalUsers": 15,
  "totalTeams": 5,
  "totalSubmissions": 47,
  "correctSubmissions": 23,
  "activeRounds": 1
}
```

---

### Create Round
**Requires: ADMIN role**

```http
POST /admin/rounds
```

**Request Body:**
```json
{
  "name": "Round 4: Bonus Round",
  "type": "DECODE_THE_SECRET",
  "order": 4,
  "description": "Special bonus challenges"
}
```

---

### Update Round Status
**Requires: ADMIN role**

```http
PATCH /admin/rounds/:roundId/status
```

**Request Body:**
```json
{
  "status": "ACTIVE" // PENDING | ACTIVE | COMPLETED | LOCKED
}
```

---

### Create Challenge
**Requires: ADMIN role**

```http
POST /admin/challenges
```

**Request Body:**
```json
{
  "roundId": "uuid",
  "title": "New Challenge",
  "description": "Solve this puzzle...",
  "points": 200,
  "flag": "HTB{solution}",
  "order": 1,
  "maxAttempts": 5,
  "hints": "Try looking at..."
}
```

---

## 📊 Health Check

### Check API Health
**Public endpoint**

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T12:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You must complete Round 1 first",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Round not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Invalid flag format"],
  "error": "Bad Request"
}
```

---

## 🔄 Rate Limiting

All endpoints are rate-limited to prevent abuse:
- **Default:** 10 requests per minute per IP
- **Submission endpoints:** 5 requests per minute per team

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706784000
```

---

## 🧪 Testing with cURL

### Test Story State
```bash
curl http://localhost:3001/story/state
```

### Test Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hackthebox.local","password":"admin123"}'
```

### Test Round 1 Submission
```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:3001/story/submit/round1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "systemTarget": "UKKADAM_WATER_TREATMENT",
    "darkweaveCode": "DARKWEAVE_2026_COIMB",
    "credentialHash": "a1b2c3d4e5f6"
  }'
```

### Test Admin Start Story
```bash
TOKEN="admin-jwt-token"

curl -X POST http://localhost:3001/story/admin/start \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Frontend API Client

The frontend uses a centralized API client at `apps/frontend/lib/api.ts`.

**Example usage:**
```typescript
import { api } from '@/lib/api';

// Get story progress
const progress = await api.story.getProgress();

// Submit Round 1
const result = await api.story.submitRound1({
  systemTarget: "UKKADAM_WATER_TREATMENT",
  darkweaveCode: "DARKWEAVE_2026_COIMB",
  credentialHash: "a1b2c3d4e5f6"
});
```

---

## 🔐 JWT Token Structure

**Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "username": "player1",
  "role": "PARTICIPANT",
  "teamId": "team-uuid",
  "iat": 1706784000,
  "exp": 1706870400
}
```

**Token expires in:** 24 hours

---

## 📝 Notes

1. **Story endpoints** (`/story/*`) are specific to Operation DARKWEAVE
2. **Traditional CTF endpoints** (`/challenges/*`, `/submissions/*`) still work for backward compatibility
3. **WebSocket support** planned for real-time Round 3 notifications
4. **All timestamps** are in ISO 8601 format (UTC)
5. **Flag comparison** is case-insensitive

---

**API Version:** 1.0.0  
**Last Updated:** February 2026  
**Documentation:** Full OpenAPI/Swagger docs available at `/api` endpoint
