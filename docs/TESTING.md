# Travel-Doc — Testing Strategy and Specifications

## 1. Overview
Travel-Doc employs a comprehensive testing strategy across both backend and frontend layers to verify mathematical algorithms (Haversine distance, sequencing), API contract enforcement, database data integrity, and UI state resilience.

---

## 2. Test Execution Commands

### Backend Tests
Run in `Travel-Doc/backend`:
```powershell
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Frontend Tests
Run in `Travel-Doc/frontend`:
```powershell
# Run Vitest unit & component tests
npm test

# Run tests with UI
npm run test:ui
```

---

## 3. Test Suites & Coverage

### 3.1 Backend Test Coverage
1. **Haversine & Routing Heuristics (`backend/tests/services/routePlanner.test.js`)**:
   - Verify straight-line distance accuracy between known coordinates (e.g. New York to London ~5,570 km).
   - Verify that the **farthest** destination from origin is always selected as **Stop #1**.
   - Verify nearest-neighbor ordering for stops 2 through N.
   - Verify behavior when 0 or 1 destination is provided.
   - Verify fallback when external OSRM service fails or returns error codes.
2. **Input Validation (`backend/tests/validators/placesValidator.test.js`)**:
   - Latitude must be between -90 and 90.
   - Longitude must be between -180 and 180.
   - Required fields (name, category, country).
   - Priority enum validation (`High`, `Medium`, `Low`).
3. **Photo Upload Security (`backend/tests/middleware/upload.test.js`)**:
   - Rejection of non-image MIME types (e.g. `.exe`, `.html`, `.pdf`).
   - File size ceiling enforcement (<= 5MB).
   - Verification of UUID-sanitized filenames preventing directory traversal.

### 3.2 Frontend Test Coverage
1. **Component Rendering**:
   - Empty state rendering when wishlist is empty.
   - Badge styling for priorities and visited indicators.
2. **Form Interaction**:
   - Validation warnings on missing place name or coordinates.
   - Debounced search input behavior for geocoding lookup.
3. **Route Planner UI**:
   - Calculation state indicators.
   - Removal and manual reordering of stops.

---

## 4. Test Environment Isolation
- Automated tests mock external network calls (OSRM and Nominatim) to avoid rate limiting and non-deterministic network failures.
- Database tests use isolated test fixtures or test transaction rollbacks to prevent mutating real user records.
