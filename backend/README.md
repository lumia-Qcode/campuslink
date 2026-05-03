# CampusLink Backend

Node.js + Express + MongoDB backend using **Hexagonal Architecture**.

## Quick Start

```bash
cd backend
npm install

# Copy env and configure
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET in .env

# Seed the database with default users and data
npm run seed

# Start dev server
npm run dev

# Start production server
npm start
```

## Architecture (Hexagonal / Ports & Adapters)

```
backend/
├── src/
│   ├── domain/                    ← Core business logic (no frameworks)
│   │   ├── entities/              ← User, Student, Mark
│   │   ├── repositories/          ← (interfaces live in application/ports)
│   │   └── services/
│   ├── application/               ← Use cases (orchestration)
│   │   ├── ports/                 ← IUserRepository, IStudentRepository, IMarkRepository
│   │   └── use-cases/
│   │       ├── auth/              ← RegisterUser, LoginUser
│   │       └── student/           ← GetStudentDashboard, GetStudentMarks
│   └── infrastructure/            ← Frameworks, DB, HTTP
│       ├── database/
│       │   ├── models/            ← Mongoose schemas
│       │   └── repositories/      ← Concrete implementations of ports
│       └── web/
│           ├── controllers/       ← authController, studentController
│           ├── middleware/         ← JWT auth, RBAC, validators, error handler
│           └── routes/            ← authRoutes, studentRoutes
├── config/database.js
├── app.js
├── server.js
└── seed.js
```

## API Endpoints

### Auth
| Method | Endpoint         | Description              | Auth |
|--------|-----------------|--------------------------|------|
| POST   | /api/auth/signup | Register new user        | No   |
| POST   | /api/auth/login  | Login and receive JWT    | No   |
| GET    | /api/auth/me     | Get current user profile | JWT  |

### Student (requires JWT + student role)
| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| GET    | /api/student/dashboard | Full dashboard data     |
| GET    | /api/student/marks     | Marks (filter by ?component=) |
| GET    | /api/student/profile   | Student profile         |

## Default Demo Users (after seed)

| Email               | Password | Role    |
|---------------------|----------|---------|
| student@test.com    | 1234     | student |
| sara@test.com       | 1234     | student |
| teacher@test.com    | 1234     | teacher |
| admin@test.com      | 1234     | admin   |

## Security Features

- **JWT authentication** with role-based access control (RBAC)
- **Helmet** — sets secure HTTP headers
- **Rate limiting** — 20 auth requests / 15min, 200 general / 15min
- **express-validator** — input validation and sanitization (`.escape()` for XSS)
- **SQL/NoSQL injection protection** — MongoDB parameterized queries via Mongoose; all inputs cast to String before DB calls
- **bcrypt** — passwords hashed with 12 salt rounds
- **Body size limit** — 10kb max to prevent large payload attacks
- **CORS** — restricted to frontend origin

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campuslink
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
