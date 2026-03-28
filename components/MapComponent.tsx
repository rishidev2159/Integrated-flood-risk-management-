"use client";

import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FloodPoint } from "@/hooks/useSeaLevelData";
import { useEffect, useState, useMemo, useRef } from "react";

interface MapProps {
  points: FloodPoint[];
}

/* ================================
   CONFIG
================================ */
const MAP_CONFIG = {
  CENTER: [16.5062, 80.648] as [number, number],
  ZOOM: 13,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
};

const RADIUS_CONFIG = {
  MIN_RADIUS: 2,
  MAX_RADIUS: 20,
};

/* ================================
   UTILS
================================ */

const getFloodColor = (elevation: number) => {
  if (elevation < 19) return "#ef4444"; // Red (High)
  if (elevation <= 21) return "#eab308"; // Yellow (Moderate)
  return "#22c55e"; // Green (Safe)
};

// ✅ Smooth linear scaling (stable & predictable)
const zoomRadiusMap: Record<number, number> = {
  15: 4.5,
  16: 9,
  17: 17,
  18: 26,
};

const computeRadius = (zoom: number) => {
  if (zoom <= 15) return 4.5;
  if (zoom >= 18) return 26;

  return zoomRadiusMap[Math.round(zoom)] ?? 4;
};
/* ================================
   HELPERS
================================ */

function FitBounds({ points }: { points: FloodPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = L.latLngBounds(
      points.map((p) => [p.latitude, p.longitude])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points]);

  return null;
}

function ZoomController({
  onZoomChange,
}: {
  onZoomChange: (z: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const update = () => onZoomChange(map.getZoom());

    update(); // initial sync
    map.on("zoomend", update);

    return () => {
      map.off("zoomend", update);
    };
  }, [map, onZoomChange]);

  return null;
}

/* ================================
   🔥 RESPONSIVE MARKER (KEY FIX)
================================ */

function ResponsiveCircleMarker({
  center,
  radius,
  color,
  children,
}: {
  center: [number, number];
  radius: number;
  color: string;
  children: React.ReactNode;
}) {
  const markerRef = useRef<L.CircleMarker | null>(null);

  // 🔥 Force Leaflet to update radius
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setRadius(radius);
    }
  }, [radius]);

  return (
    <CircleMarker
      ref={markerRef}
      center={center}
      radius={radius}
      pathOptions={{
        fillColor: color,
        fillOpacity: 0.9,
        color: "transparent",
        weight: 1,
      }}
    >
      {children}
    </CircleMarker>
  );
}

/* ================================
   MAIN COMPONENT
================================ */

export default function MapComponent({ points }: MapProps) {
  const [zoom, setZoom] = useState(MAP_CONFIG.ZOOM);

  // ✅ Derived value (no need for useState)
  const radius = useMemo(() => computeRadius(zoom), [zoom]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
      <MapContainer
        center={MAP_CONFIG.CENTER}
        zoom={MAP_CONFIG.ZOOM}
        minZoom={MAP_CONFIG.MIN_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        {/* Base map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />

        {/* Terrain overlay */}
        <TileLayer
          attribution="Tiles © Esri — Source: Esri, USGS, NOAA"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}"
          opacity={0.6}
          crossOrigin="anonymous"
        />

        {/* Helpers */}
        <FitBounds points={points} />
        <ZoomController onZoomChange={setZoom} />

        {/* Markers */}
        {points.map((pt, idx) => (
          <ResponsiveCircleMarker
            key={pt.id || idx}
            center={[pt.latitude, pt.longitude]}
            radius={radius}
            color={getFloodColor(pt.elevation_current)}
          >
            <Popup>
              <div className="text-slate-900 p-1">
                <p className="font-bold border-b mb-1 pb-1">
                  Site Data
                </p>

                <div className="text-xs space-y-1">
                  <p>
                    Elevation:{" "}
                    <strong>{pt.elevation_current}m</strong>
                  </p>

                  <p>
                    Risk:{" "}
                    <span
                      className={
                        pt.elevation_current < 21
                          ? "text-red-600"
                          : pt.elevation_current < 23
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }
                    >
                      {pt.risk_status}
                    </span>
                  </p>

                  <p className="text-[10px] text-slate-400 mt-2">
                    Baseline index: {pt.baseline_index}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Current index: {pt.current_index}
                  </p>
                </div>
              </div>
            </Popup>
          </ResponsiveCircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-1000 bg-white/95 text-slate-900 rounded-2xl shadow-2xl p-4 text-[10px] sm:text-xs space-y-3 border border-white/20 backdrop-blur-sm transition-all hover:scale-105">
        <p className="font-bold text-sm border-b pb-1">
          Risk Legend
        </p>

        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-red-500"></span>
          <span>High Risk (&lt;19m)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
          <span>Moderate Risk (19m-21m)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>Safe Zone (&gt;21m)</span>
        </div>
      </div>
    </div>
  );
}