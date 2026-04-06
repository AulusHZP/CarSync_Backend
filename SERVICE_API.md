# 🚗 CarSync Backend - Complete API Documentation

Production-ready backend for the CarSync mobile app with service scheduling and expense tracking.

## 📋 Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Database Schema](#database-schema)
3. [API Endpoints - Services](#api-endpoints---services)
4. [API Endpoints - Expenses](#api-endpoints---expenses)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Status Codes](#status-codes)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Development Setup

```bash
# Clone and install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

### Docker Setup

```bash
# Start all services (API + PostgreSQL)
docker-compose up --build

# Run migrations in Docker
docker-compose exec backend npm run prisma:migrate

# Seed database
docker-compose exec backend npm run prisma:seed
```

### Environment Variables

Create `.env` file (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://carsync_user:carsync_password@postgres:5432/carsync_db
```

---

## 🗄️ Database Schema

### Service Model

```prisma
enum ServiceStatus {
  COMPLETED  // Concluído
  SCHEDULED  // Agendado
  UPCOMING   // Em breve
}

model Service {
  id          String        @id @default(uuid())
  serviceType String        // e.g., "Troca de óleo"
  date        DateTime      // Scheduled date
  notes       String?       // Optional notes
  status      ServiceStatus @default(SCHEDULED)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### Expense Model

```prisma
enum ExpenseCategory {
  FUEL
  MAINTENANCE
  INSURANCE
  CAR_WASH
  PARKING
  TOLL
  OTHER
}

model Expense {
  id        String   @id @default(uuid())
  category  ExpenseCategory
  amount    Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔧 API Endpoints - Services

### Create Service
**POST** `/api/services`

Create a new service schedule.

**Request:**
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Troca de óleo",
    "date": "2026-04-06T00:00:00.000Z",
    "notes": "Óleo sintético 5W-30"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "Troca de óleo",
    "date": "2026-04-06T00:00:00.000Z",
    "notes": "Óleo sintético 5W-30",
    "status": "SCHEDULED",
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T10:30:00.000Z"
  },
  "message": "Service created successfully"
}
```

---

### List Services
**GET** `/api/services?page=1&limit=10&status=SCHEDULED`

Get all services with pagination and optional filtering.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10 (max 100)
- `status` (optional): Filter by status (COMPLETED, SCHEDULED, UPCOMING)

**Request:**
```bash
curl http://localhost:3000/api/services?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "serviceType": "Troca de óleo",
      "date": "2026-03-12T00:00:00.000Z",
      "notes": "Óleo sintético 5W-30",
      "status": "COMPLETED",
      "createdAt": "2026-03-01T10:30:00.000Z",
      "updatedAt": "2026-03-12T15:45:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "serviceType": "Rodízio de pneus",
      "date": "2026-04-06T00:00:00.000Z",
      "notes": "Verificar pressão e desgaste",
      "status": "UPCOMING",
      "createdAt": "2026-04-02T10:30:00.000Z",
      "updatedAt": "2026-04-02T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "message": "Services retrieved successfully"
}
```

---

### Get Service by ID
**GET** `/api/services/:id`

Retrieve a specific service by ID.

**Request:**
```bash
curl http://localhost:3000/api/services/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "Troca de óleo",
    "date": "2026-03-12T00:00:00.000Z",
    "notes": "Óleo sintético 5W-30",
    "status": "COMPLETED",
    "createdAt": "2026-03-01T10:30:00.000Z",
    "updatedAt": "2026-03-12T15:45:00.000Z"
  },
  "message": "Service retrieved successfully"
}
```

---

### Update Service Details
**PUT** `/api/services/:id`

Update service information (type, date, notes).

**Request:**
```bash
curl -X PUT http://localhost:3000/api/services/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Troca de óleo completa",
    "date": "2026-04-10T00:00:00.000Z",
    "notes": "Óleo sintético 5W-40 + filtro novo"
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "Troca de óleo completa",
    "date": "2026-04-10T00:00:00.000Z",
    "notes": "Óleo sintético 5W-40 + filtro novo",
    "status": "SCHEDULED",
    "createdAt": "2026-03-01T10:30:00.000Z",
    "updatedAt": "2026-04-02T11:00:00.000Z"
  },
  "message": "Service updated successfully"
}
```

---

### Update Service Status
**PATCH** `/api/services/:id/status`

Change service status (COMPLETED, SCHEDULED, UPCOMING).

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/services/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "Troca de óleo",
    "date": "2026-03-12T00:00:00.000Z",
    "notes": "Óleo sintético 5W-30",
    "status": "COMPLETED",
    "createdAt": "2026-03-01T10:30:00.000Z",
    "updatedAt": "2026-04-02T14:20:00.000Z"
  },
  "message": "Service status updated successfully"
}
```

