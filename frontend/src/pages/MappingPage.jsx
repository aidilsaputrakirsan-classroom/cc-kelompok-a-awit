import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, Tooltip } from 'react-leaflet';
import polylabel from 'polylabel';
import calculateArea from '@turf/area';
import 'leaflet/dist/leaflet.css';
import './MappingPage.css';

// Fix for default marker icon in react-leaflet when using webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useOutletContext } from 'react-router-dom';

import { createBlock, fetchBlocks, fetchVendors } from '../services/api';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function SaveBlockModal({ open, geoJson, layer, onClose, onSave, showToast, vendors }) {
  const [blockCode, setBlockCode] = useState("");
  const [division, setDivision] = useState("");
  const [hectarage, setHectarage] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && geoJson) {
      try {
        const areaSqMeters = calculateArea(geoJson);
        const areaHa = (areaSqMeters / 10000).toFixed(2);
        setHectarage(areaHa);
      } catch (e) {
        console.error("Failed to calculate area:", e);
      }
    } else {
      setBlockCode("");
      setDivision("");
      setHectarage("");
      setVendorId("");
    }
  }, [open, geoJson]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blockCode) {
      if (showToast) showToast("Block code is required", "error");
      else alert("Block code is required");
      return;
    }
    setIsSaving(true);
    await onSave({ 
      block_code: blockCode, 
      division, 
      hectarage: hectarage ? parseFloat(hectarage) : null,
      vendor_id: vendorId || null,
      geometry: geoJson 
    }, layer);
    setIsSaving(false);
  };

  return (
    <div className="pt-modal-overlay">
      <div className="pt-modal-content">
        <h3>Simpan Poligon Area</h3>
        <form onSubmit={handleSubmit}>
          <div className="pt-form-group">
            <label>Block Code (Wajib)</label>
            <input type="text" value={blockCode} onChange={e => setBlockCode(e.target.value)} required />
          </div>
          <div className="pt-form-group">
            <label>Division/Afdeling</label>
            <input type="text" value={division} onChange={e => setDivision(e.target.value)} />
          </div>
          <div className="pt-form-group">
            <label>Area Size (Ha)</label>
            <input 
              type="number" 
              step="0.01" 
              value={hectarage} 
              onChange={e => setHectarage(e.target.value)} 
              placeholder="Auto-calculated" 
            />
            <small style={{color: '#666', marginTop: '4px'}}>Dihitung otomatis berdasarkan luas poligon.</small>
          </div>
          <div className="pt-form-group">
            <label>Responsible Contractor</label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
              <option value="">-- Pilih Contractor --</option>
              {vendors && vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-modal-actions">
            <button type="button" className="pt-btn-secondary" onClick={onClose} disabled={isSaving}>Batal</button>
            <button type="submit" className="pt-btn-primary" disabled={isSaving}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Geoman Component
function GeomanControl({ onSaveShape }) {
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
      const geoJsonData = layer.toGeoJSON();
      onSaveShape(geoJsonData, layer);
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map, onSaveShape]);

  return null;
}

// Fix for Leaflet gray/cut-off tiles due to CSS page transitions
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Wait for the .page-transition-animate to finish (0.35s)
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);
    
    // Also invalidate on window resize to be safe
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

