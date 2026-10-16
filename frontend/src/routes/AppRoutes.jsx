import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Wishlist from '../pages/Wishlist';
import MapExplorer from '../pages/MapExplorer';
import RoutePlanner from '../pages/RoutePlanner';
import TravelHistory from '../pages/TravelHistory';
import TravelGallery from '../pages/TravelGallery';
import PlaceDetails from '../pages/PlaceDetails';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/map" element={<MapExplorer />} />
        <Route path="/routes" element={<RoutePlanner />} />
        <Route path="/history" element={<TravelHistory />} />
        <Route path="/gallery" element={<TravelGallery />} />
        <Route path="/places/:id" element={<PlaceDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
