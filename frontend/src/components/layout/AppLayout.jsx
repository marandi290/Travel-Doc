import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useGeolocation } from '../../hooks/useGeolocation';
import AddPlaceModal from '../places/AddPlaceModal';
import { IoClose, IoAlertCircleOutline } from 'react-icons/io5';

export default function AppLayout({ onPlaceAdded }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dismissGeoNotice, setDismissGeoNotice] = useState(false);
  const { location, isLocating, error: geoError, getCurrentLocation } = useGeolocation();

  return (
    <div className="min-h-screen bg-stone-50 flex text-stone-900">
      {/* Accessible Skip Link */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          currentLocation={location}
          isLocating={isLocating}
          onLocateUser={getCurrentLocation}
        />

        {/* Global GPS notice banner if permission is pending or denied */}
        {geoError && !dismissGeoNotice && (
          <div
            role="status"
            className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 text-xs text-amber-950 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                <strong>Location notice:</strong> {geoError}. To use live GPS routing, allow location access in your browser.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="font-bold underline text-amber-900 hover:text-amber-950"
              >
                Retry GPS
              </button>
              <button
                type="button"
                onClick={() => setDismissGeoNotice(true)}
                className="p-1 text-amber-800 hover:text-amber-950 rounded"
                aria-label="Dismiss location notice"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Page Landmark */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none"
        >
          <Outlet context={{ currentLocation: location, refreshTrigger: isAddModalOpen }} />
        </main>
      </div>

      {/* Quick Add Place Modal */}
      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          onPlaceAdded?.();
        }}
      />
    </div>
  );
}
