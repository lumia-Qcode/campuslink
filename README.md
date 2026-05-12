# CampusLink — MERN Stack School Management System

## Project Structure

```
campuslink/
├── backend/                          ← Node.js + Express (Hexagonal Architecture)
│   └── src/
│       ├── domain/                   ← Core business logic (no framework dependencies)
│       │   ├── entities/             ← User, Student, Teacher, Section, Fee, Announcement, TimetableEntry
│       │   ├── repositories/         ← (interfaces live in ports/out)
│       │   └── services/
│       ├── application/
│       │   └── use-cases/            ← AuthUseCases, StudentUseCases, TeacherUseCases,
│       │       ├── auth/               SectionUseCases, FeeUseCases, AnnouncementUseCases,
│       │       ├── students/           TimetableUseCases
│       │       ├── teachers/
│       │       ├── sections/
│       │       ├── fees/
│       │       ├── announcements/
│       │       └── timetable/
│       ├── ports/
│       │   ├── in/                   ← (HTTP routes are the in-ports)
│       │   └── out/
│       │       └── repositories.js   ← IUserRepository, IStudentRepository, etc. (interfaces)
│       ├── adapters/
│       │   ├── in/
│       │   │   └── http/
│       │   │       ├── controllers/  ← AuthController, StudentController, TeacherController,
│       │   │       │                   SectionController, FeeController, AnnouncementController,
│       │   │       │                   TimetableController
│       │   │       ├── middleware/   ← authMiddleware (JWT), errorHandler
│       │   │       └── routes/       ← authRoutes, studentRoutes, teacherRoutes, sectionRoutes,
│       │   │                           feeRoutes, announcementRoutes, timetableRoutes
│       │   └── out/
│       │       └── mongodb/
│       │           ├── models/       ← Mongoose schemas: UserModel, StudentModel, TeacherModel,
│       │           │                   SectionModel, FeeModel, AnnouncementModel, TimetableModel
│       │           └── repositories/ ← MongoUserRepository, MongoStudentRepository, ...
│       └── infrastructure/
│           ├── config/
│           │   └── container.js      ← Dependency Injection: wires repos → use cases → controllers → routes
│           ├── database/
│           │   └── connection.js     ← MongoDB connection
│           └── seed/
│               └── seed.js           ← Creates admin user (admin / admin123)
│
└── frontend/                         ← React.js (existing, updated)
    └── src/
        ├── services/
        │   ├── auth.js               ← Updated: username+JWT, no signup
        │   └── api.js                ← NEW: central API caller for all admin pages
        ├── components/
        │   └── Login.js              ← Updated: username field, no signup link
        ├── App.js                    ← Updated: removed /signup and /admin/financial-aid
        └── pages/
            ├── admin/                ← (connect to api.js — see Integration Guide below)
            ├── student/
            └── teacher/
```

---

## Hexagonal Architecture — How It Works

```
  [ HTTP Request ]
        ↓
  [ Routes ] (adapters/in/http/routes)
        ↓
  [ Controllers ] (adapters/in/http/controllers)
        ↓
  [ Use Cases ] (application/use-cases)   ← ONLY layer with business logic
        ↓
  [ Repository Interfaces ] (ports/out)
        ↓
  [ MongoDB Repositories ] (adapters/out/mongodb/repositories)
        ↓
  [ MongoDB via Mongoose ]
```

The Use Cases never import Mongoose. They only know about the interfaces in `ports/out/repositories.js`.
To swap MongoDB for PostgreSQL later: only write new adapters in `adapters/out/postgres/`.

---


## Default Admin Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

Login at http://localhost:3000 → select **Admin** tab → enter credentials.

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint         | Body                        | Description          |
|--------|------------------|-----------------------------|----------------------|
| POST   | /api/auth/login  | `{username, password}`      | Login, returns JWT   |
| GET    | /api/auth/me     | —                           | Get current user     |

### Students (Admin only)
| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | /api/students         | List all (filter: classId, section, search) |
| GET    | /api/students/:id     | Get one                                  |
| POST   | /api/students         | Create student + user account            |
| PUT    | /api/students/:id     | Update                                   |
| DELETE | /api/students/:id     | Delete (also removes login account)      |

**POST /api/students body:**
```json
{
  "username": "ali.ahmed",
  "password": "pass1234",
  "name": "Ali Ahmed",
  "classId": "9",
  "section": "A",
  "rollNo": 5,
  "gender": "Male",
  "dob": "2009-03-15",
  "cnic": "35202-1234567-1",
  "phone": "0300-1111111",
  "address": "123 Model Town, Lahore",
  "fatherName": "Ahmed Khan",
  "fatherPhone": "0300-2222222"
}
```

### Teachers (Admin only)
| Method | Endpoint              | Description                 |
|--------|-----------------------|-----------------------------|
| GET    | /api/teachers         | List all                    |
| POST   | /api/teachers         | Create teacher + user account |
| PUT    | /api/teachers/:id     | Update                      |
| DELETE | /api/teachers/:id     | Delete                      |

