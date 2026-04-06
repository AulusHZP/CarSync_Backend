# API Examples

Complete request and response examples for all CarSync Expense API endpoints.

## 🌐 Base URL

```
http://localhost:3000
```

## ✅ Successful Responses

### 1. Create Expense

**Request:**
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

---

### 2. Get All Expenses (Paginated)

**Request:**
```http
GET /api/expenses?page=1&limit=10
Content-Type: application/json
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
    },
    {
      "id": "a92e88f6-6c7b-4e89-b8c4-1f2e3d4c5b6a",
      "category": "MAINTENANCE",
      "categoryLabel": "Manutenção",
      "amount": 250.00,
      "createdAt": "2026-04-01T14:15:00.000Z",
      "updatedAt": "2026-04-01T14:15:00.000Z"
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

---

### 3. Get Single Expense

**Request:**
```http
GET /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json
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

---

### 4. Update Expense

**Request:**
```http
PUT /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{
  "amount": 100.00
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "category": "FUEL",
    "categoryLabel": "Combustível",
    "amount": 100.00,
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T11:45:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

**Request (Update both category and amount):**
```http
PUT /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{
  "category": "MAINTENANCE",
  "amount": 250.00
}
```

---

### 5. Delete Expense

**Request:**
```http
DELETE /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json
```

**Response (204 No Content):**
```
(empty body)
```

---

### 6. Health Check

**Request:**
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-02T10:30:00.000Z"
}
```

---

## ❌ Error Responses

### 1. Validation Error - Missing Fields

**Request:**
```http
POST /api/expenses
Content-Type: application/json

{
  "amount": 85.50
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "category": "Required"
  }
}
```

---

### 2. Validation Error - Invalid Category

**Request:**
```http
POST /api/expenses
Content-Type: application/json

{
  "category": "INVALID_CATEGORY",
  "amount": 85.50
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "category": "Category must be one of: FUEL, MAINTENANCE, INSURANCE, CAR_WASH, PARKING, TOLL, OTHER"
  }
}
```

---

### 3. Validation Error - Negative Amount

**Request:**
```http
POST /api/expenses
Content-Type: application/json

{
  "category": "FUEL",
  "amount": -50.00
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "amount": "Amount must be greater than 0"
  }
}
```

---

### 4. Validation Error - Zero Amount

**Request:**
```http
POST /api/expenses
Content-Type: application/json

{
  "category": "FUEL",
  "amount": 0
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": {
    "amount": "Amount must be greater than 0"
  }
}
```

---

### 5. Not Found - Invalid ID

**Request:**
```http
GET /api/expenses/invalid-uuid-that-doesnt-exist
```

**Response (404 Not Found):**
```json
{
  "error": "Expense not found"
}
```

---

### 6. Update with No Fields

**Request:**
```http
PUT /api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{}
```

**Response (400 Bad Request):**
```json
{
  "error": "No fields to update"
}
```

---

### 7. Route Not Found

**Request:**
```http
GET /api/invalid-route
```

**Response (404 Not Found):**
```json
{
  "error": "Route GET /api/invalid-route not found"
}
```

---

### 8. Internal Server Error

**Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

---

## 📋 Test Scenarios with cURL

### Create Multiple Expenses

```bash
# Create FUEL expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"FUEL","amount":85.50}'

# Create MAINTENANCE expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"MAINTENANCE","amount":250.00}'

# Create INSURANCE expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"INSURANCE","amount":450.00}'

# Create CAR_WASH expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"CAR_WASH","amount":45.50}'

# Create PARKING expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"category":"PARKING","amount":25.00}'
```

### List with Pagination

```bash
# Page 1, 10 items
curl "http://localhost:3000/api/expenses?page=1&limit=10"

# Page 2, 5 items
curl "http://localhost:3000/api/expenses?page=2&limit=5"

# Default (page 1, 10 items)
curl http://localhost:3000/api/expenses
```

### Get Specific Expense

```bash
# Copy the ID from previous response
curl http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Update Expense

```bash
# Update amount
curl -X PUT http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{"amount":100.00}'

# Update category
curl -X PUT http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{"category":"MAINTENANCE"}'

# Update both
curl -X PUT http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{"category":"MAINTENANCE","amount":200.00}'
```

### Delete Expense

```bash
curl -X DELETE http://localhost:3000/api/expenses/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## 📊 Response Time Examples

Typical response times on localhost:

| Endpoint | Method | Scenario | Time |
|----------|--------|----------|------|
| /api/expenses | POST | Create | 50-100ms |
| /api/expenses | GET | List (10 items) | 30-50ms |
| /api/expenses/:id | GET | Single | 20-30ms |
| /api/expenses/:id | PUT | Update | 40-80ms |
| /api/expenses/:id | DELETE | Delete | 30-60ms |

---

## 🔐 Valid Category Values

Use exactly these values for the `category` field:

- `FUEL` → "Combustível" (UI label)
- `MAINTENANCE` → "Manutenção"
- `INSURANCE` → "Seguro"
- `CAR_WASH` → "Lava-rápido"
- `PARKING` → "Estacionamento"
- `TOLL` → "Pedágio"
- `OTHER` → "Outro"

---

## 💾 Database State After Examples

After running create examples above, database contains:

```
Expense 1: FUEL | R$ 85.50
Expense 2: MAINTENANCE | R$ 250.00
Expense 3: INSURANCE | R$ 450.00
Expense 4: CAR_WASH | R$ 45.50
Expense 5: PARKING | R$ 25.00

Total: R$ 856.00
```

---

## 📱 JavaScript Fetch Examples

### Create Expense

```javascript
const response = await fetch('http://localhost:3000/api/expenses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category: 'FUEL',
    amount: 85.50,
  }),
});

const result = await response.json();
console.log(result);
```

### Get All Expenses

```javascript
const response = await fetch('http://localhost:3000/api/expenses?page=1&limit=10');
const result = await response.json();
console.log(result.data);
console.log(result.pagination);
```

### Update Expense

```javascript
const expenseId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const response = await fetch(`http://localhost:3000/api/expenses/${expenseId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100.00,
  }),
});

const result = await response.json();
console.log(result);
```

### Delete Expense

```javascript
const expenseId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const response = await fetch(`http://localhost:3000/api/expenses/${expenseId}`, {
  method: 'DELETE',
});

if (response.status === 204) {
  console.log('Deleted successfully');
}
```

---

## 🪐 Postman Collection

Import this into Postman as a collection JSON:

```json
{
  "info": {
    "name": "CarSync Expense API",
    "description": "API endpoints for CarSync expense management"
  },
  "item": [
    {
      "name": "Create Expense",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/expenses",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"category\":\"FUEL\",\"amount\":85.50}"
        }
      }
    },
    {
      "name": "Get All Expenses",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/expenses?page=1&limit=10"
      }
    },
    {
      "name": "Get Single Expense",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/expenses/{{expense_id}}"
      }
    },
    {
      "name": "Update Expense",
      "request": {
        "method": "PUT",
        "url": "{{base_url}}/api/expenses/{{expense_id}}",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"amount\":100.00}"
        }
      }
    },
    {
      "name": "Delete Expense",
      "request": {
        "method": "DELETE",
        "url": "{{base_url}}/api/expenses/{{expense_id}}"
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:3000"},
    {"key": "expense_id", "value": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}
  ]
}
```
