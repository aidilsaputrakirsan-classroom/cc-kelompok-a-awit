import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet when using webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// API Placeholder
const handleSaveBlock = async (geoJsonData) => {
  console.log('New block drawn:', geoJsonData);
  try {
    // SKELETON: Fetch / Axios POST Request
  } catch (error) {
    console.error('Failed to save block', error);
  }
};

// Geoman Component
function GeomanControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Konfigurasi Toolbar Geoman
    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawText: false,
      drawMarker: false, 
    });

    // Styling Poligon Default
    map.pm.setPathOptions({
      color: '#10b981', // emerald-500
      weight: 2,
      fillOpacity: 0.2,
    });

    // Event Handler saat selesai menggambar
    map.on('pm:create', (e) => {
      const layer = e.layer;
      // Ekstraksi data format GeoJSON
      const geoJsonData = layer.toGeoJSON();
      // Panggil API Placeholder
      handleSaveBlock(geoJsonData);
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map]);

  return null;
}

export default function MappingPage() {
  // Koordinat default (bisa diganti sesuai koordinat perkebunan)
  const position = [-6.200000, 106.816666];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 m-0">Block / Area Mapping</h2>
      </div>
      
      <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px] z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <GeomanControl />

          <Marker position={position}>
            <Popup>
              Pusat Perkebunan (Contoh Lokasi)
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
