# Travel-Doc — Frontend Application

Modern React 18 Single Page Application built with Vite, Tailwind CSS, Leaflet, and Axios.

---

## 1. Tech Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom nature-inspired palette
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap tiles
- **Icons**: React Icons (Lucide / Feather / Material)
- **HTTP Client**: Axios

---

## 2. Directory Structure
```
frontend/
├── public/              # Static public assets
├── src/
│   ├── assets/          # Icons, illustration SVGs
│   ├── components/      # UI component hierarchy
│   │   ├── common/      # Button, Modal, Card, Input, Badge, Toast
│   │   ├── layout/      # Sidebar, Header, MobileNav, Layout
│   │   ├── map/         # LeafletMap, CustomMarker, MapControls
│   │   ├── places/      # WishlistCard, PlaceSearch, PlaceDetailModal
│   │   ├── trips/       # RoutePlannerView, StopCard, RouteStats
│   │   └── gallery/     # PhotoGrid, PhotoUploadModal, Lightbox
│   ├── pages/           # Dashboard, Wishlist, MapExplorer, RoutePlanner, etc.
│   ├── hooks/           # useGeolocation, useWishlist, useDebounce
│   ├── services/        # api.js, geocodingService.js, routingService.js
│   ├── context/         # AppContext, NotificationContext
│   ├── utils/           # haversine.js, formatting.js
│   ├── styles/          # index.css (Tailwind imports)
│   ├── routes/          # AppRoutes.jsx
│   ├── App.jsx          # Root component
│   └── main.jsx         # Vite entry point
├── .env.example
├── package.json
└── vite.config.js
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
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3.3 Development Server
```powershell
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3.4 Build for Production
```powershell
npm run build
npm run preview
```
