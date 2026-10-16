import L from 'leaflet';

/**
 * Creates custom high-contrast HTML markers using L.divIcon
 */
export function createCustomMarkerIcon({
  type = 'wishlist',
  sequence = null,
  isSelected = false,
}) {
  // Current user GPS marker (pulsing beacon)
  if (type === 'current-location') {
    return L.divIcon({
      className: 'custom-gps-marker',
      html: `
        <div style="position: relative; width: 26px; height: 26px;" aria-label="Current GPS location">
          <div style="position: absolute; inset: 0; background-color: #0284c7; border-radius: 9999px; opacity: 0.6; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 26px; height: 26px; background-color: #0369a1; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  }

  // Markers for places & itinerary stops
  let bgColor = '#166534'; // forest-800 for wishlist
  let borderColor = '#ffffff';
  let innerContent = '★';
  let badgeLabel = '';

  if (type === 'visited') {
    bgColor = '#0f766e'; // teal-700
    innerContent = '✓';
  } else if (sequence !== null) {
    if (sequence === 1) {
      bgColor = '#c2410c'; // terracotta (farthest stop #1)
      badgeLabel = '1';
      innerContent = '1';
    } else {
      bgColor = '#1e3a8a'; // blue-900 for subsequent stops
      badgeLabel = `${sequence}`;
      innerContent = `${sequence}`;
    }
  }

  const selectedRing = isSelected
    ? 'box-shadow: 0 0 0 4px #ea580c, 0 8px 16px rgba(0,0,0,0.4); transform: scale(1.18);'
    : 'box-shadow: 0 4px 8px rgba(0,0,0,0.3);';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${bgColor};
        border: 2.5px solid ${borderColor};
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${sequence !== null ? '12px' : '14px'};
        font-weight: 800;
        transition: transform 0.15s ease-out;
        ${selectedRing}
      ">
        ${innerContent}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}
