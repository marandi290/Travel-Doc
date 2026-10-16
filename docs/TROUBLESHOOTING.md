# Travel-Doc — Troubleshooting Guide

## 1. Microsoft SQL Server Connection Issues

### 1.1 SSL / Certificate Chain Untrusted Error
**Symptoms**:
```
SSL Provider: The certificate chain was issued by an authority that is not trusted.
Client unable to establish connection.
```
**Cause**:
ODBC Driver 18 and newer versions of the `mssql`/`tedious` client default `encrypt: true` and require trusted certificates unless overridden.
**Resolution**:
In `backend/.env` or database configuration, ensure:
```env
DB_TRUST_SERVER_CERTIFICATE=true
DB_ENCRYPT=false
```
When running `sqlcmd` from PowerShell, always include the `-C` (Trust Server Certificate) switch:
```powershell
sqlcmd -S localhost -E -C -Q "SELECT @@VERSION"
```

### 1.2 Login Failed for User / Windows Authentication
**Symptoms**:
`Login failed for user 'sa'` or `Login failed for user '<computer>\<user>'`.
**Resolution**:
1. Check SQL Server Authentication Mode in SQL Server Configuration Manager or SSMS:
   - If using Windows Authentication (Integrated Security), ensure connection string uses `trustedConnection: true` or correct domain credentials.
   - If using SQL Authentication (`sa`), ensure mixed mode is enabled and `sa` account is enabled (`ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD = '...';`).

### 1.3 SQL Server Service Not Running
**Resolution**:
Verify service status in Windows PowerShell:
```powershell
Get-Service -Name "*sql*"
Start-Service -Name "MSSQLSERVER"
```

---

## 2. Geolocation & Browser Permissions

### 2.1 "User Denied Geolocation" or Insecure Origin
**Symptoms**:
Geolocation fails with `PERMISSION_DENIED` or `Only secure origins are allowed`.
**Resolution**:
- Modern browsers enforce that `navigator.geolocation` requires HTTPS in production.
- `localhost` (e.g. `http://localhost:5173`) is treated as a secure origin by Chrome/Edge/Firefox for local development.
- If you accidentally hit "Block" on the location prompt, click the padlock/tune icon in the browser address bar, reset permissions for `localhost`, and refresh.

---

## 3. Map & Leaflet Display Issues

### 3.1 Map Tiles Show Gray Squares or Broken Layout
**Symptoms**:
Leaflet map loads but tiles appear misaligned or as a solid gray container.
**Resolution**:
- Ensure Leaflet CSS is imported in `frontend/src/main.jsx` or `index.html`:
  ```javascript
  import 'leaflet/dist/leaflet.css';
  ```
- Ensure the map container element has an explicit CSS height (e.g., `h-[500px]` or `min-h-[400px] h-full`).

### 3.2 Marker Icons Missing (Broken Image Icons)
**Symptoms**:
Leaflet markers display a missing image icon.
**Resolution**:
Leaflet's default marker icon uses relative asset paths that Vite bundles differently. Configure custom SVG markers or inject the standard marker icon overrides via `L.Icon.Default.mergeOptions`.

---

## 4. OSRM & Geocoding Rate Limits

### 4.1 Nominatim HTTP 429 Too Many Requests
**Resolution**:
- Nominatim requires a valid `User-Agent` header and max 1 request/second.
- Ensure the frontend debounces searches by at least 400ms before dispatching geocoding requests.

### 4.2 OSRM Route Calculation Fails Across Water
**Resolution**:
OSRM road routing will return `NoRoute` if waypoints cannot be connected by drivable roads (e.g. island destinations). Travel-Doc catches this and automatically falls back to rendering geodesic connectors while informing the user.

---

## 5. File Upload (Multer) Errors

### 5.1 File Too Large (LIMIT_FILE_SIZE)
**Resolution**:
Upload limit is configured to 5MB. Files exceeding this will trigger a `400 Bad Request` with message `File size limit exceeded (Max 5MB)`.

### 5.2 Invalid File Format
**Resolution**:
Travel-Doc strictly allows `image/jpeg`, `image/png`, and `image/webp`. PDFs, SVGs, or executables will be rejected with an appropriate validation message.
