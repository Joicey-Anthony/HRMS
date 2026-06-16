# 🏥 HRMS — Health Record Management System

A full-stack Health Record Management System with React frontend and Node.js/Express/MongoDB backend.

---

## 🗂 Project Structure

```
hrms/
├── backend/                  ← Node.js + Express + MongoDB
│   ├── config/
│   │   └── db.js             ← MongoDB connection
│   ├── middleware/
│   │   └── auth.js           ← JWT auth + RBAC + audit logger
│   ├── models/
│   │   ├── User.js
│   │   ├── HealthRecord.js
│   │   ├── Appointment.js
│   │   ├── Message.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   ├── appointments.js
│   │   ├── messages.js
│   │   └── audit.js
│   ├── uploads/              ← auto-created on first run
│   ├── .env
│   ├── server.js             ← main entry point
│   ├── seed.js               ← demo data seeder
│   └── package.json
│
└── frontend/                 ← React 18
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   └── App.js            ← entire frontend (single file)
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure these are installed on your machine:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | v16 or above | `node -v` |
| npm | v8 or above | `npm -v` |
| MongoDB | v5 or above | `mongod --version` |

---

## 🚀 Setup — Step by Step

### Step 1 — Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows (if installed as service, it may already be running)
# Start manually:
net start MongoDB

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (cloud — no local install needed)**
1. Go to https://cloud.mongodb.com and create a free cluster
2. Get your connection string, e.g.:
   `mongodb+srv://username:password@cluster.mongodb.net/hrms`
3. Replace `MONGO_URI` in `backend/.env` with your Atlas URI

---

### Step 2 — Setup & Run the Backend

```bash
# 1. Go to the backend folder
cd hrms/backend

# 2. Install dependencies
npm install

# 3. (Optional) Edit .env if needed
# Default .env is already configured for local MongoDB

# 4. Seed the database with demo data
node seed.js

# 5. Start the backend server
npm run dev         # with auto-reload (nodemon)
# OR
npm start           # without auto-reload
```

✅ You should see:
```
✅ MongoDB Connected: localhost
🚀 HRMS Server running on http://localhost:5000
```

---

### Step 3 — Setup & Run the Frontend

Open a **new terminal window**, then:

```bash
# 1. Go to the frontend folder
cd hrms/frontend

# 2. Install dependencies
npm install

# 3. Start the React dev server
npm start
```

✅ Your browser should open automatically at **http://localhost:3000**

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Admin | admin@hrms.com | admin123 |
| 👨‍⚕️ Doctor (Cardiologist) | doctor@hrms.com | doctor123 |
| 👨‍⚕️ Doctor (General) | doctor2@hrms.com | doctor123 |
| 🧑 Patient | patient@hrms.com | patient123 |
| 🧑 Patient 2 | patient2@hrms.com | patient123 |

---

## 🎯 Features by Role

### 👤 Admin
- Dashboard with system-wide stats
- View and manage all users (activate/deactivate)
- Assign doctors to patients
- View all health records (read-only)
- Book appointments on behalf of patients
- Full audit log of all system actions

### 👨‍⚕️ Doctor
- Dashboard with patient overview
- View assigned patients with full profiles
- Create, view, and delete health records
- Manage appointment statuses (confirm/complete/cancel)
- Real-time messaging with patients
- Generate digital prescriptions (saved as records)

### 🧑 Patient
- Personal dashboard with health summary
- View own health records only
- Book appointments with available doctors
- Chat with assigned doctor
- AI Symptom Checker (requires Anthropic API key)
- Emergency SOS with contact management
- Health Analytics with charts

---

## 🔌 API Endpoints Reference

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | All roles |
| PUT | `/api/auth/update-profile` | All roles |

### Users
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/users` | Admin |
| GET | `/api/users/doctors` | All |
| GET | `/api/users/patients` | Doctor, Admin |
| PUT | `/api/users/assign-doctor` | Admin |
| POST | `/api/users/:id/rate` | Patient |
| PUT | `/api/users/:id/toggle-active` | Admin |

### Records
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/records` | All (filtered by role) |
| GET | `/api/records/patient/:id` | Doctor, Admin |
| POST | `/api/records` | Doctor, Admin |
| PUT | `/api/records/:id` | Doctor |
| DELETE | `/api/records/:id` | Doctor, Admin |

### Appointments
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/appointments` | All (filtered) |
| POST | `/api/appointments` | Patient, Admin |
| PUT | `/api/appointments/:id` | Doctor, Admin |
| DELETE | `/api/appointments/:id` | All |

### Messages
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/messages` | All |
| GET | `/api/messages/:userId` | All |
| POST | `/api/messages` | All |

### Audit
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/audit` | Admin only |

---

## 🤖 AI Symptom Checker Setup (Optional)

To enable the AI Symptom Checker:

1. Get your API key from https://console.anthropic.com
2. Open `frontend/src/App.js`
3. Find this line (around line 350):
   ```js
   'x-api-key': 'your-api-key-here',
   ```
4. Replace `your-api-key-here` with your actual key

---

## 🛠 Troubleshooting

**Backend won't start:**
- Make sure MongoDB is running (`mongod`)
- Check `.env` file exists in `backend/`
- Run `npm install` again

**Frontend shows "Could not connect to server":**
- Make sure backend is running on port 5000
- Check for CORS errors in browser console
- Confirm `BASE_URL` in `App.js` is `http://localhost:5000/api`

**Login says "Invalid credentials":**
- Run `node seed.js` again to reset demo users
- Make sure you're using the correct email/password from the table above

**Port already in use:**
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, Inline Styles |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Validation | express-validator |
| File Uploads | Multer |

---

## 📝 Notes for Evaluators

- All RBAC is enforced on the **backend** — role checks exist on every protected route
- Patients can only access their own data; doctors only see assigned patients
- Every significant action is logged in the AuditLog collection
- JWT tokens expire after 7 days
- Passwords are bcrypt-hashed with salt rounds of 12
- Rate limiting: 200 req/15min general, 20 req/15min for auth routes
