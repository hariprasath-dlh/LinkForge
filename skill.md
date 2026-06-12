# LinkForge — Skill.md (AI Reference Document)

---

## Project Identity

- **Project Name:** LinkForge
- **Tagline:** Craft Short Links. Track Every Click
- **Type:** Full-Stack Web Application
- **Purpose:** Hackathon submission for Full Stack Developer role at Katomaran
- **Deadline:** 12 PM, Sunday, June 14th, 2026
- **Credit Line (must appear in README.md):** This project is a part of a hackathon run by https://katomaran.com

---

## Short Description

LinkForge is a full-stack URL Shortener application where authenticated users can create short links for long URLs and track detailed analytics such as click count, creation date, last visited time, and recent visit history. Users can also set custom aliases for their links, generate QR codes, set expiry dates, view daily click trend charts, track browser and device analytics, access public stats pages, and edit destination URLs. The platform ensures each user can only manage their own links and view performance insights through a clean, responsive, and professional dashboard.

---

## AI Model's Role on This Project

- You are the **primary developer** of this project
- You must strictly follow this skill.md file as your **single source of truth**
- Do **not** add any features, pages, components, or functionality that are NOT mentioned in this document
- Do **not** deviate from the tech stack specified below
- Do **not** use any external URL shortening service or third-party shortening API as core logic
- Always write **clean, modular, well-structured** code
- Always follow **proper folder structure** for both frontend and backend
- Every decision must be based on what is written in this document
- If something is not mentioned here, do **not** assume or add it — ask for confirmation first
- UI must be **good-looking, responsive, and professional** at all times
- Always handle **loading states, success states, and error states** properly in the UI
- Always show **form validation messages** on the frontend
- Always perform **backend validation** on all API endpoints
- Passwords must always be **hashed** using bcrypt — never store plain text passwords
- All analytics data must be **stored in the database** — never computed on the fly without DB records
- Use **environment variables** for all configuration (DB URI, JWT secret, PORT, etc.)
- Write a proper **README.md** as described in the Final Output section below

---

## Tech Stack Constraints (Strict — Do Not Change)

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js with Express.js |
| Database | MongoDB with Mongoose ORM |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt |
| API Style | REST APIs only |
| Redirect Handling | Server-side redirect (backend handles short URL redirect) |
| Configuration | Environment variables via .env file |
| QR Code | qrcode.react (frontend) |
| Charts | Recharts (frontend) |
| Device/Browser Detection | ua-parser-js (backend) |
| UI Libraries | Allowed — must be documented in README.md |
| External Shorteners | Strictly NOT allowed as core logic |

---

## Folder Structure (Follow This Exactly)
linkforge/
├── client/ → React Frontend (Vite + Tailwind)
│ ├── src/
│ │ ├── components/ → Reusable UI components
│ │ │ ├── Navbar.jsx
│ │ │ ├── URLCard.jsx
│ │ │ ├── URLForm.jsx
│ │ │ ├── QRCodeModal.jsx
│ │ │ ├── AnalyticsChart.jsx
│ │ │ ├── VisitHistoryTable.jsx
│ │ │ ├── LoadingSpinner.jsx
│ │ │ └── Toast.jsx
│ │ ├── pages/ → Page level components
│ │ │ ├── LandingPage.jsx
│ │ │ ├── LoginPage.jsx
│ │ │ ├── SignupPage.jsx
│ │ │ ├── DashboardPage.jsx
│ │ │ ├── AnalyticsPage.jsx
│ │ │ ├── PublicStatsPage.jsx
│ │ │ └── NotFoundPage.jsx
│ │ ├── context/ → Auth context / global state
│ │ │ └── AuthContext.jsx
│ │ ├── hooks/ → Custom React hooks
│ │ │ ├── useAuth.js
│ │ │ └── useURLs.js
│ │ ├── utils/ → Helper functions
│ │ │ ├── validateURL.js
│ │ │ └── formatDate.js
│ │ ├── api/ → Axios API call functions
│ │ │ ├── auth.api.js
│ │ │ ├── url.api.js
│ │ │ └── analytics.api.js
│ │ └── App.jsx → Main app with routing
│ ├── .env → Frontend environment variables
│ └── .env.example → Frontend env template
├── server/ → Node.js + Express Backend
│ ├── controllers/ → Route handler logic
│ │ ├── auth.controller.js
│ │ ├── url.controller.js
│ │ ├── analytics.controller.js
│ │ └── redirect.controller.js
│ ├── models/ → Mongoose models
│ │ ├── User.model.js
│ │ ├── URL.model.js
│ │ └── Analytics.model.js
│ ├── routes/ → Express route definitions
│ │ ├── auth.routes.js
│ │ ├── url.routes.js
│ │ ├── analytics.routes.js
│ │ └── redirect.routes.js
│ ├── middleware/ → Auth middleware and error handlers
│ │ ├── auth.middleware.js
│ │ └── error.middleware.js
│ ├── utils/ → Helper functions
│ │ ├── shortCodeGenerator.js
│ │ └── parseUserAgent.js
│ ├── .env → Backend environment variables
│ ├── .env.example → Backend env template
│ └── server.js → Entry point
├── README.md → Full project documentation
└── skill.md → This AI reference document

