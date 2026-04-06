# 🚀 CarSync Backend - Quick Start Guide

Get the backend running in **5 minutes** with Docker Compose.

## 📋 Prerequisites

- Docker & Docker Compose installed
- Or Node.js 20+ and PostgreSQL 16+ for local development

---

## ⚡ Option 1: Docker Compose (Recommended)

### Step 1: Setup

```bash
cd carsync_backend
cp .env.example .env
```

### Step 2: Start

```bash
docker-compose up
```

Wait for output:
```
✓ Server running on http://localhost:3000
✓ Environment: development
✓ Database connected
```

### Step 3: Test

```bash
# Health check
curl http://localhost:3000/health

# Create expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"FUEL","amount":85.50}'
```

### ✅ Done!

Backend is running at `http://localhost:3000`  
Database at `localhost:5432`

---

## 💻 Option 2: Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database

Create `.env` with your local PostgreSQL:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/carsync_expenses_db
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed sample data
npm run prisma:seed
```

### Step 4: Start Dev Server

```bash
npm run dev
```

Output:
```
✓ Server running on http://localhost:3000
✓ Environment: development
✓ Database connected
```

---

## 📡 API Quick Reference

### Create Expense

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "FUEL",
    "amount": 85.50
  }'
```

### Get All Expenses

```bash
curl http://localhost:3000/api/expenses
```

### Get Single Expense

```bash
curl http://localhost:3000/api/expenses/{expense-id}
```

### Update Expense

```bash
curl -X PUT http://localhost:3000/api/expenses/{expense-id} \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'
```

### Delete Expense

```bash
curl -X DELETE http://localhost:3000/api/expenses/{expense-id}
```

---

## 📚 Valid Categories

Use these exact values:

- `FUEL` - Combustível
- `MAINTENANCE` - Manutenção  
- `INSURANCE` - Seguro
- `CAR_WASH` - Lava-rápido
- `PARKING` - Estacionamento
- `TOLL` - Pedágio
- `OTHER` - Outro

---

## 📁 Project Structure

```
carsync_backend/
├── src/
│   ├── app.ts              # Express setup
│   ├── server.ts           # Entry point
│   ├── config/             # Configuration
│   ├── controllers/        # HTTP handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── validators/         # Zod schemas
│   ├── routes/             # API routes
│   ├── middlewares/        # Error handling
│   ├── types/              # TypeScript types
│   └── utils/              # Helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
├── Dockerfile              # Container config
├── docker-compose.yml      # Services setup
└── README.md               # Full documentation
```

---

## 🔍 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed data
npm run prisma:studio    # Open Prisma Studio (GUI)

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose ps        # List services

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check types
```

---

## 🐳 Docker Compose Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Rebuild

```bash
docker-compose up --build
```

### Reset Database

```bash
docker-compose down -v  # -v removes volumes
docker-compose up
```

---

## ⚠️ Common Issues

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Database Connection Failed

Ensure `.env` has correct `DATABASE_URL`:

```bash
# Docker Compose
DATABASE_URL=postgresql://carsync_user:carsync_password@postgres:5432/carsync_expenses_db

# Local PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/carsync_expenses_db
```

### Node Modules Issue

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Error

```bash
npm run type-check  # Check for errors
npm run build       # Rebuild
```

---

## 📊 Database Management

### Open Prisma Studio (GUI)

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### View Migrations

```bash
ls prisma/migrations/
```

### Create New Migration

```bash
npm run prisma:migrate -- --name migration_name
```

### Reset Database

```bash
npm run prisma:migrate -- --skip-generate reset
```

---

## 📱 Flutter Integration

See [FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md) for:
- Dart models
- Example service code
- Integration patterns

---

## 📖 Full Documentation

- [README.md](./README.md) - Complete documentation
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Request/response examples
- [FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md) - Mobile app setup

---

## 🎯 Next Steps

1. **✅ Start Backend** - `docker-compose up`
2. **✅ Test Endpoints** - Use examples above or Postman
3. **✅ Integrate with Flutter** - See FLUTTER_INTEGRATION.md
4. **✅ Deploy** - Use Dockerfile or docker-compose in production

---

## 💡 Tips

- Use `npm run dev` for hot-reload during development
- Check `npm run prisma:studio` for visual database management
- Keep `.env` out of git (use `.env.example`)
- Read full README.md for advanced configuration

---

## 🆘 Getting Help

1. Check [README.md](./README.md) for detailed docs
2. Review [API_EXAMPLES.md](./API_EXAMPLES.md) for request examples
3. See [FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md) for mobile integration
4. Check logs: `docker-compose logs -f`

---

**Ready to build?** Start with `docker-compose up` 🚀
