import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IoCompassOutline,
  IoBookmarkOutline,
  IoMapOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoImagesOutline,
  IoSettingsOutline,
  IoClose,
} from 'react-icons/io5';

const navItems = [
  { name: 'Dashboard', path: '/', icon: IoCompassOutline },
  { name: 'Wishlist', path: '/wishlist', icon: IoBookmarkOutline },
  { name: 'Map Explorer', path: '/map', icon: IoMapOutline },
  { name: 'Route Planner', path: '/routes', icon: IoNavigateOutline },
  { name: 'Travel History', path: '/history', icon: IoTimeOutline },
  { name: 'Photo Gallery', path: '/gallery', icon: IoImagesOutline },
  { name: 'Settings', path: '/settings', icon: IoSettingsOutline },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 text-stone-200 border-r border-stone-800 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-xs">
              <IoCompassOutline className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wide">Travel-Doc</span>
              <span className="block text-[10px] text-stone-400 font-semibold tracking-wider uppercase">Personal Guide</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
            aria-label="Close sidebar"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                    isActive
                      ? 'bg-forest-800 text-white font-semibold shadow-xs'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                    {isActive && <span className="sr-only"> (current page)</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Route Engine Architecture Info */}
        <div className="p-3.5 mx-3 mb-4 rounded-xl bg-stone-800/70 border border-stone-700/60 text-xs text-stone-400">
          <div className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            Farthest-First Engine
          </div>
          <p className="text-[11px] leading-relaxed text-stone-400">
            Routes journey to the farthest wishlist destination first, returning via optimal road geometry.
          </p>
        </div>
      </aside>
    </>
  );
}
