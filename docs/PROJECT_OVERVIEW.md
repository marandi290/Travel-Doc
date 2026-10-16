# Travel-Doc — Project Overview

## 1. Executive Summary
**Travel-Doc** is a modern, responsive, full-stack personal travel guide and journey companion web application. It empowers travelers to seamlessly discover destinations, curate an organized travel wishlist, visualize itineraries on interactive maps, calculate practical multi-stop routes originating from their current location, log authentic travel history with ratings and notes, and preserve memories through a photo gallery.

---

## 2. Problem Statement
Travelers often struggle with fragmented tools:
- Notes apps for destination wishlists.
- Separate mapping tools for pinning locations.
- Cumbersome route planners that don't intelligently sequence stops from current location.
- Generic cloud photo storage decoupled from trip journals.

**Travel-Doc** consolidates this entire lifecycle into a single intuitive hub:
1. **Discover & Save**: Add places with geocoding, priorities, categories, and planned dates.
2. **Visualize**: View wishlisted and visited destinations on an interactive Leaflet map.
3. **Plan**: Execute multi-stop route planning featuring the **farthest-stop-first** heuristic followed by nearest-neighbor sequencing, utilizing real road geometry from OpenStreetMap/OSRM.
4. **Log**: Record authentic past visits with dates, ratings, and memoirs.
5. **Preserve**: Upload and tag trip photos linked directly to places and visits.

---

## 3. Target Audience
- **Independent Travelers & Backpackers**: Planning dynamic journeys with multiple stops.
- **Weekend Explorers**: Curating wishlists of nearby cultural, culinary, and nature spots.
- **Memory Keepers**: Wanting a private, chronological journal of visited countries and cities.

---

## 4. Key Functional Features
- **Smart Wishlist**: Search via geocoding (Nominatim), auto-extract coordinates, set priority/category/date, filter & sort.
- **Interactive Leaflet Map**: Real-time marker synchronization, custom pins for wishlist vs. visited, map bounds fitting, geolocation.
- **Current Location Awareness**: Browser Geolocation API integration with explicit user permission and error handling.
- **Multi-Stop Route Planner**:
  - Originates from user's current GPS location.
  - Computes straight-line Haversine distances.
  - Designates the farthest destination as Stop #1.
  - Orders subsequent stops via nearest-neighbor heuristics.
  - Queries road route polylines and turn distances via OSRM.
- **Travel History Journal**: Log repeat visits, assign 1-5 star ratings, capture travel notes, view country and city stats.
- **Photo Gallery**: Upload photos with captions and tags, secure file validation, association with places/visits, responsive lightbox.

---

## 5. Technology Stack Summary
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Leaflet & React-Leaflet, Axios, Lucide / React Icons.
- **Backend**: Node.js (ES Modules), Express.js, REST API (`/api/v1`), Multer (uploads), Zod validation, Centralized Error Handling.
- **Database**: Microsoft SQL Server (Transact-SQL), normalized relational design (`Places`, `WishlistItems`, `Visits`, `Photos`), parameterized queries.
- **External Services**: OpenStreetMap, Nominatim Geocoding API, OSRM (Open Source Routing Machine) API.
