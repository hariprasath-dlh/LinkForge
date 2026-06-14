# 🚀 LinkForge

### Craft Short Links. Track Every Click.

LinkForge is a modern full-stack URL Shortener and Analytics Platform that enables users to create powerful shortened URLs, manage links through a secure dashboard, generate QR codes, customize aliases, track visitor activity, and analyze link performance through detailed analytics.

Built with a production-oriented architecture using React, TypeScript, Express.js, MongoDB Atlas, JWT Authentication, and advanced security middleware, LinkForge provides a complete URL management ecosystem designed for scalability, usability, and security.

---

## 🌐 Live Demo

**Frontend (Vercel):**
https://linkforge-three.vercel.app

**Backend (Render):**
https://linkforge-fymw.onrender.com

**GitHub Repository:**
https://github.com/hariprasath-dlh/LinkForge

**Project Demonstration Video (Loom):**
https://www.loom.com/share/2f2132d6696b4270920569ad764fcbc5

---

# 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Why LinkForge?](#-why-linkforge)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Solution Architecture](#-solution-architecture)
- [Security Approach](#-security-approach)
- [API Documentation](#-api-documentation)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Running the Project Locally](#-running-the-project-locally)
- [Deployment Guide](#-deployment-guide)
- [Application Walkthrough](#-application-walkthrough)
- [Sample Outputs](#-sample-outputs)
- [Assumptions Made](#-assumptions-made)
- [AI Planning Document](#-ai-planning-document)
- [Future Enhancements](#-future-enhancements)
- [Project Links](#-project-links)
- [Acknowledgements](#-acknowledgements)
- [Hackathon Submission Note](#-hackathon-submission-note)

---

# 📖 Overview

LinkForge is a comprehensive URL management and analytics platform developed to simplify the process of shortening, managing, and analyzing web links.

The platform enables authenticated users to create short URLs from long links, customize aliases, generate QR codes, track engagement metrics, and analyze visitor behavior using a centralized dashboard.

Unlike traditional URL shorteners that only provide redirection capabilities, LinkForge combines URL shortening, analytics, security, and performance insights into a single integrated platform.

---

# 🎯 Problem Statement

Managing long URLs is inconvenient for sharing, branding, and tracking user engagement.

Organizations, content creators, marketers, and businesses often require:

- Short and memorable URLs
- Visitor analytics
- Device and browser insights
- QR code generation
- Click tracking
- Secure user-specific dashboards

Most free URL shorteners provide only basic shortening functionality and limited analytics.

LinkForge solves this problem by providing a complete URL management ecosystem that combines shortening, tracking, analytics, security, and visualization into a single platform.

---

# 💡 Why LinkForge?

LinkForge was designed to provide more than simple URL shortening.

The platform focuses on:

- Security
- Analytics
- User Experience
- Performance
- Scalability
- Production-ready Architecture

Users gain complete control over their links while receiving meaningful insights regarding how those links are being used.

---

# ✨ Key Features

## Authentication & Security

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Password Hashing using bcrypt
- Email OTP Verification
- Session Security

---

## URL Shortening Engine

- Create Short URLs
- Unique Short Code Generation
- Custom Alias Support
- URL Validation
- URL Expiration
- Edit Destination URL
- Delete URL

---

## Dashboard Management

- View All URLs
- Manage Personal URLs
- Copy URL with One Click
- Delete URLs
- Edit URLs
- Track Performance

---

## Analytics Dashboard

- Total Click Count
- Recent Visit History
- Last Visited Timestamp
- Device Analytics
- Browser Analytics
- Operating System Analytics
- Daily Click Trends
- Visual Charts using Recharts

---

## Public Statistics

- Public Statistics Page
- Shareable Analytics
- Click Monitoring

---

## QR Code Generation

Each shortened URL automatically supports:

- QR Code Generation
- Easy Mobile Sharing
- Downloadable QR Codes

---

## Bulk URL Processing

- CSV Upload Support
- Bulk URL Shortening
- Batch Processing

---

## Responsive Design

- Mobile Responsive
- Tablet Responsive
- Desktop Responsive
- Dark Modern UI

---

# 🏗️ System Architecture

## Architecture Diagram

> 📌 Insert System Architecture Diagram Here

```text
[ React Frontend ]
          │
          ▼
[ Express REST API ]
          │
          ▼
[ Authentication Layer ]
          │
          ▼
[ MongoDB Atlas ]
          │
          ▼
[ Analytics Engine ]
          │
          ▼
[ Dashboard & Reports ]
```

---

# 📁 Project Structure

```text
LinkForge/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── main.tsx
│   │   └── router.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── components.json
│
├── README.md
└── .gitignore
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|------------|----------|
| React 19 | UI Development |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Radix UI | UI Components |
| React Query | Data Fetching |
| React Hook Form | Forms |
| Zod | Validation |
| Recharts | Charts |
| QRCode React | QR Generation |

---

## Backend

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | REST API |
| JWT | Authentication |
| bcryptjs | Password Security |
| Nodemailer | Email Delivery |
| dotenv | Environment Variables |

---

## Database

| Technology | Purpose |
|------------|----------|
| MongoDB Atlas | Cloud Database |
| Mongoose | ODM |

---

## Deployment

| Platform | Purpose |
|-----------|----------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |

---

# ⚙️ Solution Architecture

## Authentication Workflow

1. User Registers
2. Password gets Hashed
3. OTP Generated
4. OTP Sent via Email
5. OTP Verified
6. JWT Generated
7. Dashboard Access Granted

---

## URL Creation Workflow

1. User submits URL
2. URL validation occurs
3. Unique code generated
4. Record stored in MongoDB
5. Short URL returned

---

## Analytics Tracking Workflow

1. Visitor clicks short URL
2. Request hits backend
3. Visitor details collected
4. Device detected
5. Browser detected
6. Analytics stored
7. Dashboard updated

---

## Redirection Workflow

1. User visits short URL
2. Short code resolved
3. Analytics recorded
4. Redirect executed

---

# 🔒 Security Approach

Security is one of the strongest pillars of LinkForge.

## Password Protection

- bcrypt Hashing
- Salted Password Storage
- Plain Text Passwords Never Stored

---

## JWT Authentication

- Secure Access Tokens
- Protected Dashboard Routes
- Stateless Authentication

---

## OTP Verification

- Email-based OTP Verification
- Signup Verification
- Login Verification
- OTP Expiration

---

## Rate Limiting

Implemented using:

- express-rate-limit

Benefits:

- Prevents brute force attacks
- Prevents API abuse
- Protects server resources

---

## XSS Protection

Implemented using:

- xss-clean

Benefits:

- Removes malicious scripts
- Protects frontend users

---

## NoSQL Injection Prevention

Implemented using:

- express-mongo-sanitize

Benefits:

- Prevents MongoDB operator injection

---

## Helmet Security

Implemented using:

- helmet

Benefits:

- Secure HTTP Headers
- Clickjacking Prevention
- MIME Sniffing Protection

---

## CORS Protection

Strict CORS policies ensure:

- Only trusted origins can access APIs
- Unauthorized frontend applications cannot use backend resources

---

# 📡 API Documentation

## Authentication APIs

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/verify-signup-otp |
| POST | /api/auth/verify-login-otp |
| POST | /api/auth/resend-otp |

---

## URL APIs

| Method | Endpoint |
|----------|----------|
| POST | /api/url |
| GET | /api/url |
| PUT | /api/url/:id |
| DELETE | /api/url/:id |

---

## Analytics APIs

| Method | Endpoint |
|----------|----------|
| GET | /api/analytics/:urlId |

---

## Public APIs

| Method | Endpoint |
|----------|----------|
| GET | /api/stats/:shortCode |
| GET | /:shortCode |

---

# 📥 Installation Guide

## Method 1 - Download ZIP

1. Open GitHub Repository
2. Click Code
3. Click Download ZIP
4. Extract ZIP File
5. Open Project in VS Code

---

## Method 2 - Clone Repository

```bash
git clone https://github.com/hariprasath-dlh/LinkForge.git

cd LinkForge
```

---

# 🌍 Environment Variables

Backend:

```env
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
BREVO_SMTP_LOGIN=
BREVO_SMTP_KEY=
BREVO_FROM_EMAIL=
```

Frontend:

```env
VITE_API_BASE_URL=
VITE_APP_NAME=LinkForge
```

---

# ▶️ Running the Project Locally

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Expected Output:

```bash
MongoDB Connected
Server Running On Port 5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Expected Output:

```bash
Local: http://localhost:5173
```

---

# 🚀 Deployment Guide

## Frontend Deployment

Platform:

- Vercel

Build Command:

```bash
npm run build
```

---

## Backend Deployment

Platform:

- Render

Start Command:

```bash
node server.js
```

---

# 🖥️ Application Walkthrough

### User Registration

- Create Account
- Verify Email OTP
- Login Securely

### User Login

- Email Authentication
- OTP Verification
- JWT Session Creation

### Create Short URL

- Paste Long URL
- Optional Alias
- Generate Short URL

### Track Analytics

- View Dashboard
- Monitor Clicks
- Analyze Traffic

### Generate QR Code

- Create QR Code
- Download & Share

---

# 📊 Sample Outputs

## Dashboard Screenshots

> Insert Dashboard Screenshot Here

## Analytics Screenshots

> Insert Analytics Screenshot Here

## Database Records

> Insert MongoDB Document Screenshot Here

## Application Logs

> Insert Backend Logs Screenshot Here

---

# 📌 Assumptions Made

- Every user manages only their own URLs.
- Analytics are stored in MongoDB.
- URL redirects are handled server-side.
- Users have valid email addresses.
- MongoDB Atlas is available during deployment.

---

# 🤖 AI Planning Document

## Planning Phase

- Requirement Analysis
- Feature Breakdown
- Architecture Design
- Database Planning

## Feature Design

- Authentication Module
- URL Management Module
- Analytics Module
- Dashboard Module

## Database Design

Collections:

- Users
- URLs
- Analytics

## API Design

RESTful APIs designed for:

- Authentication
- URL Management
- Analytics
- Statistics

## Frontend Design

Focus Areas:

- Responsive UI
- Accessibility
- User Experience
- Performance

---

# 🔮 Future Enhancements

- Team Workspaces
- Link Collaboration
- Advanced Geo Analytics
- AI Powered Link Recommendations
- Custom Domains
- Scheduled Link Activation
- Link Health Monitoring
- Real-time Analytics

---

# 🔗 Project Links

**GitHub Repository**

https://github.com/hariprasath-dlh/LinkForge

**Frontend Deployment**

https://linkforge-three.vercel.app

**Backend Deployment**

https://linkforge-fymw.onrender.com

**Loom Demonstration**

https://www.loom.com/share/2f2132d6696b4270920569ad764fcbc5

---

# 🙏 Acknowledgements

This project was developed using modern software engineering practices and AI-assisted development workflows.

Special thanks to:

- React Community
- Express Community
- MongoDB Team
- Vercel
- Render
- Open Source Contributors

---

# 📝 Hackathon Submission Note

This project was developed as part of a Full Stack Engineering Hackathon focused on practical software engineering skills including:

- Authentication
- URL Management
- Analytics
- API Development
- Database Design
- Frontend Engineering
- Deployment
- Security

All code, architecture decisions, implementation details, and AI-assisted workflows are fully understood and can be explained during technical interviews and project demonstrations.

---

### This project is a part of a hackathon run by https://katomaran.com
