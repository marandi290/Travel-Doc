# Travel-Doc — System Architecture

## 1. System Overview
Travel-Doc is engineered as a decoupled full-stack web application with a React SPA frontend and a Node.js/Express RESTful backend connected to Microsoft SQL Server. External map rendering, geocoding, and routing are orchestrated via OpenStreetMap, Nominatim, and OSRM.

---

## 2. System Architecture Diagram

```mermaid
graph TD
    subgraph ClientBrowser["Client (Browser)"]
        UI["React 18 SPA (Vite + Tailwind CSS)"]
        LeafletMap["Leaflet / React-Leaflet"]
        GeoAPI["Browser Geolocation API"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph BackendApp["Backend (Node.js & Express)"]
        Router["Express REST Router (/api/v1)"]
        Middleware["Middleware (CORS, Multer, Error Handler, Logger)"]
        Controllers["Controllers (Places, Wishlist, Visits, Photos, Routes)"]
        Services["Domain Services (RoutePlanner, GeocodingService, PhotoService)"]
        Repos["Repositories (Database Data Access Layer)"]
    end

    subgraph DataStorage["Data Storage & Local Assets"]
        MSSQL[("Microsoft SQL Server (mssql)")]
        LocalMedia["Local Uploads Directory (/uploads)"]
    end

    subgraph ExternalServices["External Map Services"]
        Nominatim["Nominatim Geocoding API"]
        OSRM["OSRM Routing Engine"]
        OSMTiles["OpenStreetMap Tile Servers"]
    end

    UI --> AxiosClient
    UI --> LeafletMap
    UI --> GeoAPI
    LeafletMap --> OSMTiles

    AxiosClient --> Router
    Router --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Repos
    Services --> Nominatim
    Services --> OSRM
    Repos --> MSSQL
    Services --> LocalMedia
```

---

## 3. Main Application Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler
    participant UI as React UI (Wishlist View)
    participant API as Express API (/api/v1)
    participant Geo as Geocoding Service (Nominatim)
    participant DB as SQL Server (Places & WishlistItems)

    User->>UI: Types place name "Kyoto, Japan"
    UI->>Geo: Queries geocoding coordinates
    Geo-->>UI: Returns { displayName, lat, lon, country }
    User->>UI: Selects priority="High", notes, clicks "Add to Wishlist"
    UI->>API: POST /api/v1/wishlist (Payload with Place + WishlistItem)
    API->>DB: Check if place exists (or INSERT into Places)
    API->>DB: INSERT into WishlistItems (PlaceId, Priority, Notes, Status)
    DB-->>API: Returns inserted record with IDs
    API-->>UI: HTTP 201 Created (JSON Response)
    UI->>UI: Updates local state & appends Leaflet Map marker
    UI-->>User: Displays success toast and centers map pin
```

---

## 4. Route-Planning Workflow

The route planner connects the traveler's current location to their active wishlist destinations. A core product requirement is that **the farthest destination from the origin must be visited first**, followed by a nearest-neighbor sequence for remaining stops.

```mermaid
flowchart TD
    Start["User triggers 'Plan Route'"] --> GetLoc["Acquire Browser GPS (lat, lon)"]
    GetLoc --> CheckPerm{"Permission Granted?"}
    CheckPerm -- No --> ErrorBanner["Show location error & fallback selection"]
    CheckPerm -- Yes --> FetchWishlist["Fetch active unvisited wishlist places"]
    FetchWishlist --> ValidateCount{"Valid places >= 1?"}
    ValidateCount -- No --> EmptyMsg["Notify user: No destinations to plan"]
    ValidateCount -- Yes --> CalcHaversine["Compute Haversine distance from GPS to each place"]
    CalcHaversine --> PickFarthest["Identify Farthest Place -> Designate as Stop #1"]
    PickFarthest --> NearestNeighbor["Order remaining places via Nearest Neighbor heuristic"]
    NearestNeighbor --> BuildWaypoints["Assemble ordered waypoints: [Origin, Stop 1, Stop 2, ... Stop N]"]
    BuildWaypoints --> RequestOSRM["Query OSRM API for road geometry & turn distances"]
    RequestOSRM --> OSRMSuccess{"OSRM Response OK?"}
    OSRMSuccess -- Yes --> RenderRoad["Draw road route polyline on Leaflet map"]
    OSRMSuccess -- No --> FallbackStraight["Fallback: Draw direct geodesic polylines with warning"]
    RenderRoad --> ShowMetrics["Display total road distance, estimated time, and stop cards"]
    FallbackStraight --> ShowMetrics
```

---

## 5. Architectural Principles & Layering
1. **Separation of Concerns**:
   - `routes/`: Define endpoint URL paths and attach validation middleware.
   - `controllers/`: Handle HTTP requests, status codes, and formatting.
   - `services/`: Encapsulate core business logic (e.g. Haversine distance, itinerary sequencing).
   - `repositories/`: Pure SQL query execution using parameterized inputs via `mssql`.
2. **Resilience & Fallbacks**:
   - Geocoding and routing services are behind abstracted service modules with fallback strategies.
   - If external routing fails, UI renders straight-line visual connectors with clear notices.
3. **Security Standards**:
   - Centralized input validation using Zod/express-validator.
   - Safe file uploads: MIME type inspection, file extension whitelist, UUID file naming.
   - CORS origin configuration and defensive header settings.
