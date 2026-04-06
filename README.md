# CarSync Expense Backend

Production-ready Node.js backend for the CarSync expense tracking feature. Built with Express, TypeScript, Prisma ORM, and PostgreSQL.

## 🏗️ Architecture

```
src/
├── app.ts              # Express application setup
├── server.ts           # Server entry point
├── config/             # Configuration (env, database)
├── types/              # TypeScript types & DTOs
├── controllers/        # HTTP request handlers
├── services/           # Business logic
├── repositories/       # Data access layer
├── validators/         # Input validation (Zod)
├── middlewares/        # Error handling, logging
├── routes/             # API route definitions
└── utils/              # Helper utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16+ (if running locally)

### Option 1: Docker Compose (Recommended)

```bash
# Clone and setup
git clone <repo-url>
cd carsync_backend

# Copy environment file
cp .env.example .env

# Start services
docker-compose up

# Backend will be available at http://localhost:3000
# PostgreSQL at localhost:5432
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your local PostgreSQL connection
# DATABASE_URL=postgresql://user:password@localhost:5432/carsync_expenses_db

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev

# Backend will be available at http://localhost:3000
```

## 📦 Available Scripts

```bash
# Development
npm run dev              # Run with ts-node

# Production
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled JavaScript

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create/apply migrations
npm run prisma:seed      # Run seed script
npm run prisma:studio    # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

## 🗄️ Database Schema

### Expense Model

```
Expense
├── id (UUID, Primary Key)
├── category (ExpenseCategory Enum)
├── amount (Decimal - 10,2)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

### ExpenseCategory Enum

```
- FUEL           → Combustível
- MAINTENANCE    → Manutenção
- INSURANCE      → Seguro
- CAR_WASH       → Lava-rápido
- PARKING        → Estacionamento
- TOLL           → Pedágio
- OTHER          → Outro
```

## 📡 API Endpoints

### Create Expense

```http
POST /api/expenses
Content-Type: application/json

{
  "category": "FUEL",
  "amount": 85.50
}
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

### Get All Expenses

```http
GET /api/expenses?page=1&limit=10
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
    "total": 42,
    "pages": 5
  },
  "message": "Expenses retrieved successfully"
}
```

### Get Expense by ID

```http
GET /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response (200 OK):**

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
  "message": "Expense retrieved successfully"
}
```

### Update Expense

```http
PUT /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{
  "category": "MAINTENANCE",
  "amount": 150.00
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "category": "MAINTENANCE",
    "categoryLabel": "Manutenção",
    "amount": 150.00,
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T11:45:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

### Delete Expense

```http
DELETE /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response (204 No Content):**

```
(empty body)
```

## ❌ Error Responses

### Validation Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "category": "Category must be one of: FUEL, MAINTENANCE, INSURANCE, CAR_WASH, PARKING, TOLL, OTHER",
    "amount": "Amount must be greater than 0"
  }
}
```

### Not Found (404)

```json
{
  "error": "Expense not found"
}
```

### Server Error (500)

```json
{
  "error": "Internal server error"
}
```

## 🔧 Environment Variables

```bash
# Server
NODE_ENV=development           # development | production
PORT=3000                      # Server port

# Database
DATABASE_URL=postgresql://...  # PostgreSQL connection string
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t carsync-backend:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f backend
```

### Stop Services

```bash
docker-compose down
```

## 🧪 Testing

### Using cURL

```bash
# Create expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"FUEL","amount":85.50}'

# Get all expenses
curl http://localhost:3000/api/expenses

# Get single expense
curl http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479

# Update expense
curl -X PUT http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{"amount":100.00}'

# Delete expense
curl -X DELETE http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Using Postman

Import the API endpoints above or open [Postman Collection](./postman-collection.json) (if available).

## 📱 Flutter Integration

See [Flutter Integration Guide](./FLUTTER_INTEGRATION.md) for Dart models and example service code.

## 🔮 Future Features (Architecture-Ready)

- ✅ User authentication & authorization
- ✅ Vehicle linking (multi-vehicle support)
- ✅ Monthly reports & aggregations
- ✅ Charts and analytics
- ✅ Expense filtering (category, date range)
- ✅ Audit trail (who did what and when)
- ✅ Soft deletes
- ✅ Rate limiting & API throttling

## 📝 Project Structure Philosophy

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Business logic, validation, orchestration
- **Repositories**: Data access abstraction
- **Validators**: Input schema validation with Zod
- **Types**: Centralized DTOs and interfaces
- **Middlewares**: Cross-cutting concerns (logging, error handling)
- **Utils**: Helper functions and response formatting

## 🚨 Common Issues

### "Cannot find module" error

```bash
npm install
npm run prisma:generate
```

### Database connection refused

Check `.env` DATABASE_URL and ensure PostgreSQL is running:

```bash
# Docker Compose
docker-compose ps

# Local PostgreSQL
psql -U carsync_user -h localhost -d carsync_expenses_db
```

### Port already in use

Change PORT in `.env` or stop existing process:

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📚 Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📄 License

MIT
