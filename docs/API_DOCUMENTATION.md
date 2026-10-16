# Travel-Doc — REST API Documentation

Base URL: `/api/v1`

All responses follow a consistent JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```
Error format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Details about the error",
    "details": [ ... ]
  }
}
```

---

## 1. System & Health
### `GET /api/v1/health`
Checks API and database connectivity status.
- **Response `200 OK`**:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-10-16T09:00:00.000Z"
}
```

---

## 2. Places & Wishlist

### `GET /api/v1/places`
Retrieves places, supports query filtering.
- **Query params**: `category`, `search`, `limit`, `offset`
- **Response `200 OK`**: Array of Place records.

### `POST /api/v1/places`
Creates a new place record manually or via geocoding result.
- **Body**:
```json
{
  "name": "Fushimi Inari Taisha",
  "address": "68 Fukakusa Yabunouchicho, Fushimi Ward",
  "city": "Kyoto",
  "country": "Japan",
  "latitude": 34.9671402,
  "longitude": 135.7726717,
  "category": "Historic",
  "description": "Famed Shinto shrine with thousands of vermilion torii gates."
}
```

### `GET /api/v1/wishlist`
Retrieves wishlisted items with place details and optional sorting.
- **Query params**:
  - `status`: `Pending` (default), `Visited`, `All`
  - `priority`: `High`, `Medium`, `Low`
  - `category`: string
  - `sort`: `priority`, `date`, `created`, `distance` (requires `lat` & `lon` params)
  - `lat`, `lon`: user coordinates for distance sorting

### `POST /api/v1/wishlist`
Adds a place to the wishlist. Can accept an existing `placeId` or raw place fields to create & wishlist atomically.
- **Body**:
```json
{
  "place": {
    "name": "Eiffel Tower",
    "city": "Paris",
    "country": "France",
    "latitude": 48.8583701,
    "longitude": 2.2944813,
    "category": "Culture"
  },
  "priority": "High",
  "notes": "Ascend to top deck at sunset",
  "plannedVisitDate": "2027-05-15"
}
```

### `PATCH /api/v1/wishlist/:id`
Updates wishlist item priority, notes, planned date, or status.
- **Body**: `{ "priority": "Medium", "notes": "Updated note", "plannedVisitDate": "2027-06-01" }`

### `DELETE /api/v1/wishlist/:id`
Deletes a wishlist item by ID.

---

## 3. Travel History (Visits)

### `GET /api/v1/visits`
Retrieves visit history in chronological order.
- **Query params**: `startDate`, `endDate`, `country`, `city`, `rating`
- **Response `200 OK`**: Array of Visit items joined with Place details and photo counts.

### `POST /api/v1/visits`
Records a completed visit to a destination.
- **Body**:
```json
{
  "placeId": "00000000-0000-0000-0000-000000000000",
  "visitDate": "2026-08-10",
  "rating": 5,
  "notes": "Breathtaking views, early morning arrival avoided crowds.",
  "markWishlistVisited": true
}
```

### `PUT /api/v1/visits/:id`
Updates visit memoirs, rating, or visit date.

### `DELETE /api/v1/visits/:id`
Deletes a visit record.

---

## 4. Route Planning

### `POST /api/v1/routes/plan`
Generates a multi-stop travel itinerary starting from the current location.
- **Requirement Rule**: The destination with the greatest straight-line distance from the current location is designated as **Stop #1**. Subsequent stops are ordered via nearest-neighbor sequencing. Road route polyline is retrieved from OSRM.
- **Body**:
```json
{
  "origin": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "name": "Current Location"
  },
  "destinationIds": [ ...optional specific PlaceIds, or empty for all unvisited... ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "origin": { "latitude": 35.6762, "longitude": 139.6503 },
    "stops": [
      {
        "sequence": 1,
        "placeId": "...",
        "name": "Mount Fuji 5th Station",
        "latitude": 35.3606,
        "longitude": 138.7274,
        "straightLineDistanceKm": 98.4,
        "isFarthestFirstStop": true
      },
      ...
    ],
    "totalRoadDistanceKm": 245.8,
    "estimatedDurationMinutes": 195,
    "geometry": "encoded_polyline_or_geojson_coordinates",
    "routingServiceUsed": "OSRM"
  }
}
```

---

## 5. Photo Gallery

### `GET /api/v1/photos`
Retrieves photos with pagination and metadata.
- **Query params**: `placeId`, `visitId`, `tag`, `page`, `limit`

### `POST /api/v1/photos`
Uploads a new photograph using `multipart/form-data`.
- **Form Fields**:
  - `photo`: File binary (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5MB)
  - `placeId`: UUID of destination
  - `visitId`: UUID of visit (optional)
  - `caption`: string (optional)
  - `photoDate`: date (optional)
  - `tags`: comma-separated string (optional)

### `PATCH /api/v1/photos/:id`
Updates caption, photo date, or tags.

### `DELETE /api/v1/photos/:id`
Deletes photo record from database and cleans up disk file.

---

## 6. Dashboard Summary

### `GET /api/v1/dashboard/summary`
Returns high-level aggregate metrics and upcoming destinations for the home dashboard.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalWishlistCount": 12,
    "totalVisitedCount": 8,
    "countriesVisitedCount": 4,
    "upcomingDestinations": [ ... ],
    "recentVisits": [ ... ],
    "recentPhotos": [ ... ]
  }
}
```