**POST /api/teachers body:**
```json
{
  "username": "ms.nadia",
  "password": "teach1234",
  "name": "Ms. Nadia Hussain",
  "department": "Mathematics",
  "qualification": "M.Sc Mathematics",
  "gender": "Female",
  "phone": "0300-5555555",
  "address": "45 Model Town, Lahore"
}
```

### Sections (Admin only)
| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | /api/sections      | List all (filter: classId, search) |
| POST   | /api/sections      | Create section                     |
| PUT    | /api/sections/:id  | Update (e.g. reassign teacher)     |
| DELETE | /api/sections/:id  | Delete                             |

**POST /api/sections body:**
```json
{ "classId": "9", "section": "A", "subject": "Mathematics", "teacherId": "<teacher_mongo_id>" }
```

### Fees (Admin only)
| Method | Endpoint                        | Description                         |
|--------|---------------------------------|-------------------------------------|
| GET    | /api/fees                       | List all (filter: month, classId, status, search) |
| GET    | /api/fees/months                | Get list of all fee months          |
| GET    | /api/fees/formula               | Get fee formula (50k/40k breakdown) |
| GET    | /api/fees/student/:studentId    | All fees for one student            |
| POST   | /api/fees                       | Create single fee record            |
| POST   | /api/fees/generate-monthly      | Auto-generate fees for ALL students |
| PATCH  | /api/fees/:id/mark-paid         | Mark fee as Paid                    |
| PATCH  | /api/fees/:id/mark-overdue      | Mark fee as Overdue                 |
| DELETE | /api/fees/:id                   | Delete fee record                   |

**Fee formula:** Class 6, 7, 8, 9, X → PKR 50,000 | All others → PKR 40,000

**POST /api/fees/generate-monthly body:**
```json
{ "month": "June 2026", "dueDate": "2026-06-10" }
```

### Announcements (Admin writes; all roles read)
| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /api/announcements        | All announcements (admin view)       |
| GET    | /api/announcements?role=student | Student announcements (for student portal) |
| GET    | /api/announcements?role=teacher | Teacher announcements               |
| POST   | /api/announcements        | Create announcement                  |
| PUT    | /api/announcements/:id    | Edit                                 |
| DELETE | /api/announcements/:id    | Delete                               |

**POST /api/announcements body:**
```json
{
  "title": "Summer Break Notice",
  "content": "School will be closed from June 20 to July 5.",
  "targetRoles": ["student", "teacher", "admin"]
}
```

### Timetable
| Method | Endpoint                                       | Description              |
|--------|------------------------------------------------|--------------------------|
| GET    | /api/timetable?classId=9&section=A            | Filter by class/section  |
| GET    | /api/timetable/class/:classId/section/:section | Get full timetable       |
| GET    | /api/timetable/teacher/:teacherId              | Teacher's timetable      |
| POST   | /api/timetable/save                            | Save full timetable (bulk replace) |
| POST   | /api/timetable                                 | Add single entry         |
| PUT    | /api/timetable/:id                             | Update entry             |
| DELETE | /api/timetable/:id                             | Delete entry             |

---

## Connecting Admin Pages to Backend

Each admin page currently uses mock data. Replace by importing from `src/services/api.js`.

**Example — AdminStudents.js migration:**

```jsx
// Before (mock data):
import { mockStudents as initialStudents } from "../../data/adminMockData";
const [students, setStudents] = useState(initialStudents);

// After (API):
import { apiGetStudents, apiCreateStudent, apiDeleteStudent } from "../../services/api";
const [students, setStudents] = useState([]);

useEffect(() => {
  apiGetStudents().then(res => setStudents(res.data)).catch(console.error);
}, []);

const handleSubmit = async () => {
  const result = await apiCreateStudent({ ...form, username, password });
  setStudents(prev => [...prev, result.data]);
};
```

The same pattern applies to AdminTeachers, AdminSections, AdminFees, AdminAnnouncements, AdminTimetable.

---

## Student/Teacher Portal — Future Connection

The backend is already set up for this. When you're ready:

**Student portal announcements:**
```js
fetch('/api/announcements?role=student', { headers: authHeaders() })
```

**Student timetable:**
```js
fetch(`/api/timetable/class/${student.classId}/section/${student.section}`, { headers: authHeaders() })
```

**Student fees:**
```js
fetch(`/api/fees/student/${student._id}`, { headers: authHeaders() })
```

**Teacher timetable:**
```js
fetch(`/api/timetable/teacher/${teacher._id}`, { headers: authHeaders() })
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable       | Description                        | Default           |
|----------------|------------------------------------|-------------------|
| PORT           | Server port                        | 5000              |
| MONGODB_URI    | MongoDB Atlas connection string    | (required)        |
| JWT_SECRET     | Secret for signing JWTs            | (required)        |
| JWT_EXPIRES_IN | Token expiry                       | 7d                |
| NODE_ENV       | development / production           | development       |
| FRONTEND_URL   | CORS allowed origin                | http://localhost:3000 |

### Frontend (`frontend/.env`)
| Variable              | Description        | Default                       |
|-----------------------|--------------------|-------------------------------|
| REACT_APP_API_URL     | Backend API base   | http://localhost:5000/api     |
