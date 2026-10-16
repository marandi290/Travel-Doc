# Travel-Doc — Development Log

## Session 1: 2026-10-16 — Milestone 0 (Planning & Workspace Setup)

### 1. Goals & Objectives
- Inspect host environment (Windows 10 Pro, Node.js v22.23.2, npm 10.9.8, SQL Server 2025).
- Establish project directory structure per specifications (`Travel-Doc/frontend`, `Travel-Doc/backend`, `Travel-Doc/database`, `Travel-Doc/docs`, `Travel-Doc/scripts`).
- Author core project documentation, architecture, requirements, schema, and implementation plan.
- Initialize root configuration, `.gitignore`, `.editorconfig`, `LICENSE`, `CONTRIBUTING.md`.

### 2. Environment Verification
- **Host OS**: Windows 10 Pro (Build 26200).
- **Node.js**: v22.23.2.
- **npm**: 10.9.8.
- **Database Engine**: Microsoft SQL Server 2025 Standard Developer Edition (X64, v17.0.1000.7).
- **Service Status**: `MSSQLSERVER` running. Trusted connection tested and verified via `sqlcmd -S localhost -E -C`.

---

## Session 2: 2026-10-16 — Milestones 1 through 8 (Full Stack Implementation & Verification)

### 1. Database Implementation & Troubleshooting
- Executed `database/schema.sql` and `database/seed.sql` on local SQL Server 2025 instance.
- **Bug Encountered (Msg 1934)**: Filtered index `UQ_Wishlist_Active_Place` failed when executing `INSERT` statements because `QUOTED_IDENTIFIER` and `ANSI_NULLS` were not set to `ON`.
  - *Fix*: Added `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO` at the top and after each `USE TravelDocDB` statement in `schema.sql` and `seed.sql`.
- **Bug Encountered (Msg 1785)**: Foreign key `FK_Photos_Visits` reported multiple cascade paths between `Places` and `Photos`.
  - *Fix*: Modified `FK_Photos_Visits` to `ON DELETE NO ACTION` while keeping `FK_Photos_Places` as `ON DELETE CASCADE`.
- Verified table creation and seed data: `Places` (6 rows), `WishlistItems` (3 rows), `Visits` (3 rows), `Photos` (0 rows).

### 2. Backend & Database Connectivity Architecture
- Discovered that SQL Server Developer Edition had TCP/IP disabled and was listening via Shared Memory.
- Configured dual-mode connectivity in `backend/src/config/database.js`:
  - Utilized `msnodesqlv8` native driver with connection string `Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=TravelDocDB;Trusted_Connection=yes;TrustServerCertificate=yes;` for Windows Integrated Security.
  - Seamless fallback to Tedious client when `DB_USER` and `DB_PASSWORD` are specified.
- Built layered architecture:
  - Repositories: `placesRepository.js`, `wishlistRepository.js`, `visitsRepository.js`, `photosRepository.js`.
  - Services: `placesService.js`, `wishlistService.js`, `visitsService.js`, `photosService.js`, `routePlannerService.js`.
  - Controllers: `placesController.js`, `wishlistController.js`, `visitsController.js`, `photosController.js`, `routesController.js`, `dashboardController.js`.
  - Routes: mounted under `/api/v1` with `/health` diagnostic endpoint.
- Implemented Multer middleware for secure photo uploads with MIME inspection (`image/jpeg`, `image/png`, `image/webp`), UUID filenames, and 5MB ceiling.
- Tested and verified HTTP endpoints:
  - `GET /api/v1/health`: 200 OK, database connected.
  - `GET /api/v1/dashboard/summary`: 200 OK, returned aggregate stats and destinations.
  - `POST /api/v1/wishlist`: 201 Created for new place; verified 409 Conflict rejection for duplicate active wishlist entry.
  - `POST /api/v1/routes/plan`: verified that **Machu Picchu** (farthest destination ~5992 km from NYC) was correctly designated as **Stop #1 (sequence: 1, isFarthestFirstStop: true)**.

### 3. Frontend Foundation & Page Views
- Built React 18 SPA with Vite, Tailwind CSS with custom nature palette (`forest`, `earth`, `terracotta`), React Router v6, Axios, Leaflet, and React Icons.
- Components built:
  - Reusable: `Button`, `Badge`, `Card`, `Input`, `Modal`, `EmptyState`, `LoadingSpinner`, `Toast`/`NotificationProvider`.
  - Layout: `Sidebar`, `Header`, `AppLayout` with responsive mobile drawer.
  - Map: `LeafletMap`, `CustomMarkers` using `L.divIcon` for SVG pins, legend, auto-fit bounds, GPS radar pin.
  - Places: `WishlistCard`, `AddPlaceModal` (with live Nominatim geocoding autocomplete), `LogVisitModal`.
  - Route: `RoutePlanner` view with reordering, stop deletion, distance metrics.
  - Gallery: `PhotoUploadModal`, `LightboxModal` with caption editing and delete confirmation.
- 8 Pages built: `Dashboard`, `Wishlist`, `MapExplorer`, `RoutePlanner`, `TravelHistory`, `TravelGallery`, `PlaceDetails`, `Settings`.
- Compiled with Vite: `npm run build` succeeded with 0 errors.

### 4. Automated Testing
- **Backend**: Executed `npm test` using Node.js built-in test runner. All 8 tests passed (Haversine calculations, farthest-first sequencing, health API, 404 handler, input validation).
- **Frontend**: Executed `npm test` with Vitest. All unit tests passed (Haversine formula, stop ordering).

### 5. Current Release State
- Application is fully functional across frontend, backend, and database on Windows with verified setup instructions.
