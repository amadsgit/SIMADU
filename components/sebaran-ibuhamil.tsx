'use client';

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored icons
const createIcon = (color: string) =>
  L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

// ==============================
// TIPE DATA
// ==============================
type Kader = {
  id: number;
  nama: string;
  noHp?: string;
};

type PemeriksaanIbuHamil = {
  id: number;
  tanggal: string;
  usiaKehamilan: number;
  kaderPemeriksa: Kader | null;
};

type Posyandu = {
  id: number;
  nama: string;
  alamat: string;
  wilayah: string;
  kelurahan: { id: number; nama: string };
};

type IbuHamil = {
  id: number;
  nama: string;
  nik: string;
  alamat: string;
  latitude: number;
  longitude: number;

  tanggalHPHT: string | null;
  tanggalHPL: string | null;

  posyandu: Posyandu | null;
  kader: Kader | null;

  pemeriksaanTerbaru: PemeriksaanIbuHamil | null;
};

// helper: format tanggal ke format Indonesia (DD MMMM YYYY)
function formatTanggalIndo(tgl: string | Date | null | undefined): string {
  if (!tgl) return "-";

  const date = typeof tgl === "string" ? new Date(tgl) : tgl;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function SebaranIbuHamilMap() {
  const [ibuData, setIbuData] = useState<IbuHamil[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/maps/sebaranIbuHamil");
        const json = await res.json();
        setIbuData(json.data || []);
      } catch (error) {
        console.error("Gagal fetch sebaran ibu hamil:", error);
      }
    };

    fetchData();
  }, []);

  // Init map
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const map = L.map("map-sebaran-ibu").setView(
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

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;
  }, []);

  // Render markers
  useEffect(() => {
    if (!mapRef.current || ibuData.length === 0) return;

    const markerGroup = markerGroupRef.current;
    markerGroup?.clearLayers();

    ibuData.forEach((b) => {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);
      if (isNaN(lat) || isNaN(lng)) return;


      let iconColor = "green"; // default

      if (b.tanggalHPL) {
        const today = new Date();
        const hplDate = new Date(b.tanggalHPL);

        const diffMs = hplDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // selisih hari

        if (diffDays <= 30) {
          iconColor = "red";
        } else if (diffDays <= 112) {
          iconColor = "orange";
        } else {
          iconColor = "green";
        }
      }

      const pemeriksa = b.pemeriksaanTerbaru?.kaderPemeriksa;

      const marker = L.marker([lat, lng], {
        icon: createIcon(iconColor),
      });

      marker.bindPopup(`
        <div>
          Alamat: ${b.alamat}<br/>
          <strong>HPL:</strong> ${formatTanggalIndo(b.tanggalHPL)}<br/><br/>

          <strong>Posyandu:</strong><br/>
          ${b.posyandu?.nama ?? "-"}<br/>
          Kelurahan: ${b.posyandu?.kelurahan?.nama ?? "-"}<br/>
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
  }, [ibuData]);

  return (
    <div
      id="map-sebaran-ibu"
      className="rounded-md border"
      style={{ height: "80vh", width: "100%" }}
    />
  );
}