text


---

## Database Models (Follow This Exactly)

### 1. User Model
id
name
email (unique)
password (hashed with bcrypt — never plain text)
createdAt
text


### 2. URL Model
id
originalUrl
shortCode (unique, self-generated 6 character alphanumeric)
customAlias (optional — user defined alias)
userId (reference to User — for ownership)
totalClicks (number, default 0)
expiryDate (optional — link auto expires after this date)
isActive (boolean, default true)
createdAt
updatedAt
text


### 3. Analytics Model (Visit Log)
id
urlId (reference to URL model)
visitedAt (timestamp of each visit)
ipAddress (visitor IP address)
userAgent (raw userAgent string)
browser (parsed browser name — from ua-parser-js)
device (parsed device type — from ua-parser-js)
os (parsed operating system — from ua-parser-js)
text


---

## API Endpoints (Follow This Exactly)

### Auth Routes — /api/auth
POST /api/auth/register → Validate inputs → Hash password → Save user → Return JWT
POST /api/auth/login → Validate inputs → Check email → Compare password → Return JWT

text


### URL Routes — /api/urls (Protected — JWT Required)
GET /api/urls → Get all URLs belonging to logged-in user only
POST /api/urls → Validate URL → Generate unique shortCode → Save → Return URL
DELETE /api/urls/:id → Delete URL + delete all its associated analytics records
PATCH /api/urls/:id → Edit original destination URL (update originalUrl field)

text


### Analytics Routes — /api/analytics (Protected — JWT Required)
GET /api/analytics/:urlId → Get total clicks, last visited time, recent visit history, daily click trend data, browser breakdown, device breakdown

text


### Public Stats Route — /api/stats (Public — No Auth Required)
GET /api/stats/:shortCode → Return basic public stats for a short URL (total clicks, created date, last visited)

text


### Redirect Route — (Public — No Auth Required)
GET /:shortCode →

Find URL by shortCode or customAlias in DB
Check if URL exists → if not return 404
Check if expiryDate has passed → if expired return 410 Gone
Log visit to Analytics model (visitedAt, ipAddress, userAgent, browser, device, os)
Increment totalClicks on URL model by 1
Server-side redirect (302) to originalUrl
text


---

## Mandatory Features (Build All — No Exceptions)

### 1. Authentication
- User Signup with name, email, password
- User Login with email, password
- JWT based authentication — token stored in localStorage
- Protected dashboard routes — redirect to login if not authenticated
- Each user can only view and manage their own shortened URLs
- Proper error messages for wrong credentials
- Proper success messages on register and login

### 2. URL Shortening
- User submits a long URL and receives a unique short URL
- Short code must be self-generated (6 character alphanumeric — do not use external services)
- Short code must be unique — check DB before saving, regenerate if collision found
- Validate that input is a proper URL format before shortening (frontend + backend both)
- Clicking the short URL must trigger a server-side redirect to the original URL
- Show proper validation error if URL format is invalid

### 3. User Dashboard
- View all short URLs created by the logged-in user
- Each URL entry must show:
  - Original URL (truncated if too long)
  - Short URL (fully clickable and opens in new tab)
  - Created date (formatted nicely)
  - Total clicks count
- Copy short URL to clipboard directly from UI (copy button with success feedback)
- Delete a shortened URL (with confirmation prompt)
- Empty state shown when user has no URLs yet

### 4. Analytics
- Increment click count on every visit to a short URL
- Record full visit details in Analytics model on every redirect
- Analytics detail page for each short URL showing:
  - Total click count
  - Last visited time
  - Recent visit history (list of visits with timestamps)
  - Daily click trend chart (Recharts bar or line chart)
  - Browser breakdown (which browsers visited)
  - Device breakdown (mobile vs desktop vs tablet)

### 5. UI Requirements
- Fully responsive design — works on mobile, tablet, and desktop
- Clean and professional dashboard layout
- Proper loading states — spinner or skeleton loader on every async operation
- Proper success states — toast notifications on success
- Proper error states — toast notifications or inline error messages on failure
- Form validation messages shown clearly to user
- Good looking landing page with project name, tagline, and call to action

