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
  riverPoints?: FloodPoint[];
  selectedPoint?: FloodPoint | null;
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

const getFloodColor = (clearance: number) => {
  if (clearance < 1.0) return "#ef4444"; // Red (High Risk - Critical)
  if (clearance < 3.0) return "#eab308"; // Yellow (Moderate Risk)
  return "#22c55e"; // Green (Safe Zone)
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

function FocusHandler({ selectedPoint }: { selectedPoint: FloodPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoint) {
      map.flyTo([selectedPoint.latitude, selectedPoint.longitude], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedPoint, map]);

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
  isSelected,
}: {
  center: [number, number];
  radius: number;
  color: string;
  children: React.ReactNode;
  isSelected?: boolean;
}) {
  const markerRef = useRef<L.CircleMarker | null>(null);

  // 🔥 Force Leaflet to update radius
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setRadius(radius);
    }
  }, [radius]);

  // 🔥 Auto-open popup when selected
  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

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

export default function MapComponent({ points, riverPoints = [], selectedPoint = null }: MapProps) {
  const [zoom, setZoom] = useState(MAP_CONFIG.ZOOM);

  // ✅ Derived value (no need for useState)
  const radius = useMemo(() => computeRadius(zoom), [zoom]);

  const allPoints = useMemo(() => [...points, ...riverPoints], [points, riverPoints]);

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
        <FitBounds points={allPoints} />
        <ZoomController onZoomChange={setZoom} />
        <FocusHandler selectedPoint={selectedPoint} />

        {/* Risk Markers */}
        {points.map((pt, idx) => (
            <ResponsiveCircleMarker
              key={`risk-${pt.id || idx}-${zoom}`}
              center={[pt.latitude, pt.longitude]}
              radius={radius}
              color={getFloodColor(pt.river_clearance ?? 0)}
              isSelected={selectedPoint?.id === pt.id}
            >
            <Popup autoPan={false}>
              <div className="text-slate-900 p-1">
                <p className="font-bold border-b mb-1 pb-1">
                  Site Data
                </p>

                <div className="text-xs space-y-1">
                  <p>
                    Elevation:{" "}
                    <strong>{pt.elevation_baseline}m</strong>
                  </p>

                  <p>
                    Clearance:{" "}
                    <strong className={(pt.river_clearance ?? 0) < 1 ? "text-red-600" : (pt.river_clearance ?? 0) < 3 ? "text-yellow-600" : "text-green-600"}>
                      {Math.abs(pt.river_clearance || 0).toFixed(1)}m
                    </strong>
                    <span className="text-[8px] text-slate-400 ml-1">
                      {(pt.river_clearance || 0) < 0 ? "(Below River)" : "(Above River)"}
                    </span>
                  </p>

                  <p>
                    Distance to River:{" "}
                    <strong>
                      {pt.distance_to_river_m?.toFixed(0) || 0}m
                    </strong>
                  </p>

                  <p>
                    Risk:{" "}
                    <span
                      className={
                        (pt.river_clearance ?? 0) < 1
                          ? "text-red-600"
                          : (pt.river_clearance ?? 0) < 3
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }
                    >
                      {pt.dynamic_risk_status || pt.risk_status}
                    </span>
                  </p>

                  <p className="text-[10px] text-slate-400 mt-2 flex justify-between">
                    <span>River Ref:</span>
                    <span>{pt.nearest_river_elevation?.toFixed(1) || 0}m</span>
                  </p>

                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 pt-1 border-t mt-2">
                    Index Comparison
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1 py-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase font-bold">Baseline</span>
                      <span className="font-bold text-slate-700 text-sm tracking-tight">{pt.baseline_index}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-2">
                      <span className="text-[8px] text-sky-500 uppercase font-bold">Current</span>
                      <span className="font-black text-sky-600 text-sm tracking-tight">{pt.current_index}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </ResponsiveCircleMarker>
        ))}

        {/* River Markers */}
        {riverPoints.map((pt, idx) => (
          <ResponsiveCircleMarker
            key={`river-${pt.id || idx}`}
            center={[pt.latitude, pt.longitude]}
            radius={radius}
            color="#0ea5e9"
          >
            <Popup autoPan={false}>
              <div className="text-slate-900 p-1">
                <p className="font-bold border-b mb-1 pb-1">
                  Krishna River Point
                </p>
                <div className="text-xs space-y-1">
                  <p>Elevation: <strong>{pt.elevation_current}m</strong></p>
                  <p className="text-[10px] text-slate-400 mt-2">Index: {pt.baseline_index}</p>
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
          <span>High Risk (&lt;1.0m Clearance)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
          <span>Moderate Risk (1.0m - 3.0m)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>Safe Zone (&gt;3.0m)</span>
        </div>

        <div className="flex items-center space-x-2 border-t pt-2 mt-2">
          <span className="w-4 h-4 rounded-full bg-[#0ea5e9]"></span>
          <span>Krishna River Data</span>
        </div>
      </div>
    </div>
  );
}