# Travel-Doc — Backend REST API

Node.js & Express RESTful API server for Travel-Doc, communicating with Microsoft SQL Server, managing multi-stop route sequencing, and processing secure photo uploads.

---

## 1. Tech Stack
- **Runtime**: Node.js v18+ (ES Modules)
- **Framework**: Express.js
- **Database**: Microsoft SQL Server (`mssql` client)
- **File Uploads**: Multer (validated file size & MIME type)
- **Validation**: Express-validator / Zod
- **Logging & Security**: CORS, Helmet, Morgan, Centralized Error Handling

---

## 2. Directory Structure
```
backend/
├── src/
│   ├── config/          # Database, environment, storage config
│   ├── controllers/     # Route handlers (Places, Wishlist, Visits, Photos, Routes)
│   ├── services/        # Business logic (RoutePlanner, Haversine, PhotoStorage)
│   ├── repositories/    # SQL Server data access queries
│   ├── routes/          # Express route definitions under /api/v1
│   ├── middleware/      # Error handler, request logger, multer upload
│   ├── validators/      # Input validation schemas
│   ├── database/        # Connection pool & query helpers
│   ├── utils/           # Response formatter, logger, math
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Unit and integration test suites
├── uploads/             # Safe local media directory (.gitkeep)
├── .env.example
└── package.json
```

---

## 3. Getting Started

### 3.1 Install Dependencies
```powershell
npm install
```

### 3.2 Configure Environment
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Key environment variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Microsoft SQL Server Configuration
DB_SERVER=localhost
DB_DATABASE=TravelDocDB
DB_PORT=1433
DB_USER=
DB_PASSWORD=
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Uploads Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE_BYTES=5242880
```

### 3.3 Start the Server
```powershell
# Development mode with nodemon/watch
npm run dev

# Production mode
npm start
```

### 3.4 Run Tests
```powershell
npm test
```
