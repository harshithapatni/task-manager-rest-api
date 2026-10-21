# 📋 Task Manager REST API

A clean, beginner-friendly, production-ready REST API built with **Node.js**, **Express.js**, **SQLite**, **bcryptjs**, and **JSON Web Token (JWT)** authentication.

Designed specifically for clear understanding and easy demonstration during internship evaluations, technical interviews, and portfolio reviews.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technologies Used](#-technologies-used)
4. [Folder Structure](#-folder-structure)
5. [Database Architecture](#-database-architecture)
6. [Authentication & Security Flow](#-authentication--security-flow)
7. [Prerequisites & Installation](#-prerequisites--installation)
8. [Environment Variables](#-environment-variables)
9. [Running the Application](#-running-the-application)
10. [API Documentation](#-api-documentation)
    - [Health Check](#1-health-check)
    - [User Registration](#2-register-user)
    - [User Login](#3-login-user)
    - [Create Task](#4-create-task)
    - [Get All Tasks](#5-get-all-tasks)
    - [Get Task by ID](#6-get-single-task-by-id)
    - [Update Task](#7-update-task)
    - [Delete Task](#8-delete-task)
11. [Postman Testing Guide](#-postman-testing-guide)
12. [HTTP Status Codes Reference](#-http-status-codes-reference)
13. [Git & GitHub Commands](#-git--github-commands)

---

## 🌟 Project Overview

The **Task Manager REST API** provides a backend service for managing personal to-do tasks securely. Each user registers with a name, unique email, and password. Passwords are securely hashed with `bcryptjs`. Upon authentication, users receive a signed JWT token that must be included in subsequent requests to create, read, update, or delete tasks. 

Every task is strictly scoped to the authenticated user, ensuring complete data privacy and security.

---

## ✨ Features

- **User Authentication**: Secure registration and login using JWT.
- **Password Security**: Passwords are never stored as plain text; hashed using `bcryptjs` (salt rounds: 10).
- **Protected Routes**: Custom authentication middleware (`authMiddleware.js`) validates incoming Bearer tokens.
- **Data Isolation**: Users can only access, modify, or delete their own tasks.
- **Robust Input Validation**: Strict validation for required fields, non-empty strings, email format, password length, and boolean flags.
- **Standard HTTP Status Codes**: Accurate use of `200`, `201`, `400`, `401`, `404`, and `500`.
- **Lightweight Embedded SQLite**: Automatic table creation on startup with zero external database configuration required.
- **Safe Error Handling**: Clear JSON error responses without leaking sensitive stack traces.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime environment |
| **Express.js** | Fast, minimalist web framework for routing and middleware |
| **SQLite (`sqlite3`)** | Self-contained, serverless relational database engine |
| **bcryptjs** | Pure JavaScript library to hash and verify passwords securely |
| **jsonwebtoken** | Token-based stateless authentication mechanism |
| **dotenv** | Loads environment variables from `.env` into `process.env` |
| **nodemon** | Development tool that automatically restarts the server on file changes |

---

## 📁 Folder Structure

```text
Task Manager REST API/
├── server.js                  # Express app entry point & server setup
├── package.json               # Project manifest, dependencies & scripts
├── .env.example               # Template for required environment variables
├── .env                       # Local environment variables (git-ignored)
├── .gitignore                 # Files and folders excluded from Git
├── README.md                  # Comprehensive project documentation
│
├── database/
│   ├── database.js            # SQLite connection, initialization & Promise queries
│   └── task_manager.db        # SQLite database file (auto-generated, git-ignored)
│
├── middleware/
│   └── authMiddleware.js      # JWT authentication and authorization middleware
│
├── routes/
│   ├── authRoutes.js          # Authentication routes (/api/auth)
│   └── taskRoutes.js          # Task CRUD routes (/api/tasks)
│
└── controllers/
    ├── authController.js      # Register & login request logic
    └── taskController.js      # Task CRUD request logic & data validation
```

---

## 🗄️ Database Architecture

The SQLite database file `database/task_manager.db` is initialized automatically when the application starts.

### 1. `users` Table
Stores registered user credentials.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each user |
| `name` | `TEXT` | `NOT NULL` | Full name of the user |
| `email` | `TEXT` | `NOT NULL, UNIQUE` | User's unique email address |
| `password` | `TEXT` | `NOT NULL` | Bcrypt hashed password |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |

### 2. `tasks` Table
Stores tasks associated with users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each task |
| `user_id` | `INTEGER` | `NOT NULL, FOREIGN KEY` | References `users(id)` ON DELETE CASCADE |
| `title` | `TEXT` | `NOT NULL` | Title of the task |
| `description` | `TEXT` | `NOT NULL` | Detailed description of the task |
| `completed` | `INTEGER` | `DEFAULT 0` | Task completion status (`0` = false, `1` = true) |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Task creation timestamp |
| `updated_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Task last update timestamp |

---

## 🔐 Authentication & Security Flow

1. **Registration**: 
   - User submits `name`, `email`, and `password`.
   - The API verifies field presence, validates email format, and checks that password is at least 6 characters.
   - Password is hashed using `bcryptjs` with 10 salt rounds.
   - User is stored in the database. Password is omitted from the response.

2. **Login**:
   - User submits `email` and `password`.
   - The user record is retrieved from the database.
   - `bcrypt.compare()` compares the plain-text password with the stored hash.
   - On match, a JWT token is signed containing `{ id, email }` with a 24-hour expiration (`expiresIn: '24h'`).

3. **Protected Requests**:
   - For any `/api/tasks` endpoint, client provides header:
     ```http
     Authorization: Bearer <your_jwt_token>
     ```
   - `authMiddleware` intercepts the request:
     - If missing: returns `401 Unauthorized` (`Access denied. No token provided.`).
     - If invalid/expired: returns `401 Unauthorized` (`Invalid or expired token.`).
     - If valid: extracts payload and attaches user ID to `req.user.id`.
   - Task controller queries use `WHERE user_id = req.user.id`, preventing any unauthorized access to another user's tasks.

---

## 💻 Prerequisites & Installation

### Prerequisites
- **Node.js** (v16 or higher installed)
- **npm** (comes packaged with Node.js)
- **Git**

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-manager-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
# On Linux / macOS / Git Bash:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Edit `.env` to configure your settings:

```env
PORT=5000
JWT_SECRET=super_secret_jwt_key_task_manager_2026_secure
```

> **Security Note:** Never commit `.env` to GitHub. The `.gitignore` file is configured to exclude it.

---

## 🚀 Running the Application

### Production / Standard Mode
```bash
npm start
```

### Development Mode (with auto-restart via nodemon)
```bash
npm run dev
```

The server will start at:
```text
🚀 Task Manager API server running on port 5000
📡 Health Check: http://localhost:5000/api/health
```

---

## 📚 API Documentation

### Base URL
```text
http://localhost:5000/api
```

---

### 1. Health Check

Verifies that the server and API are up and running.

- **Method**: `GET`
- **URL**: `/api/health`
- **Authentication**: None (Public)
- **Request Body**: None

#### Successful Response (`200 OK`)
```json
{
  "message": "Task Manager API is running"
}
```

---

### 2. Register User

Registers a new user account.

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Authentication**: None (Public)
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Harshitha",
  "email": "harshitha@example.com",
  "password": "password123"
}
```

#### Successful Response (`201 Created`)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Harshitha",
    "email": "harshitha@example.com",
    "created_at": "2026-10-21 17:00:00"
  }
}
```

#### Possible Error Responses
- **`400 Bad Request`** (Missing fields):
  ```json
  { "error": "Please provide name, email, and password." }
  ```
- **`400 Bad Request`** (Invalid email format):
  ```json
  { "error": "Please provide a valid email address." }
  ```
- **`400 Bad Request`** (Password too short):
  ```json
  { "error": "Password must be at least 6 characters long." }
  ```
- **`400 Bad Request`** (Duplicate email):
  ```json
  { "error": "Email is already registered." }
  ```

---

### 3. Login User

Authenticates a user and generates a JWT bearer token.

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Authentication**: None (Public)
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "email": "harshitha@example.com",
  "password": "password123"
}
```

#### Successful Response (`200 OK`)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Possible Error Responses
- **`400 Bad Request`** (Missing fields):
  ```json
  { "error": "Please provide both email and password." }
  ```
- **`401 Unauthorized`** (Wrong email or password):
  ```json
  { "error": "Invalid email or password." }
  ```

---

### 4. Create Task

Creates a new task associated with the logged-in user.

- **Method**: `POST`
- **URL**: `/api/tasks`
- **Authentication**: Required (`Bearer <token>`)
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`

#### Request Body
```json
{
  "title": "Complete Internship Project",
  "description": "Build and document REST API with Node.js and Express",
  "completed": false
}
```
*(Note: `completed` is optional and defaults to `false` if omitted).*

#### Successful Response (`201 Created`)
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Complete Internship Project",
    "description": "Build and document REST API with Node.js and Express",
    "completed": false,
    "created_at": "2026-10-21 17:05:00",
    "updated_at": "2026-10-21 17:05:00"
  }
}
```

#### Possible Error Responses
- **`400 Bad Request`** (Missing title or empty):
  ```json
  { "error": "Title is required and cannot be empty." }
  ```
- **`400 Bad Request`** (Missing description or empty):
  ```json
  { "error": "Description is required and cannot be empty." }
  ```
- **`400 Bad Request`** (Invalid completed value):
  ```json
  { "error": "Completed must be a boolean value (true or false)." }
  ```
- **`401 Unauthorized`** (Missing or invalid token):
  ```json
  { "error": "Access denied. No token provided." }
  ```

---

### 5. Get All Tasks

Retrieves all tasks belonging to the authenticated user.

- **Method**: `GET`
- **URL**: `/api/tasks`
- **Authentication**: Required (`Bearer <token>`)
- **Headers**: `Authorization: Bearer <your_jwt_token>`

#### Successful Response (`200 OK`)
```json
{
  "count": 1,
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Complete Internship Project",
      "description": "Build and document REST API with Node.js and Express",
      "completed": false,
      "created_at": "2026-10-21 17:05:00",
      "updated_at": "2026-10-21 17:05:00"
    }
  ]
}
```

#### Possible Error Responses
- **`401 Unauthorized`**:
  ```json
  { "error": "Access denied. No token provided." }
  ```

---

### 6. Get Single Task by ID

Retrieves a single task by its unique ID. Only returns the task if it belongs to the authenticated user.

- **Method**: `GET`
- **URL**: `/api/tasks/:id` (e.g., `/api/tasks/1`)
- **Authentication**: Required (`Bearer <token>`)
- **Headers**: `Authorization: Bearer <your_jwt_token>`

#### Successful Response (`200 OK`)
```json
{
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Complete Internship Project",
    "description": "Build and document REST API with Node.js and Express",
    "completed": false,
    "created_at": "2026-10-21 17:05:00",
    "updated_at": "2026-10-21 17:05:00"
  }
}
```

#### Possible Error Responses
- **`400 Bad Request`** (Invalid task ID format):
  ```json
  { "error": "Invalid task ID. ID must be a positive integer." }
  ```
- **`401 Unauthorized`** (Missing or invalid token):
  ```json
  { "error": "Access denied. No token provided." }
  ```
- **`404 Not Found`** (Task does not exist or belongs to another user):
  ```json
  { "error": "Task not found." }
  ```

---

### 7. Update Task

Updates one or more fields (`title`, `description`, `completed`) of an existing task.

- **Method**: `PUT`
- **URL**: `/api/tasks/:id` (e.g., `/api/tasks/1`)
- **Authentication**: Required (`Bearer <token>`)
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`

#### Request Body
```json
{
  "title": "Complete Internship Project (Updated)",
  "description": "Updated project description with test results",
  "completed": true
}
```

#### Successful Response (`200 OK`)
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 1,
    "user_id": 1,
    "title": "Complete Internship Project (Updated)",
    "description": "Updated project description with test results",
    "completed": true,
    "created_at": "2026-10-21 17:05:00",
    "updated_at": "2026-10-21 17:15:30"
  }
}
```

#### Possible Error Responses
- **`400 Bad Request`** (No fields provided):
  ```json
  { "error": "At least one field (title, description, or completed) must be provided to update." }
  ```
- **`400 Bad Request`** (Empty title):
  ```json
  { "error": "Title cannot be empty." }
  ```
- **`401 Unauthorized`**:
  ```json
  { "error": "Access denied. No token provided." }
  ```
- **`404 Not Found`**:
  ```json
  { "error": "Task not found." }
  ```

---

### 8. Delete Task

Deletes an existing task belonging to the authenticated user.

- **Method**: `DELETE`
- **URL**: `/api/tasks/:id` (e.g., `/api/tasks/1`)
- **Authentication**: Required (`Bearer <token>`)
- **Headers**: `Authorization: Bearer <your_jwt_token>`

#### Successful Response (`200 OK`)
```json
{
  "message": "Task deleted successfully"
}
```

#### Possible Error Responses
- **`400 Bad Request`** (Invalid ID):
  ```json
  { "error": "Invalid task ID. ID must be a positive integer." }
  ```
- **`401 Unauthorized`**:
  ```json
  { "error": "Access denied. No token provided." }
  ```
- **`404 Not Found`** (Task not found or owned by another user):
  ```json
  { "error": "Task not found." }
  ```

---

## 📮 Postman Testing Guide

Follow this recommended testing sequence in Postman:

### Step 1: Health Check
- Method: `GET`
- URL: `http://localhost:5000/api/health`
- Expected Status: `200 OK`

### Step 2: Register a New User
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "name": "Harshitha",
    "email": "harshitha@example.com",
    "password": "password123"
  }
  ```
- Expected Status: `201 Created`

### Step 3: Login to Obtain JWT Token
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "harshitha@example.com",
    "password": "password123"
  }
  ```
- Expected Status: `200 OK`
- **Copy the `token` string from the response.**

### Step 4: Verify Protected Route without Token (Expect 401)
- Method: `GET`
- URL: `http://localhost:5000/api/tasks`
- Headers: None (omit `Authorization`)
- Expected Status: `401 Unauthorized`

### Step 5: Create a Task
- Method: `POST`
- URL: `http://localhost:5000/api/tasks`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <paste_token_here>`
- Body:
  ```json
  {
    "title": "Study Node.js Architecture",
    "description": "Understand event loop and Express middleware",
    "completed": false
  }
  ```
- Expected Status: `201 Created`

### Step 6: Get All Tasks
- Method: `GET`
- URL: `http://localhost:5000/api/tasks`
- Headers: `Authorization: Bearer <paste_token_here>`
- Expected Status: `200 OK`

### Step 7: Get Task by ID
- Method: `GET`
- URL: `http://localhost:5000/api/tasks/1`
- Headers: `Authorization: Bearer <paste_token_here>`
- Expected Status: `200 OK`

### Step 8: Update the Task
- Method: `PUT`
- URL: `http://localhost:5000/api/tasks/1`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <paste_token_here>`
- Body:
  ```json
  {
    "completed": true
  }
  ```
- Expected Status: `200 OK`

### Step 9: Test Error Handling (Invalid Input)
- Method: `POST`
- URL: `http://localhost:5000/api/tasks`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <paste_token_here>`
- Body:
  ```json
  {
    "title": ""
  }
  ```
- Expected Status: `400 Bad Request`

### Step 10: Delete the Task
- Method: `DELETE`
- URL: `http://localhost:5000/api/tasks/1`
- Headers: `Authorization: Bearer <paste_token_here>`
- Expected Status: `200 OK`

### Step 11: Verify 404 Not Found on Deleted Task
- Method: `GET`
- URL: `http://localhost:5000/api/tasks/1`
- Headers: `Authorization: Bearer <paste_token_here>`
- Expected Status: `404 Not Found`

---

## 📊 HTTP Status Codes Reference

| Code | Status | Meaning in this Project |
| :---: | :--- | :--- |
| **`200`** | `OK` | Request succeeded (GET, PUT, DELETE). |
| **`201`** | `Created` | Resource successfully created (POST user registration, POST task creation). |
| **`400`** | `Bad Request` | Missing required fields, empty strings, invalid email format, or invalid ID. |
| **`401`** | `Unauthorized` | Missing, expired, or invalid JWT token, or incorrect login credentials. |
| **`403`** | `Forbidden` | Access refused due to insufficient permissions. |
| **`404`** | `Not Found` | Requested route or task does not exist (or belongs to another user). |
| **`500`** | `Internal Server Error` | Unexpected server error. Generic error message returned to client. |

---

## 🐙 Git & GitHub Commands

Commands to initialize a local Git repository and push your project to GitHub:

```bash
# 1. Initialize local git repository
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete beginner-friendly Task Manager REST API"

# 4. Rename default branch to main
git branch -M main

# 5. Link local repository to your remote GitHub repository
git remote add origin <repository-url>

# 6. Push your commits to GitHub
git push -u origin main
```
