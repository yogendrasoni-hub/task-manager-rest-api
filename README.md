# 📋 Task Manager REST API with Authentication

A secure, robust, and production-ready REST API built with **Node.js**, **Express.js**, **SQLite (better-sqlite3)**, **JSON Web Tokens (JWT)**, and **Zod**. This project demonstrates clean backend architecture, strict input validation, multi-tenant data isolation, security headers, parameterized queries, and 100% automated test coverage.

Ideal for college assignments, internship portfolios, and real-world backend foundations.

---

## 🚀 Features

- **User Authentication**:
  - Secure registration with email validation and strong password requirements.
  - Password hashing via `bcrypt` with configurable salt rounds (default: 12).
  - Secure login with JWT issuance, expiration, and constant-time-like generic error responses to prevent user enumeration.
  - Reusable JWT authentication middleware verifying bearer tokens and validating database state.
- **Task Management (CRUD)**:
  - Create, read, update, and delete tasks.
  - Strict ownership enforcement: Users can only view, modify, or delete their own tasks.
  - SQLite foreign key constraints enabled with cascading deletion.
  - Data mapping: Stores boolean status as `0` or `1` in SQLite and cleanly transforms to JavaScript boolean in API responses.
- **Input Validation**:
  - Request body and URL parameter validation powered by **Zod**.
  - Rejection of unknown fields (`.strict()`) to mitigate property injection.
  - Standardized error reporting listing offending fields.
- **Security & Reliability**:
  - **Helmet** security headers.
  - **CORS** middleware enabled.
  - Request body size limits (10 KB max) to protect against DoS attacks.
  - Completely parameterized SQL statements to eliminate SQL Injection (SQLi).
  - WAL (Write-Ahead Logging) mode enabled for high-performance concurrent SQLite operations.
  - Centralized error handling and standardized JSON responses.
  - Sensitive information (passwords, JWT secrets, stack traces) never leaked in responses.
- **Automated Testing & Postman**:
  - Comprehensive integration test suite using **Vitest** and **Supertest**.
  - Ready-to-import Postman collection (`postman_collection.json`) with automated token management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) (v18+ / v20+ / v24+) |
