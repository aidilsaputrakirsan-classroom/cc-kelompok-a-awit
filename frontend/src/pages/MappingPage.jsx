import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MappingPage.css';

// Fix for default marker icon in react-leaflet when using webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MappingPage() {
  // Koordinat default (bisa diganti sesuai koordinat perkebunan)
  const position = [-6.200000, 106.816666];

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