---

## Bonus Features (Build All Recommended Ones)

### ✅ MUST BUILD Bonus Features

#### 1. Custom Alias for Short URL
- Add optional custom alias input field in URL creation form
- Backend checks if alias already exists in DB
- If alias is available → use it as the shortCode
- If alias is already taken → return clear error message to user
- Alias must be alphanumeric and URL safe
- Example: linkforge.com/my-brand

#### 2. QR Code Generation
- Generate a QR code for every short URL
- Use qrcode.react library on the frontend — zero backend work needed
- Show QR code in a modal popup when user clicks QR icon on dashboard
- Allow user to download QR code as PNG image
- QR code must encode the full short URL

#### 3. Daily Click Trend Charts
- Use Recharts library on frontend
- Backend groups analytics records by date and returns click counts per day
- Show bar chart or line chart on the analytics detail page
- Chart must show last 7 days or last 30 days of click data
- Chart must be responsive and good looking

#### 4. Deployment with Live Demo
- Frontend deployed on Vercel
- Backend deployed on Render or Railway
- Database on MongoDB Atlas free tier
- Live demo URL must be included in README.md
- All environment variables must be set correctly in deployment platforms
- End to end test must pass on live deployment before submission

### ✅ SHOULD BUILD Bonus Features

#### 5. Expiry Date for Links
- Add optional expiry date picker input in URL creation form
- Backend checks expiry date before redirecting
- If link is expired → return 410 Gone response with clear message
- Show "Expired" badge on dashboard for expired links
- Expired links cannot be visited but can still be deleted by owner

#### 6. Device and Browser Analytics
- On every redirect, parse the userAgent string using ua-parser-js on backend
- Extract and store browser name, device type, and OS in Analytics model
- Show browser breakdown and device breakdown on analytics detail page
- Display as pie chart or bar chart using Recharts
- Do NOT implement geolocation — skip that part only

#### 7. Public Stats Page
- Create a public shareable stats page at route /stats/:shortCode
- No login required to view this page
- Show basic stats: total clicks, created date, last visited time
- User can share this link with anyone to show their link performance
- Backend has a public API endpoint for this — no auth middleware on this route

#### 8. Edit Destination URL
- Add edit button on each URL card in dashboard
- Opens an inline edit form or modal with current URL pre-filled
- User can change the original destination URL
- Backend PATCH endpoint updates only the originalUrl field
- Short code and alias remain the same after editing
- Show success toast after successful edit

### ❌ DO NOT BUILD
- Bulk URL shortening via CSV — too complex, skip entirely
- Geolocation tracking — skip, too complex for hackathon timeline

---

## Important Necessary Features (Must Not Be Missed)

- ✅ Passwords must be hashed with bcrypt — never store or log plain text passwords
- ✅ JWT must be used for all protected routes — verify token in auth middleware
- ✅ Token must be stored in localStorage on frontend after login
- ✅ All protected API routes must check JWT token before processing request
- ✅ Short code generator must produce unique 6 character alphanumeric codes
- ✅ Short code generator must check DB for collisions and regenerate if needed
- ✅ Server-side redirect must log the visit to Analytics model BEFORE redirecting
- ✅ Server-side redirect must increment totalClicks on URL model BEFORE redirecting
- ✅ Backend must validate all inputs on every endpoint — use express-validator or manual checks
- ✅ Frontend must validate URL format before sending to backend
- ✅ All sensitive config must be in .env files — never hardcode secrets in code
- ✅ Analytics data must be stored in the database — not just in memory
- ✅ Each user must only see their own URLs — enforce userId filter on all URL queries
- ✅ Delete URL must also delete all associated Analytics records for that URL
- ✅ Copy to clipboard button must show visual feedback after copying
- ✅ Custom alias must be checked for uniqueness before saving
- ✅ Expiry date must be checked on every redirect — not just on creation
- ✅ QR code must encode the full short URL including domain
- ✅ Charts must use real data from backend — not dummy or hardcoded data
- ✅ Public stats page must work without authentication
- ✅ UI must be good-looking — evaluators explicitly value this highly
- ✅ Loading, success, and error states must be handled on every async operation
- ✅ Form validation messages must be shown clearly to the user
- ✅ App must be fully responsive on mobile, tablet, and desktop
- ✅ Landing page must clearly show project name LinkForge and tagline

---

## Pages and Routes Summary

