# 🚗 CarSync Backend - Complete Backend Documentation

Production-ready backend for CarSync mobile app with Service Scheduling and Expense Tracking features.

---

## 📋 Quick Navigation

- **[Setup Guide](#-setup--installation)** - Get started locally or with Docker
- **[Architecture](#-architecture)** - Clean architecture overview
- **[Database Schema](#-database-schema)** - Prisma models and relationships
- **[API Endpoints](#-api-endpoints)** - Complete endpoint reference
- **[Error Handling](#-error-handling)** - Error codes and responses
- **[Flutter Integration](#-flutter-integration)** - Dart models and API calls

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 20+
- **Docker** & **Docker Compose** (optional but recommended)
- **PostgreSQL** 16+ (if not using Docker)
- **npm** or **yarn**

### Option 1: Local Development (Without Docker)

```bash
# 1. Clone repository
cd carsync_backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your local database credentials

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Create database and run migrations
npm run prisma:migrate

# 6. (Optional) Seed database with sample data
npm run prisma:seed

# 7. Start development server
npm run dev
```

Server will run on: `http://localhost:3000`

### Option 2: Docker Compose (Recommended)

```bash
# 1. Build and start all services
docker-compose up --build

# 2. Run migrations (in separate terminal)
docker-compose exec backend npm run prisma:migrate

# 3. Seed database (optional)
docker-compose exec backend npm run prisma:seed
```

Services:
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5433 (port 5433 to avoid conflicts)
- **Database Name**: carsync_db
- **Default User**: carsync_user
- **Default Password**: carsync_password

---

## 📁 Project Structure

```
carsync_backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client setup
│   │   └── env.ts        # Environment variables
│   ├── controllers/      # HTTP request handlers
│   │   ├── expenseController.ts
│   │   └── serviceController.ts
│   ├── services/         # Business logic layer
│   │   ├── expenseService.ts
│   │   └── serviceService.ts
│   ├── repositories/     # Data access layer (Prisma queries)
│   │   ├── expenseRepository.ts
│   │   └── serviceRepository.ts
│   ├── validators/       # Input validation with Zod
│   │   ├── expenseValidator.ts
│   │   └── serviceValidator.ts
│   ├── dtos/             # Data Transfer Objects
│   │   └── serviceDTO.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── utils/            # Utility functions
│   │   └── responses.ts  # API response helpers
│   ├── types/            # TypeScript types
│   │   ├── express.ts
│   │   └── entities.ts
│   ├── routes/           # Route definitions
│   │   ├── index.ts
│   │   ├── expenses.ts
│   │   └── services.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── dist/                 # Compiled JavaScript
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker image definition
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────┐
│   Controller (HTTP Layer)   │  ← Handles HTTP requests/responses
├─────────────────────────────┤
│    Service (Business Logic) │  ← Implements use cases
├─────────────────────────────┤
│  Repository (Data Access)   │  ← Prisma ORM queries
├─────────────────────────────┤
│     Database (PostgreSQL)   │  ← Persistent data storage
└─────────────────────────────┘
```

### Key Design Patterns

- **Dependency Injection**: Services are injected into controllers
- **Separation of Concerns**: Each layer has a single responsibility
- **DTO Pattern**: Data Transfer Objects for API payloads
- **Repository Pattern**: Abstraction layer for data access
- **Error Handling**: Centralized middleware for consistent error responses

---

## 🗄️ Database Schema

### Service Model

```prisma
model Service {
  id          String        @id @default(uuid())
  serviceType String        // e.g., "Troca de óleo"
  date        DateTime      // Scheduled date
  notes       String?       // Optional notes
  status      ServiceStatus @default(SCHEDULED)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([date])
  @@index([status])
  @@index([createdAt])
}

enum ServiceStatus {
  COMPLETED  // Concluído
  SCHEDULED  // Agendado
  UPCOMING   // Em breve
}
```

### Expense Model

```prisma
model Expense {
  id        String          @id @default(uuid())
  category  ExpenseCategory
  amount    Decimal         @db.Decimal(10, 2)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([createdAt])
  @@index([category])
}

enum ExpenseCategory {
  FUEL
  MAINTENANCE
  INSURANCE
  CAR_WASH
  PARKING
  TOLL
  OTHER
}
```

### Database Indexes

- Service: `date`, `status`, `createdAt`
- Expense: `createdAt`, `category`
- Improves query performance and filtering

---

## 🔧 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/services` | Create new service |
| **GET** | `/services` | List services (paginated) |
| **GET** | `/services/:id` | Get service by ID |
| **PUT** | `/services/:id` | Update service details |
| **PATCH** | `/services/:id/status` | Update service status |
| **DELETE** | `/services/:id` | Delete service |
| **GET** | `/services/upcoming/list` | Get upcoming services |
| **GET** | `/services/statistics/summary` | Get statistics |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/expenses` | Create new expense |
| **GET** | `/expenses` | List expenses (paginated) |
| **GET** | `/expenses/:id` | Get expense by ID |
| **PUT** | `/expenses/:id` | Update expense |
| **DELETE** | `/expenses/:id` | Delete expense |

---

## 📊 Request/Response Examples

### Create Service

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

**Response (201):**
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

### List Services with Pagination

**Request:**
```bash
curl "http://localhost:3000/api/services?page=1&limit=10"
```

**Response (200):**
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
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "message": "Services retrieved successfully"
}
```

### Update Service Status

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/services/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

**Response (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceType": "Troca de óleo",
    "status": "COMPLETED",
    ...
  },
  "message": "Service status updated successfully"
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": "Specific error details"
  }
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| **200** | OK - Request successful |
| **201** | Created - Resource created |
| **204** | No Content - Resource deleted |
| **400** | Bad Request - Validation error |
| **404** | Not Found - Resource not found |
| **500** | Server Error - Unexpected error |

### Common Error Scenarios

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "serviceType": "Service type is required",
    "date": "Invalid date format. Use ISO 8601 format"
  }
}
```

**Not Found (404):**
```json
{
  "error": "Service not found"
}
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
# Response: {"status": "ok", "timestamp": "..."}
```

### Create Test Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Inspeção geral",
    "date": "2026-04-10T10:00:00.000Z",
    "notes": "Verificação completa"
  }'
```

### Get Statistics
```bash
curl http://localhost:3000/api/services/statistics/summary
```

---

## 📝 Environment Variables

### `.env` File

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://carsync_user:carsync_password@postgres:5432/carsync_db
```

### Development vs Production

**Development:**
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/carsync_dev
```

**Production:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:secure_pass@prod-db.example.com/carsync
```

---

## 🐳 Docker Commands

### Build and Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove volumes (delete data)
docker-compose down -v
```

### Database Operations in Docker
```bash
# Run migrations
docker-compose exec backend npm run prisma:migrate

# Seed database
docker-compose exec backend npm run prisma:seed

# Open Prisma Studio
docker-compose exec backend npm run prisma:studio

# Access PostgreSQL CLI
docker-compose exec postgres psql -U carsync_user -d carsync_db
```

---

## 🚢 Deployment

### Build for Production

```bash
# Build TypeScript
npm run build

# Verify build
ls dist/

# Check Node modules
npm run type-check
```

### Docker Deployment

```bash
# Build production image
docker build -t carsync-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  carsync-backend:latest
```

---

## 📚 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20+ | Runtime |
| **Express** | ^4.18 | HTTP server |
| **TypeScript** | ^5.3 | Type safety |
| **Prisma** | ^5.7 | ORM |
| **PostgreSQL** | 16+ | Database |
| **Zod** | ^3.22 | Validation |
| **Docker** | - | Containerization |

---

## 🔐 Security Best Practices

- ✅ Input validation with Zod
- ✅ CORS configured for specific origins
- ✅ Environment variables for sensitive data
- ✅ Database queries through Prisma (SQL injection prevention)
- ✅ Error handling without exposing internals
- ✅ Non-root user in Docker

**Future improvements:**
- Authentication & JWT tokens
- Rate limiting
- Request logging & monitoring
- Database encryption

---

## 📊 Performance Considerations

- Database indexes on frequently queried columns
- Pagination support (max 100 items)
- Connection pooling via Prisma
- Query optimization via repository pattern
- Graceful error handling for reliability

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# View Prisma logs
DATABASE_URL=... npm run dev
```

### Migration Issues

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create migration for schema changes
npx prisma migrate dev --name <migration_name>
```

### Docker Issues

```bash
# Clean up containers
docker-compose down -v

# Rebuild from scratch
docker-compose up --build

# Check container logs
docker-compose logs backend
```

---

## 📖 Related Documentation

- **[API Examples](./SERVICE_API.md)** - Complete API endpoint examples
- **[Flutter Integration](./FLUTTER_INTEGRATION.md)** - Dart models and API client
- **[Prisma Docs](https://www.prisma.io/docs/)** - Database ORM documentation
- **[Express Docs](https://expressjs.com/)** - Web framework documentation

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded (if needed)
- [ ] Health check endpoint verified
- [ ] API endpoints tested
- [ ] Error handling validated
- [ ] Logging configured
- [ ] CORS settings correct
- [ ] Database backups configured
- [ ] Monitoring set up

---

## 📞 Support

For issues or questions:
1. Check error logs: `docker-compose logs backend`
2. Review [API documentation](./SERVICE_API.md)
3. Check [Flutter integration guide](./FLUTTER_INTEGRATION.md)
4. Verify [database schema](./prisma/schema.prisma)

---

## 📄 License

MIT License - See LICENSE file for details

