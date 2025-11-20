'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const getMarkerColor = (kelurahanName: string) => {
  const name = kelurahanName?.toLowerCase() ?? '';

  if (name === 'pasirkareumbi') return 'orange';
  if (name === 'soklat') return 'red';
  if (name === 'parung') return 'green';
  if (name === 'wanareja') return 'blue';

  return 'gray';
};

const coloredIcon = (color: string) =>
  L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

type Kelurahan = {
  id: number;
  nama: string;
};

type Posyandu = {
  id: number;
  nama: string;
  alamat: string;
  wilayah: string;
  kelurahan: Kelurahan;
  penanggungJawab: string;
  noHp: string;
  akreditasi: string;
  latitude: string;
  longitude: string;
};

export default function MapView() {
  const [posyanduData, setPosyanduData] = useState<Posyandu[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const fetchPosyandu = async () => {
      try {
        const res = await fetch('/api/posyandu');
        const data = await res.json();

        setPosyanduData(data);
      } catch (err) {
        console.error('Gagal fetch data posyandu:', err);
      }
    };

    fetchPosyandu();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;

    const map = L.map('leaflet-map').setView([-6.5740985, 107.7407857], 13);
    mapRef.current = map;

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    if (!mapRef.current || posyanduData.length === 0) return;

    const markerGroup = markerGroupRef.current;
    markerGroup?.clearLayers();

    posyanduData.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const kelurahanName = item.kelurahan?.nama ?? '';
      const markerColor = getMarkerColor(kelurahanName);

      const marker = L.marker([lat, lng], {
        icon: coloredIcon(markerColor),
      })
        .bindPopup(
          `
            <strong>${item.nama}</strong><br/>
            ${item.alamat}<br/>
            ${item.wilayah}, Kelurahan ${kelurahanName}<br/>
            Penanggung Jawab: ${item.penanggungJawab}<br/>
            Kontak: ${item.noHp}<br/>
            Akreditasi: ${item.akreditasi}
          `
        )
        .bindTooltip(item.nama, {
          permanent: true,
          direction: 'top',
          offset: [0, -10],
        });

      markerGroup?.addLayer(marker);
    });
  }, [posyanduData]);

  return (
    <div
      id="leaflet-map"
      className="rounded-md"
      style={{ height: '90vh', width: '100%' }}
    />
  );
}
