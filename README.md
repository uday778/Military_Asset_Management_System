# ⚔ MAMS — Military Asset Management System

> A full-stack web application for tracking military assets (vehicles, weapons, ammunition) across multiple bases — with role-based access control, transfer workflows, audit logging, and a real-time dashboard.

![Tech Stack](https://img.shields.io/badge/Frontend-React_18-61dafb?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB_/_In--Memory-47a248?style=flat-square&logo=mongodb)
![Auth](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Project Structure](#project-structure)
4. [Data Models / Schema](#data-models--schema)
5. [RBAC Explanation](#rbac-explanation)
6. [API Endpoints](#api-endpoints)
7. [Setup Instructions](#setup-instructions)
8. [Login Credentials](#login-credentials)
9. [Deployment](#deployment)
10. [Extra Features Added](#extra-features-added)

---

## ✨ Features

### Core Features (Assignment Requirements)
- **Dashboard** — Live stats, asset distribution charts, base-level breakdown, recent activity feed
- **Asset Inventory** — Full CRUD on assets with filtering by base/type/status/search
- **Purchases** — Record procurement with supplier info, cost tracking, auto-inventory update
- **Transfers** — Request, approve, and reject asset transfers between bases with inventory guard
- **Assignments & Expenditures** — Assign assets to squads/units with return tracking; log ammo/supply expenditures
- **Role-Based Access Control (RBAC)** — Three roles: Admin, Base Commander, Logistics Officer

### Extra Features Added
- **Audit Log** — Every create/update/delete/login is logged with timestamp, actor, and details
- **Net Movement Popup** — Dashboard widget showing total in/out, breakdowns by source
- **JWT Authentication** — Stateless token-based auth with 24-hour expiry
- **Auto Inventory Updates** — Purchases, transfers, assignments, and expenditures automatically adjust inventory
- **Transfer Approval Workflow** — Non-admin transfers go to "Pending" and require Admin approval
- **Asset Return Flow** — Assigned assets can be returned, restoring inventory quantity
- **Cost Tracking** — Purchase page tracks unit cost, total cost per purchase, and grand total spend
- **In-memory Store Fallback** — Works without MongoDB for demo/development environments
- **Military Dark UI Theme** — Custom design with Orbitron + Rajdhani + Share Tech Mono fonts, tactical color palette
- **Responsive Sidebar** — Collapsible navigation with role-color indicators
- **Quick Login Buttons** — One-click login for all 3 demo roles on the login page
- **Charts** — Recharts pie chart (asset distribution) and bar chart (assets by base)

---

## 🛠 Tech Stack & Architecture

```
Frontend (React 18)          Backend (Node.js + Express)        Database
─────────────────────        ──────────────────────────────     ─────────────
React 18 + Hooks             Express 4.x REST API               MongoDB (primary)
React Context (auth)         JWT Authentication                 In-memory store (fallback)
Axios (HTTP client)          bcryptjs (password hashing)
Recharts (charts)            morgan (request logging)
Google Fonts (Orbitron,      cors + body-parser
  Rajdhani, Share Tech Mono) Role-based middleware
```

### Architecture Diagram

```
Browser (React SPA)
        │
        │  HTTP/HTTPS + Bearer Token
        ▼
   Express API Server (port 5000)
        │
        ├── /api/auth       → login, me, users
        ├── /api/assets     → CRUD
        ├── /api/purchases  → record + auto-update inventory
        ├── /api/transfers  → request + approve/reject workflow
        ├── /api/assignments → assign + return + expenditure
        ├── /api/dashboard  → summary stats + net movement
        └── /api/audit      → immutable log (Admin only)
        │
        ▼
  MongoDB Atlas (or in-memory store)
```

---

## 📁 Project Structure

```
military-asset-management/
├── backend/
│   ├── index.js                  ← Express server entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── store.js              ← In-memory data store (fallback)
│   ├── middleware/
│   │   └── auth.js               ← JWT authenticate + authorize middleware
│   └── routes/
│       ├── auth.js               ← Login, /me, user list
│       ├── assets.js             ← Asset CRUD
│       ├── purchases.js          ← Purchase recording
│       ├── transfers.js          ← Transfer workflow
│       ├── assignments.js        ← Assign, return, expenditure
│       ├── dashboard.js          ← Summary + net movement
│       └── audit.js              ← Audit log
│
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── App.js                ← Root layout, sidebar, routing
        ├── App.css               ← Full military dark theme
        ├── index.js
        ├── context/
        │   └── AuthContext.js    ← Global auth state + login/logout
        └── pages/
            ├── Login.js
            ├── Dashboard.js      ← Stats cards + charts + activity feed
            ├── Assets.js         ← Inventory table + CRUD
            ├── Purchases.js      ← Purchase records
            ├── Transfers.js      ← Transfer table + approve/reject
            ├── Assignments.js    ← Assignments + expenditures tabs
            └── AuditLog.js       ← Admin-only audit trail
```

---

## 🗄 Data Models / Schema

### User
| Field    | Type   | Description                              |
|----------|--------|------------------------------------------|
| _id      | string | Unique ID                                |
| username | string | Login username                           |
| password | string | bcrypt-hashed password                   |
| role     | string | `Admin`, `Base Commander`, `Logistics Officer` |
| base     | string | Assigned base (e.g. `Alpha Base`)        |
| name     | string | Full display name                        |

### Asset
| Field    | Type   | Description                              |
|----------|--------|------------------------------------------|
| _id      | string | Unique ID                                |
| name     | string | Asset name (e.g. `M1 Abrams Tank`)       |
| type     | string | `Vehicle`, `Weapon`, `Ammunition`, etc.  |
| base     | string | Current base location                    |
| quantity | number | Current inventory count                  |
| status   | string | `Operational`, `Maintenance`, `Decommissioned` |

### Purchase
| Field        | Type   | Description                        |
|--------------|--------|------------------------------------|
| _id          | string | Unique ID                          |
| assetName    | string | Name of purchased asset            |
| type         | string | Asset type                         |
| base         | string | Destination base                   |
| quantity     | number | Units purchased                    |
| unitCost     | number | Cost per unit ($)                  |
| totalCost    | number | quantity × unitCost                |
| supplier     | string | Supplier name                      |
| purchaseDate | string | ISO date string                    |
| createdBy    | string | Username of recorder               |

### Transfer
| Field        | Type   | Description                              |
|--------------|--------|------------------------------------------|
| _id          | string | Unique ID                                |
| assetName    | string | Asset being transferred                  |
| type         | string | Asset type                               |
| fromBase     | string | Source base                              |
| toBase       | string | Destination base                         |
| quantity     | number | Units transferred                        |
| status       | string | `Pending`, `Completed`, `Rejected`       |
| requestedBy  | string | Username of requester                    |
| approvedBy   | string | Username of approver (null if pending)   |

### Assignment
| Field          | Type   | Description                        |
|----------------|--------|------------------------------------|
| _id            | string | Unique ID                          |
| assetName      | string | Assigned asset                     |
| base           | string | Base of assignment                 |
| assignedTo     | string | Squad or unit name                 |
| quantity       | number | Units assigned                     |
| assignmentDate | string | ISO date                           |
| returnDate     | string | Expected return (nullable)         |
| status         | string | `Active`, `Returned`               |
| purpose        | string | Mission/purpose description        |

### Expenditure
| Field           | Type   | Description                        |
|-----------------|--------|------------------------------------|
| _id             | string | Unique ID                          |
| assetName       | string | Expended asset                     |
| quantity        | number | Units consumed                     |
| purpose         | string | Reason (Training, Combat, etc.)    |
| expenditureDate | string | ISO date                           |
| authorizedBy    | string | Authorizing username               |

### AuditLog
| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| _id         | string | Unique ID                                |
| action      | string | e.g. `PURCHASE`, `TRANSFER_APPROVE`      |
| entity      | string | e.g. `Asset`, `Transfer`                 |
| entityId    | string | ID of the affected record                |
| performedBy | string | Username                                 |
| details     | string | Human-readable description               |
| timestamp   | string | ISO timestamp                            |

---

## 🔐 RBAC Explanation

The system implements **Role-Based Access Control** via JWT middleware (`middleware/auth.js`).

### Roles and Permissions

| Feature              | Admin | Base Commander | Logistics Officer |
|----------------------|-------|----------------|-------------------|
| View all bases       | ✅    | ❌ (own base)  | ❌ (own base)     |
| Create/delete assets | ✅    | ❌             | ❌                |
| Record purchases     | ✅    | ❌             | ✅                |
| Request transfers    | ✅    | ✅             | ✅                |
| Approve transfers    | ✅    | ❌             | ❌                |
| Assign assets        | ✅    | ✅             | ❌                |
| Record expenditures  | ✅    | ✅             | ✅                |
| View audit log       | ✅    | ❌             | ❌                |

### How it works

1. On login, the server signs a JWT containing `{ id, username, role, base }`
2. Every protected API route calls `authenticate` middleware to verify the token
3. Role-restricted routes additionally call `authorize('Admin', ...)` middleware
4. Non-admin users are filtered to their own base on all list endpoints

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint        | Auth | Description       |
|--------|-----------------|------|-------------------|
| POST   | /api/auth/login | ❌   | Login, returns JWT |
| GET    | /api/auth/me    | ✅   | Get current user  |

### Assets
| Method | Endpoint          | Role     | Description            |
|--------|-------------------|----------|------------------------|
| GET    | /api/assets       | Any      | List assets (filtered) |
| POST   | /api/assets       | Admin    | Create asset           |
| PUT    | /api/assets/:id   | Admin    | Update asset           |
| DELETE | /api/assets/:id   | Admin    | Delete asset           |

### Purchases
| Method | Endpoint            | Role              | Description          |
|--------|---------------------|-------------------|----------------------|
| GET    | /api/purchases      | Any               | List purchases       |
| POST   | /api/purchases      | Admin, Logistics  | Record purchase      |

### Transfers
| Method | Endpoint                     | Role   | Description           |
|--------|------------------------------|--------|-----------------------|
| GET    | /api/transfers               | Any    | List transfers        |
| POST   | /api/transfers               | Any    | Request transfer      |
| PATCH  | /api/transfers/:id/approve   | Admin  | Approve transfer      |
| PATCH  | /api/transfers/:id/reject    | Admin  | Reject transfer       |

### Assignments
| Method | Endpoint                       | Role              | Description         |
|--------|--------------------------------|-------------------|---------------------|
| GET    | /api/assignments               | Any               | List all            |
| POST   | /api/assignments/assign        | Admin, Commander  | Assign asset        |
| POST   | /api/assignments/return/:id    | Admin, Commander  | Return asset        |
| POST   | /api/assignments/expenditure   | Any               | Record expenditure  |

### Dashboard
| Method | Endpoint                    | Auth | Description         |
|--------|-----------------------------|------|---------------------|
| GET    | /api/dashboard/summary      | ✅   | Summary stats       |
| GET    | /api/dashboard/net-movement | ✅   | Net movement data   |

### Audit
| Method | Endpoint     | Role  | Description        |
|--------|--------------|-------|--------------------|
| GET    | /api/audit   | Admin | Full audit trail   |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- npm v9+
- MongoDB (optional — app works in-memory without it)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/military-asset-management.git
cd military-asset-management
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if you have a MongoDB URI, otherwise leave defaults
npm run dev       # runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Ensure REACT_APP_API_URL=http://localhost:5000/api
npm start         # runs on http://localhost:3000
```

### 4. Open in browser

Visit `http://localhost:3000` and log in using the credentials below.

---

## 🔑 Login Credentials

| Role             | Username    | Password      | Base        |
|------------------|-------------|---------------|-------------|
| Admin            | admin       | admin123      | HQ          |
| Base Commander   | commander1  | commander123  | Alpha Base  |
| Logistics Officer| logistics1  | logistics123  | Bravo Base  |

---

## ☁ Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Add environment variables:
   - `PORT` = 5000
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random string
   - `NODE_ENV` = production
7. Deploy — copy the live URL (e.g. `https://mams-backend.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://mams-backend.onrender.com/api`
4. Deploy — done!

### MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user and whitelist IP `0.0.0.0/0`
4. Copy connection string and add to Render env as `MONGO_URI`

---

## 🎬 Screen Recording / Video Tips

See [VIDEO_TIPS.md](./VIDEO_TIPS.md) for a complete walkthrough script and recording tips.

---

## 📝 Extra Features Summary

| Feature | Description |
|---------|-------------|
| JWT Auth | Stateless token-based auth with 24h expiry |
| Audit Log | Immutable log of every action in the system |
| Net Movement | Dashboard popup showing asset flow breakdown |
| Transfer Approval | Pending → Approved/Rejected workflow |
| Asset Return | Return assignments restores inventory |
| Cost Tracking | Per-purchase and total spend calculations |
| In-memory Fallback | Works without MongoDB for demos |
| Military Dark UI | Custom tactical theme with Orbitron/Rajdhani fonts |
| Recharts Dashboard | Pie + bar charts for asset visualization |
| Quick Login | One-click demo credential buttons on login page |
#   M i l i t a r y _ A s s e t _ M a n a g e m e n t _ S y s t e m  
 