'use client';

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker colors
const createIcon = (color: string) =>
  L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

type StatusGizi = {
  kategoriGizi: string | null;
  statusStunting: string | null;
};

type Posyandu = {
  id: number;
  nama: string;
  alamat: string;
  wilayah: string;
  kelurahan: { id: number; nama: string };
};

type Kader = {
  id: number;
  nama: string;
};

type Pemeriksaan = {
  tanggal: string;
  beratBadan: number;
  tinggiBadan: number;
  kaderPemeriksa: Kader | null;
};

type Balita = {
  id: number;
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  latitude: number;
  longitude: number;
  posyandu: Posyandu | null;
  kader: Kader | null;
  pemeriksaanTerbaru: Pemeriksaan | null;
  statusGiziTerbaru: StatusGizi | null;
};

export default function SebaranBalitaMap() {

  const [balitaData, setBalitaData] = useState<Balita[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showMarker, setShowMarker] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true); // AUTO AKTIF

  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const heatAnimationRef = useRef<NodeJS.Timeout | null>(null);

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
    const fetchBalita = async () => {
      try {
        const res = await fetch("/api/maps/sebaranBalita");
        const json = await res.json();
        setBalitaData(json.data || []);
      } catch (error) {
        console.error("Gagal fetch sebaran balita:", error);
      }
    };

    fetchBalita();
  }, []);

  // INIT MAP
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const map = L.map("map-sebaran-balita").setView(
      [-6.5740985, 107.7407857],
      13
    );

    mapRef.current = map;

    L.tileLayer(
      "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }
    ).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);

  }, []);

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

  // RENDER DATA
  useEffect(() => {

    if (!mapRef.current) return;

    const map = mapRef.current;

    // CEK SIZE MAP AGAR TIDAK 0
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) return;

    const markerGroup = markerGroupRef.current;

    if (markerGroup) markerGroup.clearLayers();

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (heatAnimationRef.current) {
      clearInterval(heatAnimationRef.current);
    }

    const heatPoints: any[] = [];

    balitaData.forEach((b) => {

      const lat = Number(b.latitude);
      const lng = Number(b.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const gizi = b.statusGiziTerbaru?.kategoriGizi?.toLowerCase() || "";
      const stunting =
        b.statusGiziTerbaru?.statusStunting?.toLowerCase() || "";

      // HEATMAP STUNTING
      if (stunting.includes("pendek")) {
        heatPoints.push([lat, lng, 1]);
      }

      if (!showMarker) return;

      let iconColor = "grey";

      if (gizi.includes("gizi baik")) iconColor = "blue";
      else if (gizi.includes("gizi lebih")) iconColor = "orange";
      else if (gizi.includes("gizi kurang")) iconColor = "orange";
      else if (gizi.includes("gizi buruk")) iconColor = "red";

      if (stunting.includes("pendek")) iconColor = "red";

      const marker = L.marker([lat, lng], {
        icon: createIcon(iconColor),
      });

      marker.bindPopup(`
        <div>
          <strong>Status Gizi:</strong><br/>
          ${b.statusGiziTerbaru?.kategoriGizi ?? "-"}<br/>

          <strong>Stunting:</strong>
          ${b.statusGiziTerbaru?.statusStunting ?? "-"}<br/><br/>

          <strong>Posyandu:</strong><br/>
          ${b.posyandu?.nama ?? "-"}<br/>
          Kelurahan ${b.posyandu?.kelurahan?.nama ?? "-"}<br/>
          Kader: ${b.kader?.nama ?? "-"}
        </div>
      `);

      marker.bindTooltip("👶 Balita", {
        permanent: true,
        direction: "top",
        offset: [0, -35],
      });

      markerGroup?.addLayer(marker);

    });

    // PAKSA LEAFLET HITUNG SIZE
    map.invalidateSize();

    // HEATMAP
    if (showHeatmap && heatPoints.length > 0) {

      setTimeout(() => {

        if (!mapRef.current) return;

        const heatLayer = (L as any).heatLayer(heatPoints, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
        });

        heatLayer.addTo(mapRef.current);
        heatLayerRef.current = heatLayer;

        // ANIMASI KEDIP
        let radius = 35;
        let grow = true;

        heatAnimationRef.current = setInterval(() => {

          if (!heatLayerRef.current) return;

          if (grow) {
            radius += 5;
            if (radius >= 60) grow = false;
          } else {
            radius -= 5;
            if (radius <= 35) grow = true;
          }

          heatLayerRef.current.setOptions({
            radius: radius,
          });

        }, 400);

      }, 200);
    }

  }, [balitaData, showMarker, showHeatmap]);

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
          right: 10,
          padding: "6px 10px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {isFullscreen ? "⤢ Exit" : "⤢ Fullscreen"}
      </button>

      {/* CONTROL */}
      <div
        style={{
          position: "absolute",
          zIndex: 999,
          top: 10,
          left: 10,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "14px",
        }}
      >
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={showMarker}
            onChange={(e) => setShowMarker(e.target.checked)}
          />
          {" "}Marker Balita
        </label>

        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          {" "}Heatmap Stunting
        </label>
      </div>

      {/* MAP */}
      <div
        id="map-sebaran-balita"
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}