| **Framework** | [Express.js](https://expressjs.com/) (v5) |
| **Database** | [SQLite](https://www.sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT) |
| **Hashing** | [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **Validation** | [Zod](https://zod.dev/) |
| **Security** | [Helmet](https://helmetjs.github.io/) & [CORS](https://expressjs.com/en/resources/middleware/cors.html) |
| **Testing** | [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest) |
| **Environment** | [`dotenv`](https://github.com/motdotla/dotenv) |

---

## 📁 Project Structure

```text
task-manager-api/
├── src/
│   ├── config/
│   │   ├── database.js          # SQLite connection, WAL mode & auto-schema migration
│   │   └── env.js               # Centralized environment variable parser
│   ├── controllers/
│   │   ├── auth.controller.js   # Registration and login logic
│   │   └── task.controller.js   # Task CRUD operations & ownership enforcement
│   ├── middleware/
│   │   ├── auth.js              # Bearer JWT verification & user attachment
│   │   ├── errorHandler.js      # Centralized error handler and 404 handler
│   │   └── validate.js          # Zod schema validation middleware (body & params)
│   ├── routes/
│   │   ├── auth.routes.js       # /api/auth routes
│   │   ├── health.routes.js     # /api/health route
│   │   └── task.routes.js       # /api/tasks routes
│   ├── utils/
│   │   └── responses.js         # Standard JSON response & task formatting helpers
│   ├── validators/
│   │   ├── auth.validator.js    # Zod schemas for registration and login
│   │   └── task.validator.js    # Zod schemas for tasks and URL params
│   ├── app.js                   # Express application setup
│   └── server.js                # Server entry point & graceful shutdown
├── data/                        # SQLite database files (.db, .db-wal, .db-shm)
├── tests/
│   ├── auth.test.js             # Authentication & token middleware tests
│   ├── health.test.js           # Health check & error handling tests
│   ├── helpers.js               # Test database setup & cleanup utilities
│   ├── persistence.test.js      # Database persistence verification
│   └── tasks.test.js            # Task CRUD & multi-tenant isolation tests
├── .env.example                 # Template for required environment variables
├── .gitignore                   # Git ignore file excluding secrets and DBs
├── package.json                 # Project dependencies and scripts
├── postman_collection.json      # Complete Postman collection for manual testing
├── README.md                    # Project documentation
└── vitest.config.js             # Vitest test configuration
```

---

## 🗄️ Database Schema

The database is automatically created upon starting the server. Foreign key constraints are enforced with `PRAGMA foreign_keys = ON;`.

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## ⚙️ Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or newer; tested on Node v24)
- npm (Version 9.x or newer)
- Git

### 1. Backend Setup & Configuration

From the root project directory:
```bash
# Install backend dependencies
npm install

# Copy .env.example to .env
# Windows PowerShell:
Copy-Item .env.example .env
# Linux / macOS:
cp .env.example .env
```

Ensure your `.env` contains valid configuration:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_cryptographic_key_at_least_32_chars
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=12
DB_PATH=./data/task_manager.db
```

### 2. Frontend Setup & Configuration

From the `frontend` folder:
```bash
cd frontend

# Install frontend dependencies
npm install

# Verify environment variable configuration
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚦 Running the Full-Stack Application

The backend and frontend run in separate terminal windows on different ports.

### Terminal 1: Backend Server (Port 5000)
From the root project directory:
```bash
# Development mode with auto-reload:
npm run dev

# Or production start:
npm start
```
The REST API will be active at:
```text
http://localhost:5000
API Base URL: http://localhost:5000/api
```

### Terminal 2: React Frontend (Port 5173)
From the `frontend` directory:
```bash
cd frontend

# Start Vite React development server:
npm run dev

# Or build for production:
npm run build
```
The React frontend web application will be accessible at:
```text
http://localhost:5173
```

---

## 🧪 Automated Testing

Automated tests are powered by **Vitest** and **Supertest** running against an isolated test SQLite database.

Run the full test suite:
```bash
npm test
```

### What is tested?
- ✅ **Health Check**: Endpoint responds with status 200.
- ✅ **Registration**:
  - Registers new users with hashed passwords (HTTP 201).
  - Rejects invalid emails (HTTP 400).
  - Rejects passwords shorter than 8 characters (HTTP 400).
  - Rejects empty names (HTTP 400).
  - Rejects duplicate email addresses (HTTP 409).
  - Rejects unknown extra payload fields (HTTP 400).
- ✅ **Login**:
  - Issues signed JWT for correct credentials (HTTP 200).
  - Rejects wrong password with generic message (HTTP 401).
  - Rejects non-existent email with generic message (HTTP 401).
- ✅ **Auth Middleware**:
  - Rejects requests missing `Authorization` header (HTTP 401).
  - Rejects malformed auth headers (HTTP 401).
  - Rejects invalid or expired JWT tokens (HTTP 401).
- ✅ **Task CRUD**:
  - Creates task with authenticated user association (HTTP 201).
  - Lists tasks belonging to user (returns empty array if none) (HTTP 200).
  - Retrieves single task by ID (HTTP 200).
  - Updates title, description, and completed status (HTTP 200).
  - Rejects empty update objects (HTTP 400).
  - Deletes task (HTTP 200).
  - Returns 404 for non-existent tasks.
  - Rejects malformed task IDs (HTTP 400).
- ✅ **Multi-Tenant Security & Isolation**:
  - User A cannot view User B's tasks.
  - User A cannot update User B's tasks (returns 404).
  - User A cannot delete User B's tasks (returns 404).
- ✅ **Data Persistence**:
  - Verifies that data remains intact across database disconnects and restarts.

---

## 📖 API Documentation

### Base URL
```text
http://localhost:5000/api
```

### Standard Response Formats

#### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

#### Validation Error Response (HTTP 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and cannot be empty"
    }
  ]
}
```

#### Authentication Error Response (HTTP 401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Check server status |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and obtain JWT token |
| `POST` | `/api/tasks` | **Yes** (Bearer) | Create a new task |
| `GET` | `/api/tasks` | **Yes** (Bearer) | List all tasks for current user |
| `GET` | `/api/tasks/:id` | **Yes** (Bearer) | Retrieve a specific task by ID |
| `PUT` | `/api/tasks/:id` | **Yes** (Bearer) | Update a task |
| `DELETE` | `/api/tasks/:id` | **Yes** (Bearer) | Delete a task |

---

### Detailed Endpoint Specifications

#### 1. Health Check
- **URL**: `GET /api/health`
- **Authentication**: None
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Task Manager API is running"
}
```

---

#### 2. User Registration
- **URL**: `POST /api/auth/register`
- **Authentication**: None
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Yogendra Soni",
  "email": "yogendra@example.com",
  "password": "StrongPass123!"
}
```
- **Validation Rules**:
  - `name`: Required non-empty string.
  - `email`: Required valid email address.
  - `password`: Required string of at least 8 characters.
  - No additional fields permitted (`.strict()`).
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Yogendra Soni",
    "email": "yogendra@example.com"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Input validation failed.
  - `409 Conflict`: Email already exists.

---

#### 3. User Login
- **URL**: `POST /api/auth/login`
- **Authentication**: None
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "yogendra@example.com",
  "password": "StrongPass123!"
}
```
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Yogendra Soni",
    "email": "yogendra@example.com"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Malformed or missing email/password.
  - `401 Unauthorized`: Invalid email or password (generic message).

---

#### 4. Create Task
- **URL**: `POST /api/tasks`
- **Authentication**: Bearer Token required
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Complete ECE assignment",
  "description": "Finish the communication assignment",
  "completed": false
}
```
- **Validation Rules**:
  - `title`: Required non-empty string.
  - `description`: Optional string or null.
  - `completed`: Optional boolean (defaults to `false`).
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Complete ECE assignment",
    "description": "Finish the communication assignment",
    "completed": false,
    "created_at": "2026-11-02 15:40:12",
    "updated_at": "2026-11-02 15:40:12"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or unknown fields.
  - `401 Unauthorized`: Missing or invalid token.

---

#### 5. Get All Tasks
- **URL**: `GET /api/tasks`
- **Authentication**: Bearer Token required
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Complete ECE assignment",
      "description": "Finish the communication assignment",
      "completed": false,
      "created_at": "2026-11-02 15:40:12",
      "updated_at": "2026-11-02 15:40:12"
    }
  ]
}
```
*(Returns an empty array `[]` if the user has no tasks)*
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token.

---

#### 6. Get Single Task
- **URL**: `GET /api/tasks/:id`
- **Authentication**: Bearer Token required
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
- **URL Parameters**:
  - `id`: Positive integer (e.g., `1`)
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": 1,
    "title": "Complete ECE assignment",
    "description": "Finish the communication assignment",
    "completed": false,
    "created_at": "2026-11-02 15:40:12",
    "updated_at": "2026-11-02 15:40:12"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid task ID parameter.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Task does not exist or does not belong to the user.

---

#### 7. Update Task
- **URL**: `PUT /api/tasks/:id`
- **Authentication**: Bearer Token required
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Complete updated assignment",
  "description": "Updated description",
  "completed": true
}
```
*(At least one valid field must be provided; empty objects are rejected)*
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Complete updated assignment",
    "description": "Updated description",
    "completed": true,
    "created_at": "2026-11-02 15:40:12",
    "updated_at": "2026-11-02 15:42:00"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Empty update object or invalid fields.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Task does not exist or does not belong to the user.

---

#### 8. Delete Task
- **URL**: `DELETE /api/tasks/:id`
- **Authentication**: Bearer Token required
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid task ID parameter.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Task does not exist or does not belong to the user.

---

## 📮 Postman Testing Instructions

A ready-to-use Postman collection is included in the project root: `postman_collection.json`.

1. Open **Postman**.
2. Click **Import** (top left).
3. Select or drag-and-drop `postman_collection.json`.
4. The imported collection has two collection variables:
   - `baseUrl`: default `http://localhost:5000`
   - `authToken`: automatically updated upon running the **Login User** request!
