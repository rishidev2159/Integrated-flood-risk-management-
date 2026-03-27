"use client";

import { changeToColor, probabilityToColor } from "@/lib/utils";
import type { AIPredictionPoint, GeoPoint, MapMode } from "@/lib/types";

interface Props {
  mode: MapMode;
}

export default function MapLegend({ mode }: Props) {
  if (mode === "ai_prediction") {
    return (
      <div className="map-legend">
        <p className="legend-title">AI Flood Probability</p>
        {[
          { label: "Low (<25%)", color: probabilityToColor(0.1) },
          { label: "Moderate (25–50%)", color: probabilityToColor(0.35) },
          { label: "High (50–75%)", color: probabilityToColor(0.6) },
          { label: "Critical (>75%)", color: probabilityToColor(0.9) },
        ].map((item) => (
          <div key={item.label} className="legend-row">
            <span className="legend-dot" style={{ background: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="map-legend">
      <p className="legend-title">Change Analysis</p>
      {[
        { label: "Stable / Safe", color: "#3b82f6" },
        { label: "Worsened (new flood risk)", color: "#ef4444" },
        { label: "Improved (recovered)", color: "#22c55e" },
      ].map((item) => (
        <div key={item.label} className="legend-row">
          <span className="legend-dot" style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