---

### Delete Service
**DELETE** `/api/services/:id`

Delete a service permanently.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/services/550e8400-e29b-41d4-a716-446655440000
```

**Response (204 No Content):**
```
(Empty response with 204 status)
```

---

### Get Upcoming Services
**GET** `/api/services/upcoming/list?days=7`

Get services scheduled for the upcoming days.

**Query Parameters:**
- `days` (optional): Number of days to look ahead, default 7

**Request:**
```bash
curl http://localhost:3000/api/services/upcoming/list?days=30
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "serviceType": "Rodízio de pneus",
      "date": "2026-04-06T00:00:00.000Z",
      "notes": "Verificar pressão e desgaste",
      "status": "UPCOMING",
      "createdAt": "2026-04-02T10:30:00.000Z",
      "updatedAt": "2026-04-02T10:30:00.000Z"
    }
  ],
  "message": "Upcoming services retrieved successfully"
}
```

---

### Get Service Statistics
**GET** `/api/services/statistics/summary`

Get service statistics and counts by status.

**Request:**
```bash
curl http://localhost:3000/api/services/statistics/summary
```

**Response (200 OK):**
```json
{
  "data": {
    "total": 5,
    "completed": 1,
    "scheduled": 3,
    "upcoming": 1
  },
  "message": "Service statistics retrieved successfully"
}
```

---

## 📊 API Endpoints - Expenses

### Create Expense
**POST** `/api/expenses`

**Request:**
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "FUEL",
    "amount": 85.50
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "category": "FUEL",
    "categoryLabel": "Combustível",
    "amount": 85.50,
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T10:30:00.000Z"
  },
  "message": "Expense created successfully"
}
```

---

### List Expenses
**GET** `/api/expenses?page=1&limit=10`

**Request:**
```bash
curl http://localhost:3000/api/expenses?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "category": "FUEL",
      "categoryLabel": "Combustível",
      "amount": 85.50,
      "createdAt": "2026-04-02T10:30:00.000Z",
      "updatedAt": "2026-04-02T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "message": "Expenses retrieved successfully"
}
```

---

### Get Expense by ID
**GET** `/api/expenses/:id`

---

### Update Expense
**PUT** `/api/expenses/:id`

---

### Delete Expense
**DELETE** `/api/expenses/:id`

---

## 📐 Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message"
}
```

### Paginated Response
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {
    "field": "Error details"
  }
}
```

---

## ⚠️ Error Handling

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": {
    "serviceType": "Service type is required",
    "date": "Invalid date format. Use ISO 8601 format"
  }
}
```

### Not Found (404)
```json
{
  "error": "Service not found"
}
```

### Server Error (500)
```json
{
  "error": "An unexpected error occurred"
}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Unexpected error |

---

## 🔍 Request/Response Notes

### Date Format
All dates must be in ISO 8601 format:
```
2026-04-06T00:00:00.000Z
```

### Valid Status Values
- `COMPLETED` → Concluído
- `SCHEDULED` → Agendado
- `UPCOMING` → Em breve

### Pagination
- Max limit: 100
- Default limit: 10
- Min page: 1

---

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:3000/health

# Create a service
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Inspeção geral",
    "date": "2026-04-10T10:00:00.000Z",
    "notes": "Verificação completa do veículo"
  }'

# Get all services
curl http://localhost:3000/api/services

# Get statistics
curl http://localhost:3000/api/services/statistics/summary
```
