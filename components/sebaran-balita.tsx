'use client';

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// tipe data dari API
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
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch data API
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

  // Init map
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const map = L.map("map-sebaran-balita").setView(
      [-6.5740985, 107.7407857],
      13
    );
    mapRef.current = map;

    // Google Maps Tile
    L.tileLayer(
      "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }
    ).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;
  }, []);

  // Render marker
  useEffect(() => {
    if (!mapRef.current || balitaData.length === 0) return;

    const markerGroup = markerGroupRef.current;
    markerGroup?.clearLayers();

    balitaData.forEach((b) => {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      // Tentukan warna ikon berdasarkan status Gizi
      let iconColor = "grey";

      const gizi = b.statusGiziTerbaru?.kategoriGizi?.toLowerCase() || "";
      const stunting =
        b.statusGiziTerbaru?.statusStunting?.toLowerCase() || "";

      if (gizi.includes("baik")) iconColor = "green";
      else if (gizi.includes("lebih")) iconColor = "blue";
      else if (gizi.includes("kurang")) iconColor = "orange";
      else if (gizi.includes("buruk")) iconColor = "red";

      if (stunting.includes("pendek")) iconColor = "violet";

      const marker = L.marker([lat, lng], {
        icon: createIcon(iconColor),
      });

      marker.bindPopup(`
        <div>

          <strong>Status Gizi:</strong> <br/>
          ${b.statusGiziTerbaru?.kategoriGizi ?? "-"} <br/>
          <strong>Stunting:</strong> ${b.statusGiziTerbaru?.statusStunting ?? "-"} <br/><br/>

          <strong>Posyandu:</strong><br/>
          ${b.posyandu?.nama ?? "-"}<br/>
          Kelurahan ${b.posyandu?.kelurahan?.nama ?? "-"}<br/>
          Kader: ${b.kader?.nama ?? "-"}
        </div>
      `);

      marker.bindTooltip(b.nama, {
        permanent: true,
        direction: "top",
        offset: [0, -35],
      });

      markerGroup?.addLayer(marker);
    });
  }, [balitaData]);

  return (
    <div
      id="map-sebaran-balita"
      className="rounded-md border"
      style={{ height: "70vh", width: "100%" }}
    />
  );
}
