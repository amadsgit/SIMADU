'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Setup ikon default Leaflet (agar marker tampil)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type PickLocationMapProps = {
  onPick: (lat: number, lng: number) => void;
  onClose: () => void;
};

export default function PickLocationMap({ onPick, onClose }: PickLocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('pick-location-map').setView([-6.5740985, 107.7407857], 13);
    mapRef.current = map;

    // Gunakan Google Maps tile (seperti di MapView)
    const googleStreets = L.tileLayer(
      'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', // m = street, s = satellite, y = hybrid, t = terrain
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    );
    googleStreets.addTo(map);

    // Event click untuk ambil koordinat
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });

      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng).addTo(map);
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            📍 Pilih Lokasi di Peta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Peta */}
        <div id="pick-location-map" className="w-full h-[70vh] rounded-xl mb-4 border border-gray-200 shadow-inner" />

        {/* Koordinat */}
        {coords && (
          <p className="text-sm text-gray-700 mb-4 text-center">
            Latitude: <strong>{coords.lat.toFixed(6)}</strong> | Longitude:{' '}
            <strong>{coords.lng.toFixed(6)}</strong>
          </p>
        )}

        {/* Tombol */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            disabled={!coords}
            onClick={() => coords && onPick(coords.lat, coords.lng)}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition"
          >
            Ambil Koordinat
          </button>
        </div>
      </div>
    </div>
  );
}