| Page | Route | Auth Required | Description |
|---|---|---|---|
| Landing Page | / | No | Hero, tagline, CTA buttons |
| Signup Page | /signup | No | Register new user |
| Login Page | /login | No | Login existing user |
| Dashboard | /dashboard | Yes | View and manage all short URLs |
| Analytics Page | /analytics/:id | Yes | Detailed analytics for one URL |
| Public Stats Page | /stats/:shortCode | No | Public shareable stats page |
| 404 Page | * | No | Not found fallback page |

---

## UI Components Summary

| Component | Purpose |
|---|---|
| Navbar | Top navigation — shows login/logout based on auth state |
| URLCard | Displays each short URL with copy, delete, edit, QR, analytics buttons |
| URLForm | Input form for creating new short URL with alias and expiry options |
| QRCodeModal | Modal popup showing QR code with download option |
| AnalyticsChart | Recharts bar/line chart for daily click trends |
| BrowserChart | Recharts pie chart for browser breakdown |
| DeviceChart | Recharts pie chart for device breakdown |
| VisitHistoryTable | Table showing recent visits with timestamps |
| LoadingSpinner | Spinner shown during async operations |
| Toast | Success, error, info notification toasts |
| ProtectedRoute | Wrapper component to guard authenticated routes |
| AuthContext | Global auth state — user info, token, login, logout functions |

---

## Environment Variables

### Backend .env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

text


### Frontend .env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=LinkForge

text


---

## Final Output of This Project

### 1. Working Application
- Fully functional React frontend (Vite + Tailwind + Recharts + qrcode.react)
- Fully functional Node.js backend (Express + MongoDB + Mongoose)
- All mandatory features working end to end
- All recommended bonus features working end to end
- Live deployment with accessible demo URL

### 2. README.md (Must Include All of These)
- Project name LinkForge and tagline
- Short description of the project
- Live demo URL
- Tech stack used with versions
- Architecture diagram (text based or image)
- Setup instructions for running frontend and backend locally
- List of all environment variables needed
- Full list of features implemented (mandatory + bonus)
- Assumptions made during development
- AI planning document summary
- List of all UI libraries used with documentation links
- Sample screenshots of the application
- Loom or YouTube video link demonstrating the full app (MANDATORY — submission not reviewed without this)
- Line at the very bottom: "This project is a part of a hackathon run by https://katomaran.com"

### 3. GitHub Repository
- Clean and meaningful commit history
- Proper folder structure as defined in this document
- .env.example files included for both client and server
- Actual .env files must NOT be committed to GitHub
- Submitted via Google Form before 12 PM Sunday June 14th 2026

---

## What AI Must NOT Do

- ❌ Do not use any external URL shortening API or service as core logic
- ❌ Do not add features not listed in this document without confirmation
- ❌ Do not change the tech stack without confirmation
- ❌ Do not store plain text passwords ever
- ❌ Do not hardcode secrets, DB URIs, or API keys in source code
- ❌ Do not skip backend validation on any endpoint
- ❌ Do not skip loading, error, or success states in the UI
- ❌ Do not deviate from the folder structure defined above
- ❌ Do not implement geolocation tracking
- ❌ Do not implement bulk CSV upload
- ❌ Do not build without referring to this document first
- ❌ Do not show other users URLs to the logged-in user

---

## Quick Reference Checklist for AI

### Mandatory Features
- [ ] Auth — Signup, Login, JWT, Protected Routes, User Isolation
- [ ] URL Shortening — Submit, Unique Code, Validate, Server-side Redirect
- [ ] Dashboard — List URLs, Show details, Delete, Copy to Clipboard
- [ ] Analytics — Click count, Timestamps, Visit history, Detail page
- [ ] UI — Responsive, Loading states, Success states, Error states, Validation messages

### Bonus Features
- [ ] Custom Alias — Optional alias input, uniqueness check, use as shortCode
- [ ] QR Code — qrcode.react, modal popup, download as PNG
- [ ] Daily Click Charts — Recharts, grouped by date, last 7 or 30 days
- [ ] Deployment — Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas
- [ ] Expiry Date — Date picker, 410 response, expired badge on dashboard
- [ ] Device and Browser Analytics — ua-parser-js, pie charts, stored in DB
- [ ] Public Stats Page — No auth, shareable URL, basic stats shown
- [ ] Edit Destination URL — Edit button, PATCH API, success toast

### Documentation
- [ ] README.md — All required sections complete
- [ ] .env.example — Included for both client and server folders
- [ ] Architecture diagram — Included in README.md
- [ ] Video link — Loom or YouTube link added to README.md
- [ ] katomaran.com credit line — Added at very bottom of README.md
- [ ] GitHub repo submitted via Google Form before deadline

---

*This document is the single source of truth for building LinkForge.
AI models must read and refer to this entire document before writing any code.
Do not deviate. Do not assume. Follow exactly what is written here.*