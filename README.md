# 🔨 LinkForge — Craft Short Links. Track Every Click.

A full-stack URL shortener with built-in analytics. Create short links, track clicks in real-time, and view detailed browser/device/OS breakdowns.

## 📁 Project Structure

```
LinkForge/
├── frontend/          ← React + Vite (Lovable AI)
│   ├── src/
│   │   ├── api/       ← API layer (axios, auth, url, analytics)
│   │   ├── components/
│   │   ├── context/   ← AuthContext
│   │   ├── pages/
│   │   └── utils/
│   └── .env
│
├── backend/           ← Node.js + Express + MongoDB
│   ├── controllers/   ← auth, url, analytics, stats, redirect
│   ├── middleware/     ← JWT auth, error handler
│   ├── models/        ← User, URL, Analytics (Mongoose)
│   ├── routes/        ← Express route definitions
│   ├── utils/         ← shortCodeGenerator, parseUserAgent
│   ├── server.js      ← Entry point
│   └── .env           ← Environment variables
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB Atlas** account (or local MongoDB instance)

### 1. Backend Setup

```bash
cd LinkForge/backend

# Install dependencies
npm install

# Configure environment — edit .env with your MongoDB connection string
# MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/linkforge

# Start the dev server
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
🔨 LinkForge server running on http://localhost:5000
📡 Accepting requests from: http://localhost:5173
```

### 2. Frontend Setup

```bash
cd LinkForge/frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

Expected output:
```
Local: http://localhost:5173
```

### 3. Verify Connection

- **Frontend**: http://localhost:5173
- **Backend health check**: http://localhost:5000/api/health

## 🧪 Full Flow Test

1. Navigate to http://localhost:5173
2. Click **Get Started** → `/signup`
3. Register with name, email, password
4. Redirected to `/dashboard` automatically
5. Create a short URL using the form
6. URL card appears in the list
7. Copy the short URL (e.g., `http://localhost:5000/abc123`)
8. Paste it in a new browser tab → redirects to the original URL
9. Go back to dashboard → click **Analytics** on the URL
10. Should show 1 click with browser, device, OS data
11. Test public stats: http://localhost:5173/stats/abc123
12. Logout → try to access `/dashboard` → redirected to `/login`

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | `/api/auth/register`  | Create new account   |
| POST   | `/api/auth/login`     | Login & get JWT      |

### URLs (Protected — requires Bearer token)
| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | `/api/urls`       | Get all user's URLs    |
| POST   | `/api/urls`       | Create a short URL     |
| PATCH  | `/api/urls/:id`   | Edit original URL      |
| DELETE | `/api/urls/:id`   | Delete URL & analytics |

### Analytics (Protected)
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/api/analytics/:urlId`  | Full analytics for a URL |

### Stats (Public)
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/stats/:shortCode`   | Public click stats    |

### Redirect (Public)
| Method | Endpoint          | Description                      |
|--------|--------------------|----------------------------------|
| GET    | `/:shortCode`     | Redirect & log analytics click   |

### Health Check
| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| GET    | `/api/health`  | Server status      |

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Default                   |
|---------------|--------------------------------------|---------------------------|
| `PORT`        | Server port                          | `5000`                    |
| `MONGODB_URI` | MongoDB connection string            | —                         |
| `JWT_SECRET`  | Secret key for JWT signing           | —                         |
| `JWT_EXPIRES_IN` | Token expiry duration             | `7d`                      |
| `CLIENT_URL`  | Frontend origin for CORS             | `http://localhost:5173`   |

### Frontend (`frontend/.env`)

| Variable              | Description          | Default                   |
|----------------------|----------------------|---------------------------|
| `VITE_API_BASE_URL`  | Backend API base URL | `http://localhost:5000`   |
| `VITE_APP_NAME`      | App display name     | `LinkForge`               |

## 🛡️ Security

| Feature | Implementation | Protection Against |
|---|---|---|
| HTTP Security Headers | helmet | Clickjacking, MIME sniffing, XSS |
| Rate Limiting — Login | express-rate-limit (5/15min) | Brute force attacks |
| Rate Limiting — Register | express-rate-limit (10/1hr) | Fake account spam |
| Rate Limiting — General API | express-rate-limit (100/15min) | DDoS attacks |
| NoSQL Injection Prevention | express-mongo-sanitize | MongoDB injection |
| XSS Prevention | xss-clean | Cross-site scripting |
| Account Lockout | Custom (5 attempts / 30min lock) | Targeted attacks |
| Password Hashing | bcryptjs (saltRounds: 12) | Password theft |
| Password Strength | express-validator rules | Weak password attacks |
| JWT Authentication | jsonwebtoken (7d expiry) | Unauthorized access |
| Input Validation | express-validator | Invalid/malicious input |
| User Data Isolation | userId filter on all queries | Data leakage |

## 📄 License

MIT
