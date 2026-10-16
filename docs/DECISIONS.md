# Travel-Doc — Architecture Decision Records (ADR)

## ADR-001: Farthest-Destination-First Routing Heuristic
- **Status**: Accepted
- **Context**: The product specification mandates that the route planner must set the farthest wishlisted destination from the current location as the first stop, followed by a practical visiting order for the remaining stops.
- **Decision**: Calculate straight-line Haversine distance from the user's current GPS origin to all candidate destinations. Select the maximum distance as Stop 1. From Stop 1, apply a greedy Nearest Neighbor heuristic to determine the sequence for remaining destinations. Query OSRM with this ordered waypoint array.
- **Trade-offs**: This produces an ambitious "journey outward, explore inward" itinerary rather than a strictly minimal-cost Traveling Salesperson Problem (TSP) loop. We clearly document and communicate this trade-off in the UI and documentation.

---

## ADR-002: Decoupled Entity Model for Places and Visits
- **Status**: Accepted
- **Context**: Users may visit a destination multiple times across their life, or mark places as visited without having added them to a wishlist initially.
- **Decision**: Separate `Places` from `Visits` and `WishlistItems`.
  - `Places`: Geocoded real-world identity (name, coords, country).
  - `WishlistItems`: Specific user desire (`Pending` / `Visited` / `Archived`) linked to a `PlaceId`.
  - `Visits`: Log of distinct visits with dates, notes, and 1-5 star ratings.
- **Consequences**: Enables repeat visits to the same city/monument without clobbering historical logs.

---

## ADR-003: Microsoft SQL Server with Layered Architecture
- **Status**: Accepted
- **Context**: The system requires a relational database with strict constraints, foreign keys, and reliable transaction support.
- **Decision**: Utilize Microsoft SQL Server 2025 via the `mssql` client driver. Encapsulate database interactions in Repositories (`PlacesRepository`, `WishlistRepository`, `VisitsRepository`, `PhotosRepository`) rather than executing raw queries in Express route handlers.
- **Consequences**: Clean separation of database queries from HTTP handling, parameterized queries for SQL injection protection, and easy unit test mocking.

---

## ADR-004: Multer for Local Uploads with Cloud Storage Ready Abstraction
- **Status**: Accepted
- **Context**: Photos need to be uploaded and stored securely during development, with an easy path to AWS S3 or Azure Blob Storage in production.
- **Decision**: Implement `PhotoStorageService` using Multer for local disk storage in `backend/uploads/` with UUID-based filenames and MIME validation. The database stores relative `StorageKey` references rather than absolute local filesystem paths.
- **Consequences**: Prevents exposing host paths to clients; allows dropping in an S3/Azure adapter by simply swapping `PhotoStorageService` implementation.

---

## ADR-005: Leaflet & OpenStreetMap over Proprietary Map SDKs
- **Status**: Accepted
- **Context**: The application requires interactive map display, custom markers, polyline routing, and bounds fitting without requiring paid Google Maps or Mapbox API keys.
- **Decision**: Use Leaflet with React-Leaflet and OpenStreetMap tiles. Combine with Nominatim for geocoding and OSRM for road geometry.
- **Consequences**: Zero proprietary API costs for development and open-source usage. Respects fair-use rate limits via client-side debouncing and graceful fallbacks.

---

## ADR-006: Dual-Mode Database Connectivity (Windows Auth & SQL Auth)
- **Status**: Accepted
- **Context**: Developers on Windows environments often run SQL Server with Windows Authentication (NTLM/Kerberos), whereas containerized or production deployments use SQL Server authentication (`sa` or custom app user).
- **Decision**: Implement flexible connection handling in `backend/src/config/database.js` that checks for SQL user credentials first, and seamlessly supports Windows Integrated Security when `DB_USER` is empty or `DB_TRUSTED_CONNECTION=true`.
- **Consequences**: Hassle-free startup for local development on Windows while remaining production ready.
