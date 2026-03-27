"use client";

import { useState, useMemo, useEffect } from "react";
import nextDynamic from "next/dynamic";
import {
  Brain,
  Layers,
  RefreshCw,
  Sliders,
  Loader2,
  AlertCircle,
  FileDown,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Map as MapIcon,
} from "lucide-react";
import { useFloodAnalysis, useAIPrediction, useTrainModel } from "@/hooks/useFloodAnalysis";
import AnalysisCard from "@/components/stats/AnalysisCard";
import AnalyticsHub from "@/components/stats/AnalyticsHub";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { MapMode } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { generateFloodReport } from "@/lib/reports";

// Dynamic import for Leaflet - SSR disabled
const InteractiveMap = nextDynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Initialising spatial engine…</div>,
});

export const dynamic = "force-dynamic";

type ViewMode = "year1" | "year2" | "comparison";

export default function DashboardPage() {
  const [projectName, setProjectName] = useState("Loading Project...");
  const [threshold, setThreshold] = useState(19);
  const [draftThreshold, setDraftThreshold] = useState(19);
  const [mapMode, setMapMode] = useState<MapMode>("analysis");
  const [viewMode, setViewMode] = useState<ViewMode>("comparison");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: analysisData, isLoading, isError } = useFloodAnalysis(threshold);
  const { data: predictionData } = useAIPrediction(threshold, aiEnabled && mapMode === "ai_prediction");
  const { mutate: train } = useTrainModel();

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    fetch(`${apiBase}/api/metadata`)
      .then(res => res.json())
      .then(data => setProjectName(data.name || "EcoGuard Analysis"))
      .catch(() => setProjectName("EcoGuard Analysis"));
  }, []);

  const filteredPoints = useMemo(() => {
    if (!analysisData) return [];
    if (mapMode === "ai_prediction" && predictionData) return predictionData.points;
    if (viewMode === "comparison") return analysisData.points;
    
    return analysisData.points.map(p => ({
      ...p,
      status_y2: viewMode === "year1" ? (p.elevation_y1 <= threshold ? "Flooded" : "Safe") : p.status_y2,
      change_analysis: "Stable" as const,
    }));
  }, [analysisData, predictionData, mapMode, viewMode, threshold]);

  const handleRunAI = () => {
    if (!aiEnabled) {
      train(threshold, {
        onSuccess: () => {
          setAiEnabled(true);
          setMapMode("ai_prediction");
        },
      });
    } else {
      setMapMode("ai_prediction");
    }
  };

  const downloadReport = async () => {
    if (!analysisData) return;
    await generateFloodReport("dashboard-workspace", "Vijayawada Flood Analysis");
  };

  return (
    <div id="dashboard-workspace" className="workspace-container">
      {/* 1. LEFT SIDEBAR: Controls */}
      <aside className={`workspace-sidebar workspace-sidebar--left ${!sidebarOpen ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-compact">
            <span className="brand-logo">🌊</span>
            <h2 className="brand-name">{projectName}</h2>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <label className="section-label">Temporal Perspective</label>
            <div className="toggle-group">
              {(["comparison", "year1", "year2"] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`toggle-btn ${viewMode === m ? "active" : ""}`}
                >
                  {m === "year1" ? "2024" : m === "year2" ? "2025" : "Delta Map"}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <label className="section-label">Flood Threshold</label>
              <span className="value-tag">{draftThreshold}m</span>
            </div>
            <input
              type="range" min={5} max={35} step={0.5}
              value={draftThreshold}
              onChange={(e) => setDraftThreshold(Number(e.target.value))}
              onMouseUp={() => setThreshold(draftThreshold)}
              className="custom-range"
            />
          </div>

          <div className="sidebar-footer">
            <button onClick={downloadReport} className="btn-primary w-full">
              <FileDown size={16} /> Export Analysis
            </button>
          </div>
        </div>
      </aside>

      {/* 2. CENTER: Map Viewport */}
      <main className="workspace-main">
        <header className="workspace-top-bar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-btn">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <div className="breadcrumb">
            <MapIcon size={14} className="text-accent" />
            <span>GIS Analysis</span>
            <span className="divider">/</span>
            <span className="current">{viewMode === "comparison" ? "Temporal Comparison" : `${viewMode === "year1" ? "2024" : "2025"} Observation`}</span>
          </div>

          <div className="top-actions">
            <div className="study-area-badge">
              Vijayawada Region
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="map-container-wrapper">
          <InteractiveMap points={filteredPoints} mode="analysis" threshold={threshold} />
          
          {isLoading && (
            <div className="loading-overlay">
              <div className="loader-card">
                <Loader2 size={24} className="spin text-accent" />
                <span>Synchronizing GIS Data...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: Analytics Hub */}
      <aside className="workspace-sidebar workspace-sidebar--right">
        <div className="sidebar-header">
          <h3 className="section-label">Flood Risk Analytics</h3>
        </div>

        <div className="sidebar-content">
          {analysisData?.summary && (
            <>
              <div className="risk-gauge-container">
                <div className="gauge-outer">
                  <div 
                    className="gauge-inner" 
                    style={{ transform: `rotate(${(analysisData.summary.flood_risk_percentage * 1.8) - 90}deg)` }}
                  />
                  <div className="gauge-center">
                    <span className="gauge-val">{analysisData.summary.flood_risk_percentage}%</span>
                    <span className="gauge-label">Inundated</span>
                  </div>
                </div>
              </div>

              <AnalyticsHub points={analysisData.points} />

              <div className="metrics-grid mt-4">
                <div className="metric-box border-red">
                  <span className="m-label text-red">Worsened Terrain</span>
                  <div className="m-row">
                    <TrendingDown size={14} className="text-red" />
                    <span className="m-val">{formatNumber(analysisData.summary.newly_vulnerable_points)} pts</span>
                  </div>
                </div>
                <div className="metric-box border-green">
                  <span className="m-label text-green">Stable / Improved</span>
                  <div className="m-row">
                    <TrendingUp size={14} className="text-green" />
                    <span className="m-val">{formatNumber(analysisData.summary.improved_points + analysisData.summary.stable_points)} pts</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isError && (
            <div className="error-card">
              <AlertCircle size={20} />
              <p>GIS Database connection lost.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