export default function MappingPage() {

  const outlet = useOutletContext() || {};
  const { showToast } = outlet;

  // Koordinat default: PT Bio Inti Agrindo (Merauke, Papua Selatan)
  const position = [-6.960833, 140.496111];

  const [blocks, setBlocks] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShape, setCurrentShape] = useState({ geoJson: null, layer: null });

  const loadBlocks = async () => {
    try {
      const data = await fetchBlocks({ limit: 1000 });
      if (data && data.blocks) {
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error("Failed to load blocks:", error);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await fetchVendors({ limit: 1000, status: true });
      if (data && data.vendors) {
        setVendors(data.vendors);
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };

  useEffect(() => {
    loadBlocks();
    loadVendors();
  }, []);

  const handleDrawFinish = (geoJsonData, layer) => {
    setCurrentShape({ geoJson: geoJsonData, layer });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    if (currentShape.layer && currentShape.layer._map) {
      currentShape.layer._map.removeLayer(currentShape.layer);
    }
    setModalOpen(false);
    setCurrentShape({ geoJson: null, layer: null });
  };

  const handleSaveBlock = async (blockData, layer) => {
    try {
      await createBlock(blockData);
      if (showToast) showToast("Block saved successfully!", "success");
      else alert("Block saved successfully!");
      
      setModalOpen(false);
      setCurrentShape({ geoJson: null, layer: null });
      // Reload blocks from db to render GeoJSON cleanly
      loadBlocks();
      // Remove temporary drawn layer
      if (layer && layer._map) {
        layer._map.removeLayer(layer);
      }
    } catch (error) {
      console.error("Failed to save block:", error);
      if (showToast) showToast("Gagal menyimpan block. Cek log.", "error");
      else alert("Gagal menyimpan block. Cek log.");
    }
  };


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
          
          <MapResizer />
          <GeomanControl onSaveShape={handleDrawFinish} />

          <Marker position={position}>
            <Popup>
              Pusat Perkebunan (Contoh Lokasi)
            </Popup>
          </Marker>

          {blocks.map(block => {
            if (!block.geometry) return null;
            
            let center = null;
            try {
              const geom = block.geometry;
              const type = geom.type;
              let coords = [];
              if (type === 'Polygon') {
                  coords = geom.coordinates;
              } else if (type === 'MultiPolygon') {
                  coords = geom.coordinates[0];
              } else if (type === 'Feature' && geom.geometry) {
                  if (geom.geometry.type === 'Polygon') {
                      coords = geom.geometry.coordinates;
                  } else if (geom.geometry.type === 'MultiPolygon') {
                      coords = geom.geometry.coordinates[0];
                  }
              }
              
              if (coords && coords.length > 0) {
                  const result = polylabel(coords, 0.00001); 
                  if (!isNaN(result[0]) && !isNaN(result[1])) {
                      center = [result[1], result[0]]; // Leaflet Marker uses [lat, lng]
                  }
              }
            } catch (e) {
                console.error("Polylabel calculation failed for block:", block.block_code, e);
            }

            const vendor = vendors.find(v => v.id === block.vendor_id);
            const vendorName = vendor ? vendor.name : 'Unknown Contractor';

            return (
              <React.Fragment key={block.id}>
                <GeoJSON 
                  data={block.geometry} 
                  style={{ color: '#ff7800', weight: 2, fillOpacity: 0.4 }}
                >
                  <Popup>
                    <strong>Kode Blok:</strong> {block.block_code}<br />
                    <strong>Afdeling:</strong> {block.division || '-'}<br />
                    <strong>Contractor:</strong> {vendorName}<br />
                    <strong>Luas:</strong> {block.hectarage || '-'} ha
                  </Popup>
                  {!center && (
                    <Tooltip permanent direction="center" className="pt-polygon-tooltip">
                      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <div style={{fontSize:'16px'}}>{block.block_code}</div>
                        <div style={{fontSize:'11px', fontWeight:'normal', opacity:0.9, marginTop:'2px'}}>{vendorName}</div>
                        <div style={{fontSize:'11px', fontWeight:'normal', opacity:0.9}}>{block.hectarage ? block.hectarage + ' Ha' : ''}</div>
                      </div>
                    </Tooltip>
                  )}
                </GeoJSON>
                {center && (
                  <Marker position={center} icon={L.divIcon({
                    className: 'pt-polygon-tooltip-marker',
                    html: `<div class="pt-polygon-tooltip" style="display:flex; flex-direction:column; align-items:center;">
                             <div style="font-size:16px;">${block.block_code}</div>
                             <div style="font-size:11px; font-weight:normal; opacity:0.9; margin-top:2px;">${vendorName}</div>
                             <div style="font-size:11px; font-weight:normal; opacity:0.9;">${block.hectarage ? block.hectarage + ' Ha' : ''}</div>
                           </div>`,
                    iconSize: [0, 0]
                  })} />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      <SaveBlockModal 
        open={modalOpen} 
        geoJson={currentShape.geoJson} 
        layer={currentShape.layer} 
        onClose={handleModalClose} 
        onSave={handleSaveBlock} 
        showToast={showToast}
        vendors={vendors}
      />
    </div>
  );
}
