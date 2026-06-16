import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MappingPage.css';

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
  // SKELETON: Fetch / Axios POST Request
  // try {
  //   const response = await fetch('/api/blocks', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(geoJsonData)
  //   });
  //   const result = await response.json();
  // } catch (error) {
  //   // handle error
  // }
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
      color: '#3388ff',
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
  // Koordinat default: PT Bio Inti Agrindo (Merauke, Papua Selatan)
  const position = [-6.960833, 140.496111];

  return (
    <div className="pt-mapping-page">
      <div className="pt-mapping-header">
        <h2 className="pt-mapping-title">Block / Area Mapping</h2>
      </div>
      
      <div className="pt-mapping-container">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
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
