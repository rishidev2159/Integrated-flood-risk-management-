import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { GeoPoint } from "@/lib/types";

interface AnalyticsHubProps {
  points: GeoPoint[];
}

export default function AnalyticsHub({ points }: AnalyticsHubProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="analytics-hub-skeleton" style={{ height: '400px' }} />;
  // 1. Status Distribution (Pie Chart)
  const statusData = [
    { name: "Stable", value: points.filter((p) => p.change_analysis === "Stable").length, color: "#94a3b8" },
    { name: "Worsened", value: points.filter((p) => p.change_analysis === "Worsened").length, color: "#ef4444" },
    { name: "Improved", value: points.filter((p) => p.change_analysis === "Improved").length, color: "#22c55e" },
  ].filter(d => d.value > 0);

  // 2. Delta Distribution (Histogram-like Bar Chart)
  // Buckets: <-1m, -1to-0.5, -0.5to0.5 (Stable), 0.5to1, >1m
  const deltaBuckets = [
    { range: "< -1m", count: points.filter(p => p.elevation_delta < -1).length },
    { range: "-1m to -0.5m", count: points.filter(p => p.elevation_delta >= -1 && p.elevation_delta < -0.5).length },
    { range: "Stable (±0.5m)", count: points.filter(p => p.elevation_delta >= -0.5 && p.elevation_delta <= 0.5).length },
    { range: "0.5m to 1m", count: points.filter(p => p.elevation_delta > 0.5 && p.elevation_delta <= 1).length },
    { range: "> 1m", count: points.filter(p => p.elevation_delta > 1).length },
  ];

  return (
    <div className="analytics-hub">
      {/* Pie Chart Section */}
      <div className="analytics-section">
        <label className="section-label">Terrain Stability Breakdown</label>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
                itemStyle={{ color: "var(--text-main)", fontSize: "12px" }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px", color: "var(--text-muted)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="analytics-section">
        <label className="section-label">Elevation Delta Index</label>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deltaBuckets} layout="vertical" margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="range" 
                type="category" 
                tick={{ fill: "var(--text-muted)", fontSize: 9 }} 
                width={80}
              />
              <Tooltip 
                cursor={{ fill: "var(--accent-glow)" }}
                contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="chart-caption">Y1 - Y2 Elevation Delta (Numeric Shift)</p>
      </div>
    </div>
  );
}
