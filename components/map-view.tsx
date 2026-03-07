'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

/* FIX MARKER ICON UNTUK NEXT JS */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const routingRef = useRef<any>(null);
  const userLocationRef = useRef<L.LatLng | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;

    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
  };

  // FETCH DATA
  useEffect(() => {
    const fetchPosyandu = async () => {
      const res = await fetch('/api/admin/posyandu');
      const data = await res.json();
      setPosyanduData(data);
    };

    fetchPosyandu();
  }, []);

  // INIT MAP
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;

    const map = L.map('leaflet-map').setView([-6.5740985, 107.7407857], 13);
    mapRef.current = map;

    // const normal = L.tileLayer(
    //   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    // );
    const normal = L.tileLayer(
          "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
          }
        ).addTo(map);

    const satellite = L.tileLayer(
      'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    );

    normal.addTo(map);

    L.control.layers(
      {
        Map: normal,
        Satellite: satellite,
      },
      {}
    ).addTo(map);

    clusterRef.current = L.markerClusterGroup();
    map.addLayer(clusterRef.current);

    userLayerRef.current = L.layerGroup().addTo(map);

    // LOCATE BUTTON
    const locateBtn = new L.Control({ position: 'topleft' });

    locateBtn.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

      div.innerHTML = '📍';
      div.style.background = 'white';
      div.style.padding = '6px';
      div.style.cursor = 'pointer';

      L.DomEvent.on(div, 'click', () => {
        map.locate({ setView: true, maxZoom: 16 });
      });

      return div;
    };

    locateBtn.addTo(map);

    // LOCATION FOUND
    map.on('locationfound', (e) => {
      if (!userLayerRef.current) return;

      userLayerRef.current.clearLayers();

      userLocationRef.current = e.latlng;

      const radius = e.accuracy || 30;

      L.circle(e.latlng, {
        radius: radius,
        color: 'blue',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
      }).addTo(userLayerRef.current);

      L.marker(e.latlng)
        .addTo(userLayerRef.current)
        .bindPopup('📍 Lokasi Anda')
        .openPopup();

      map.setView(e.latlng, 16);
    });

    map.on('locationerror', () => {
      alert('Tidak dapat mengakses lokasi Anda');
    });

    // LEGEND
    const legend = new L.Control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div');

      div.style.background = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '8px';
      div.style.fontSize = '12px';

      div.innerHTML = `
      <b>Kelurahan</b><br>
      🟠 Pasirkareumbi<br>
      🔴 Soklat<br>
      🟢 Parung<br>
      🔵 Wanareja
      `;

      return div;
    };

    legend.addTo(map);

    // CLOSE ROUTE BUTTON
    const closeRouteBtn = new L.Control({ position: 'topright' });

    closeRouteBtn.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

      div.innerHTML = '❌';
      div.style.background = 'white';
      div.style.padding = '6px';
      div.style.cursor = 'pointer';
      div.title = 'Tutup Rute';

      L.DomEvent.on(div, 'click', () => {
        if (routingRef.current && mapRef.current) {
          mapRef.current.removeControl(routingRef.current);
          routingRef.current = null;
        }
      });

      return div;
    };

    closeRouteBtn.addTo(map);
  }, []);

  // ROUTE FUNCTION
  const createRoute = (lat: number, lng: number) => {
    if (!mapRef.current || !userLocationRef.current) {
      alert('Aktifkan lokasi anda terlebih dahulu');
      return;
    }

    // Hapus route lama
    if (routingRef.current) {
      mapRef.current.removeControl(routingRef.current);
      routingRef.current = null;
    }

    routingRef.current = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocationRef.current.lat, userLocationRef.current.lng),
        L.latLng(lat, lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,

      lineOptions: {
        styles: [
          { color: '#2563eb', weight: 6 },
          { color: '#60a5fa', weight: 3 }
        ]
      }
    }).addTo(mapRef.current);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 300);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // LOAD MARKERS
  useEffect(() => {
    if (!mapRef.current || posyanduData.length === 0) return;

    const cluster = clusterRef.current;
    cluster?.clearLayers();

    const bounds: L.LatLngTuple[] = [];

    posyanduData.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const kelurahanName = item.kelurahan?.nama ?? '';
      const markerColor = getMarkerColor(kelurahanName);

      const marker = L.marker([lat, lng], {
        icon: coloredIcon(markerColor),
      }).bindPopup(`
        <strong>${item.nama}</strong><br/>
        ${item.alamat}<br/>
        ${item.wilayah}, Kelurahan ${kelurahanName}<br/>
        Penanggung Jawab: ${item.penanggungJawab}<br/>
        Kontak: ${item.noHp}<br/>
        Akreditasi: ${item.akreditasi}<br/><br/>

        <button id="route-${item.id}" 
        style="background:#2563eb;color:white;border:none;padding:6px 8px;border-radius:4px;cursor:pointer">
        Rute ke sini
        </button>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`route-${item.id}`);
        if (btn) {
          btn.onclick = () => createRoute(lat, lng);
        }
      });

      marker.bindTooltip(`🏥 ${item.nama}`, {
        direction: 'top',
        offset: [0, -30],
      });

      cluster?.addLayer(marker);
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [posyanduData]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "100vh" : "80vh",
      }}
    >
      {/* FULLSCREEN BUTTON */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          zIndex: 999,
          top: 10,
          right: 100,
          padding: "6px 10px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {isFullscreen ? "⤢ Exit" : "⤢ Fullscreen"}
      </button>

      <div
        // ref={mapContainerRef}
        id="leaflet-map"
        style={{
          height: "100%",
          width: '100%',
        }}
      />
    </div>
  );
}