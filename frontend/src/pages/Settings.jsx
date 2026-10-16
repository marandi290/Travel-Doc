import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import {
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from 'react-icons/io5';

export default function Settings() {
  const { addNotification } = useNotification();
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [defaultPriority, setDefaultPriority] = useState('High');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addNotification('Preferences updated successfully.', 'success');
  };

  const handleClearCache = () => {
    localStorage.clear();
    addNotification('Local browser cache cleared.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center shadow-xs">
            <IoSettingsOutline className="w-5 h-5" aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Application Settings</h2>
        </div>
        <p className="text-xs text-stone-600 font-medium mt-1">
          Customize your experience, review location privacy policies, and manage local storage.
        </p>
      </div>

      {/* User Preferences */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-stone-900 mb-4">Display Preferences</h3>
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="setting-distance-unit"
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
              >
                Distance Unit
              </label>
              <select
                id="setting-distance-unit"
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="setting-default-priority"
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
              >
                Default Wishlist Priority
              </label>
              <select
                id="setting-default-priority"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Location Privacy Card */}
      <Card className="p-6 space-y-3 bg-stone-50 border-stone-200">
        <div className="flex items-center gap-2 text-forest-900 font-bold text-base">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-forest-700" aria-hidden="true" />
          <span>Location Privacy & Security Policy</span>
        </div>
        <ul className="text-xs text-stone-700 space-y-2 leading-relaxed list-disc list-inside">
          <li>
            <strong>Explicit Consent</strong>: The browser Geolocation API is invoked strictly when you click "Locate Me".
          </li>
          <li>
            <strong>No Continuous Tracking</strong>: Travel-Doc does not run background GPS listeners or harvest location history.
          </li>
          <li>
            <strong>Secure Context Requirements</strong>: Modern browsers enforce HTTPS for Geolocation in production deployments. During development, `localhost` (127.0.0.1) is recognized as an exempt secure origin.
          </li>
          <li>
            <strong>Local Computation</strong>: Live coordinates are only used locally in memory for Haversine distance calculations and are never saved to database audit logs without direct trip creation.
          </li>
        </ul>
      </Card>

      {/* Services & Integrations */}
      <Card className="p-6 space-y-3">
        <h3 className="text-base font-bold text-stone-900 mb-2">Connected External Services</h3>
        <div className="divide-y divide-stone-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800">Map Visualization & Tiles</span>
              <p className="text-stone-500">OpenStreetMap contributors</p>
            </div>
            <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800">Geocoding & Place Resolution</span>
              <p className="text-stone-500">OpenStreetMap Nominatim API</p>
            </div>
            <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800">Road Routing & Polyline Engine</span>
              <p className="text-stone-500">Open Source Routing Machine (OSRM)</p>
            </div>
            <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800">Relational Database</span>
              <p className="text-stone-500">Microsoft SQL Server 2025</p>
            </div>
            <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              Connected
            </span>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-rose-200 bg-rose-50/20">
        <h3 className="text-base font-bold text-rose-950 mb-1">Local Browser Cache</h3>
        <p className="text-xs text-rose-800 mb-3 leading-relaxed">
          Clear temporary local storage and geocoding memory caches. Database records on SQL Server will remain intact.
        </p>
        <Button variant="danger" size="sm" onClick={handleClearCache} icon={IoTrashOutline}>
          Clear Browser Cache
        </Button>
      </Card>
    </div>
  );
}
