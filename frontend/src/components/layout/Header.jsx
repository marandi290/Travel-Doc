import React from 'react';
import { IoMenu, IoAdd, IoLocationOutline, IoNavigate } from 'react-icons/io5';
import Button from '../common/Button';

export default function Header({
  onToggleSidebar,
  onOpenAddModal,
  currentLocation,
  isLocating,
  onLocateUser,
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
          aria-label="Open navigation menu"
        >
          <IoMenu className="w-6 h-6" aria-hidden="true" />
        </button>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-widest text-forest-800">
            Travel-Doc
          </span>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
            Personal Travel Guide & Planner
          </h1>
        </div>
      </div>

      {/* Right Controls: Geolocation & Add Action */}
      <div className="flex items-center gap-2.5">
        {/* Geolocation status pill */}
        <button
          type="button"
          onClick={onLocateUser}
          disabled={isLocating}
          title={
            currentLocation
              ? `GPS Active: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : 'Click to acquire current GPS location'
          }
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 ${
            currentLocation
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
          }`}
          aria-label={
            currentLocation
              ? `GPS Active at ${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`
              : 'Acquire GPS location'
          }
        >
          {isLocating ? (
            <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          ) : currentLocation ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
          ) : (
            <IoLocationOutline className="w-4 h-4 text-stone-500" />
          )}

          <span className="hidden sm:inline">
            {isLocating
              ? 'Locating...'
              : currentLocation
              ? `${currentLocation.latitude.toFixed(2)}°, ${currentLocation.longitude.toFixed(2)}°`
              : 'Locate Me'}
          </span>
        </button>

        {/* Quick Add Destination Action */}
        {onOpenAddModal && (
          <Button
            onClick={onOpenAddModal}
            variant="primary"
            size="sm"
            icon={IoAdd}
          >
            Add Place
          </Button>
        )}
      </div>
    </header>
  );
}
