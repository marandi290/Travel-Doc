# Travel-Doc — Requirements Specification

## 1. Functional Requirements (FR)

### Feature 1: Travel Wishlist
- **FR-001**: The system shall allow users to search for destinations by place name, city, country, or address using an integrated geocoding service.
- **FR-002**: The system shall save place records with stable UUID/ID, name, address, city, country, latitude, longitude, category, and description.
- **FR-003**: The system shall prevent accidental duplicate entries for the same place/coordinates.
- **FR-004**: Users shall be able to assign wishlist attributes: priority (High, Medium, Low), category (Nature, Culture, Culinary, Adventure, Historic, Urban), planned visit date, and personal notes.
- **FR-005**: Users shall be able to edit and delete wishlist items.
- **FR-006**: Users shall be able to mark a wishlisted destination as visited, triggering the creation of a visit record.
- **FR-007**: Users shall be able to filter wishlist items by priority and category, and sort by date, priority, or distance from current location.

### Feature 2: Interactive Wishlist Map
- **FR-008**: The system shall display an interactive Leaflet map featuring all wishlisted destinations.
- **FR-009**: The map shall use distinctive marker styles for wishlist items, visited destinations, and currently selected places.
- **FR-010**: Clicking a map marker shall display an informative popup with place name, category, status, and quick actions.
- **FR-011**: Selecting a place from the list shall pan and zoom the map directly to that destination's marker.
- **FR-012**: The map shall automatically fit bounds to encompass all visible markers.
- **FR-013**: Map markers shall update reactively upon adding, editing, or removing places without requiring a full page reload.

### Feature 3: Current Location
- **FR-014**: The system shall request explicit user permission before querying device location via the browser Geolocation API.
- **FR-015**: The system shall display the user's current GPS location on the map with a distinct pulsing marker.
- **FR-016**: The system shall provide a "Locate Me" button to refresh the current location coordinates.
- **FR-017**: The system shall handle location permission denials, timeouts, position unavailable, and insecure context states with user-friendly error banners.
- **FR-018**: The system shall not perform persistent background tracking or store location history without explicit user intent.

### Feature 4: Multi-Stop Travel Route Planner
- **FR-019**: The route planner shall calculate straight-line distances from the user's current GPS coordinates to all unvisited wishlist destinations using the Haversine formula.
- **FR-020**: The system shall select the **farthest** wishlist destination as the first destination stop (Stop #1).
- **FR-021**: The system shall sequence the remaining stops using a nearest-neighbor algorithm.
- **FR-022**: The system shall request actual road-route geometry from the OSRM routing service and render the route polyline on the map.
- **FR-023**: The system shall display total route road distance, estimated drive duration, and ordered stop sequence cards.
- **FR-024**: Users shall be able to manually reorder stops or remove stops and recalculate the route on demand.
- **FR-025**: If routing service is unavailable or locations are across unnavigable water bodies, the system shall fall back to geodesic lines and notify the user.

### Feature 5: Travel History
- **FR-026**: Users shall be able to log authentic visits with visit date, 1-5 star rating, and memoirs/notes.
- **FR-027**: Places can be visited multiple times, maintaining independent visit records linked to the same place ID.
- **FR-028**: Travel history shall display chronologically in a timeline or structured card list.
- **FR-029**: Users shall be able to filter history by date range, country, and city.
- **FR-030**: Visited places shall be viewable on the interactive map with visited styling.
- **FR-031**: The dashboard shall display aggregate travel statistics (total visited places, unique countries visited, total wishlist items).

### Feature 6: Travel Photo Gallery
- **FR-032**: Users shall be able to upload photographs from their device associated with a destination and/or visit.
- **FR-033**: Users shall be able to attach captions, photo dates, and comma-separated tags to each photo.
- **FR-034**: Photos shall be displayed in a responsive masonry/grid layout with filtering by destination, tag, and date.
- **FR-035**: Users shall be able to open photos in a full-screen lightbox modal displaying photo details.
- **FR-036**: Users shall be able to edit captions/tags and delete photos with confirmation.
- **FR-037**: The server shall enforce MIME type validation (`image/jpeg`, `image/png`, `image/webp`), size limits (up to 5MB), and safe file naming.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-001 (Performance)**: Geocoding searches and route computations shall deliver UI feedback within 1.5 seconds under normal network conditions.
- **NFR-002 (Responsiveness)**: The UI shall be fully responsive across mobile (>= 360px), tablet (>= 768px), and desktop (>= 1024px).
- **NFR-003 (Reliability & Resilience)**: All external API interactions (OSRM, Nominatim) shall include configurable timeouts, graceful fallbacks, and user-facing notifications.
- **NFR-004 (Data Integrity)**: Database tables shall enforce foreign keys, unique constraints, and cascade delete rules where appropriate.
- **NFR-005 (Security)**: SQL injection shall be eliminated via parameterized queries (`mssql`). Path traversal attacks on uploads shall be prevented via sanitized UUID-based filenames.
- **NFR-006 (Accessibility)**: Controls shall be accessible via keyboard, adhere to WCAG 2.1 AA color contrast standards, and include ARIA labels.
- **NFR-007 (Maintainability)**: Frontend and backend codebases shall adhere to clear architectural separation, ES modules, and comprehensive automated test coverage.
