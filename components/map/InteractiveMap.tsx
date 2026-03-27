"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { changeToColor, probabilityToColor } from "@/lib/utils";
import type { AIPredictionPoint, GeoPoint, MapMode } from "@/lib/types";
import MapLegend from "./MapLegend";

interface Props {
  points: GeoPoint[] | AIPredictionPoint[];
  mode: MapMode;
  threshold: number;
}

export default function InteractiveMap({ points, mode, threshold }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<L.Canvas | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const canvas = L.canvas({ padding: 0.5 });
    canvasRef.current = canvas;

    const map = L.map(containerRef.current, {
      center: [16.5, 80.7],  // Andhra Pradesh, India — matches real data coords
      zoom: 12,
      renderer: canvas,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
      crossOrigin: "anonymous",
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render points whenever data or threshold changes
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !points.length) return;

    layer.clearLayers();

    points.forEach((pt) => {
      let color: string;

      if (mode === "vulnerability_forecast") {
        const p = pt as AIPredictionPoint;
        color = probabilityToColor(p.flood_probability);
      } else {
        const p = pt as GeoPoint;
        color = changeToColor(p.change_analysis);
      }

      const circle = L.circleMarker([pt.lat, pt.lng], {
        radius: 3,
        fillColor: color,
        color: "transparent",
        fillOpacity: 0.8,
        renderer: canvasRef.current ?? undefined,
      });

      if (mode === "vulnerability_forecast") {
        const p = pt as AIPredictionPoint;
        circle.bindTooltip(`Risk: ${p.risk_level}`, { sticky: true });
        circle.bindPopup(`
          <div class="map-popup">
            <h4>Risk Profile</h4>
            <p><b>Probability:</b> ${(p.flood_probability * 100).toFixed(1)}%</p>
            <p><b>Risk Level:</b> ${p.risk_level}</p>
            <p><b>Elevation:</b> ${p.elevation_y2}m</p>
            <hr />
            <small>Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng.toFixed(4)}</small>
          </div>
        `);
      } else {
        const p = pt as GeoPoint;
        circle.bindTooltip(`${p.change_analysis}`, { sticky: true });
        circle.bindPopup(`
          <div class="map-popup">
            <h4>Site Analysis</h4>
            <p><b>Change:</b> ${p.change_analysis}</p>
            <p><b>Delta:</b> ${p.elevation_delta.toFixed(2)}m</p>
            <p><b>2024 Elev:</b> ${p.elevation_y1}m</p>
            <p><b>2025 Elev:</b> ${p.elevation_y2}m</p>
            <p><b>Current Status:</b> ${p.status_y2}</p>
            <hr />
            <small>Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng.toFixed(4)}</small>
          </div>
        `);
      }

      layer.addLayer(circle);
    });
  }, [points, mode, threshold]);

  return (
    <div className="map-container">
      <div ref={containerRef} className="map-viewport" />
      <MapLegend mode={mode} />
    </div>
  );
}