5. **Workflow**:
   1. Run `Register User`.
   2. Run `Login User` (the Postman test script saves the JWT into `{{authToken}}`).
   3. Run `Create Task`, `Get All Tasks`, `Get Single Task`, `Update Task`, and `Delete Task`.

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Passwords are never stored in plaintext; hashed with `bcrypt` (12 rounds).
2. **Timing & Enumeration Resistance**: Login failure messages are generic ("Invalid email or password") to prevent credential and user enumeration.
3. **No Credential Leakage**: Password hashes and secrets are never returned in JSON responses or log outputs.
4. **SQL Injection Prevention**: All queries use parameterized statements (`?`) with `better-sqlite3`.
5. **Strict Input Sanitization**: Zod `.strict()` ensures unexpected fields are rejected.
6. **Payload Size Limit**: Body parser capped at 10 KB to prevent memory exhaustion attacks.
7. **HTTP Security Headers**: Powered by `helmet()`.
8. **Stateless JWTs**: Tokens have explicit expiration windows (`1h`).
9. **Ownership Isolation**: Every task query checks `user_id = ?` to guarantee cross-tenant privacy. Non-owned tasks return `404 Not Found` rather than `403` to prevent ID enumeration.

---

## 🛠️ Troubleshooting

- **`EADDRINUSE: address already in use :::5000`**:
  Another process is using port 5000. Either kill the existing process or set `PORT=5001` in `.env`.
- **`Authorization header must follow Bearer <token> format`**:
  Ensure the header is formatted as `Authorization: Bearer <token>` with a single space between `Bearer` and the token.
- **PowerShell script execution disabled**:
  If PowerShell blocks running `npm`, use `npm.cmd` or `cmd /c npm <command>`.

---

## 📄 License

This project is licensed under the ISC License.
