import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createCustomMarkerIcon } from './CustomMarkers';
import Badge from '../common/Badge';

// Helper component to auto-fit map bounds
function BoundsUpdater({ markers, currentLocation, routePolyline }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const latLngs = [];

    // Include markers
    if (markers && markers.length > 0) {
      markers.forEach((m) => {
        if (m.Latitude && m.Longitude) {
          latLngs.push([Number(m.Latitude), Number(m.Longitude)]);
        }
      });
    }

    // Include current location
    if (currentLocation?.latitude && currentLocation?.longitude) {
      latLngs.push([currentLocation.latitude, currentLocation.longitude]);
    }

    // Include route line
    if (routePolyline && routePolyline.length > 0) {
      routePolyline.forEach((pt) => latLngs.push(pt));
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, markers, currentLocation, routePolyline]);

  return null;
}

// Helper to center on selected place
function SelectedPlaceCenterer({ selectedPlace }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPlace?.Latitude && selectedPlace?.Longitude) {
      map.flyTo([Number(selectedPlace.Latitude), Number(selectedPlace.Longitude)], 12, {
        duration: 1.0,
      });
    }
  }, [map, selectedPlace]);
  return null;
}

export default function LeafletMap({
  markers = [],
  selectedPlace = null,
  onSelectPlace = null,
  currentLocation = null,
  routePolyline = [],
  routeStops = [],
  className = 'h-[500px]',
  showLegend = true,
}) {
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs bg-stone-100 ${className}`}
    >
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto Bounds and Center handlers */}
        <BoundsUpdater
          markers={markers}
          currentLocation={currentLocation}
          routePolyline={routePolyline}
        />
        <SelectedPlaceCenterer selectedPlace={selectedPlace} />

        {/* User GPS Location Marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={createCustomMarkerIcon({ type: 'current-location' })}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-stone-900 text-sm">Your Location</div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (Connected road route) */}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#15803d',
              weight: 4.5,
              opacity: 0.9,
              dashArray: '6, 8',
            }}
          />
        )}

        {/* Regular Wishlist / Visited Place Markers */}
        {(!routeStops || routeStops.length === 0) &&
          markers.map((place) => {
            if (!place.Latitude || !place.Longitude) return null;
            const isSelected = selectedPlace?.PlaceId === place.PlaceId;
            const isVisited = place.Status === 'Visited' || place.isVisited;

            return (
              <Marker
                key={place.PlaceId || place.WishlistItemId || `${place.Latitude}-${place.Longitude}`}
                position={[Number(place.Latitude), Number(place.Longitude)]}
                icon={createCustomMarkerIcon({
                  type: isVisited ? 'visited' : 'wishlist',
                  isSelected,
                })}
                eventHandlers={{
                  click: () => onSelectPlace?.(place),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-stone-900 text-sm leading-snug">
                        {place.Name}
                      </span>
                      <Badge variant={isVisited ? 'visited' : 'high'} size="sm">
                        {isVisited ? 'Visited' : place.Priority || 'Wishlist'}
                      </Badge>
                    </div>

                    <div className="text-xs text-stone-600 font-medium mb-1.5">
                      {place.City ? `${place.City}, ` : ''}{place.Country}
                    </div>

                    {place.Category && (
                      <span className="inline-block text-[11px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded mb-2">
                        {place.Category}
                      </span>
                    )}

                    {place.Notes && (
                      <p className="text-xs text-stone-600 italic border-l-2 border-forest-700 pl-2 line-clamp-2 mb-2">
                        "{place.Notes}"
                      </p>
                    )}

                    {onSelectPlace && (
                      <button
                        type="button"
                        onClick={() => onSelectPlace(place)}
                        className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline mt-1 block"
                      >
                        Highlight in list
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Route Itinerary Ordered Stop Markers */}
        {routeStops &&
          routeStops.length > 0 &&
          routeStops.map((stop) => {
            if (!stop.Latitude || !stop.Longitude) return null;

            return (
              <Marker
                key={`route-stop-${stop.sequence}-${stop.PlaceId}`}
                position={[Number(stop.Latitude), Number(stop.Longitude)]}
                icon={createCustomMarkerIcon({
                  sequence: stop.sequence,
                  isSelected: selectedPlace?.PlaceId === stop.PlaceId,
                })}
                eventHandlers={{
                  click: () => onSelectPlace?.(stop),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[210px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className={`w-5 h-5 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                          stop.isFarthestFirstStop ? 'bg-terracotta-700' : 'bg-forest-800'
                        }`}
                      >
                        {stop.sequence}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">{stop.Name}</span>
                    </div>

                    {stop.isFarthestFirstStop && (
                      <div className="mb-2">
                        <Badge variant="farthest" size="sm">
                          Stop 1: Farthest Destination
                        </Badge>
                      </div>
                    )}

                    <div className="text-xs text-stone-600 space-y-0.5">
                      <div>Location: {stop.City || stop.Country}</div>
                      <div>Straight-line: {stop.straightLineFromOriginKm} km from start</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Legend Overlay */}
      {showLegend && (
        <div
          className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-stone-200 shadow-md text-xs space-y-1.5 pointer-events-auto max-w-[220px]"
          aria-label="Map Legend"
        >
          <div className="font-bold text-stone-900 border-b border-stone-200 pb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-forest-800 shrink-0" aria-hidden="true" />
            <span>Wishlist Destination</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-teal-700 shrink-0" aria-hidden="true" />
            <span>Visited Destination</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-terracotta-700 shrink-0" aria-hidden="true" />
            <span>Stop #1 (Farthest First)</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-sky-700 shrink-0" aria-hidden="true" />
            <span>Current Location (GPS)</span>
          </div>
        </div>
      )}
    </div>
  );
}
