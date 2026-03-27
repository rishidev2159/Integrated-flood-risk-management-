"use client";

import { useState, useMemo, useEffect } from "react";
import nextDynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
  History
} from "lucide-react";
import { useFloodAnalysis, useAIPrediction, useTrainModel } from "@/hooks/useFloodAnalysis";
import AnalysisCard from "@/components/stats/AnalysisCard";
import AnalyticsHub from "@/components/stats/AnalyticsHub";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { MapMode } from "@/lib/types";
import { formatNumber, formatPercent, cn } from "@/lib/utils";
import { generateFloodReport } from "@/lib/reports";
import { useIsMobile } from "@/hooks/use-mobile";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

const InteractiveMap = nextDynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Initialising spatial engine…</div>,
});

export const dynamic = "force-dynamic";

type ViewMode = "year1" | "year2" | "comparison";

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [projectName, setProjectName] = useState("Loading Project...");
  const [threshold, setThreshold] = useState(19);
  const [draftThreshold, setDraftThreshold] = useState(19);
  const [mapMode, setMapMode] = useState<MapMode>("analysis");
  const [viewMode, setViewMode] = useState<ViewMode>("comparison");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: analysisData, isLoading, isError } = useFloodAnalysis(threshold);
  const { data: predictionData } = useAIPrediction(threshold, aiEnabled && mapMode === "vulnerability_forecast");
  const { mutate: train } = useTrainModel();

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    fetch(`${apiBase}/api/metadata`)
      .then(res => res.json())
      .then(data => setProjectName(data.name || "EcoGuard Analysis"))
      .catch(() => setProjectName("EcoGuard Analysis"));
  }, []);

  const combinedPoints = useMemo(() => {
    if (!analysisData) return [];
    if (mapMode === "vulnerability_forecast" && predictionData) return predictionData.points;
    if (viewMode === "comparison") return analysisData.points;
    
    return analysisData.points.map(p => ({
      ...p,
      status_y2: viewMode === "year1" ? (p.elevation_y1 <= threshold ? "Flooded" : "Safe") : p.status_y2,
      change_analysis: "Stable" as const,
    }));
  }, [analysisData, predictionData, mapMode, viewMode, threshold]);

  const handleRunForecast = () => {
    if (!aiEnabled) {
      train(threshold, {
        onSuccess: () => {
          setAiEnabled(true);
          setMapMode("vulnerability_forecast");
        },
      });
    } else {
      setMapMode("vulnerability_forecast");
    }
  };

  const downloadReport = async () => {
    if (!analysisData) return;
    const reportTitle = projectName === "Loading Project..." ? "Flood Analysis Report" : `${projectName} Report`;
    await generateFloodReport("dashboard-workspace", reportTitle);
  };

  return (
    <div id="dashboard-workspace" className="workspace-container">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* 1. LEFT SIDEBAR: Controls */}
      <aside className={`workspace-sidebar workspace-sidebar--left ${!sidebarOpen ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header flex justify-between items-center">
          <div className="brand-compact">
            <span className="brand-logo">🌊</span>
            <h2 className="brand-name">{projectName}</h2>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="mobile-only icon-btn">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <label className="section-label">Analysis Mode</label>
            <Tabs 
              value={mapMode} 
              onValueChange={(v) => v === "vulnerability_forecast" ? handleRunForecast() : setMapMode(v as MapMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis" className="gap-2">
                  <Layers size={14} /> Observations
                </TabsTrigger>
                <TabsTrigger value="vulnerability_forecast" className="gap-2" onClick={handleRunForecast}>
                  <Brain size={14} /> Forecast
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="sidebar-section">
            <label className="section-label">Temporal Perspective</label>
            <Tabs 
              value={viewMode} 
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="year1">2024</TabsTrigger>
                <TabsTrigger value="year2">2025</TabsTrigger>
                <TabsTrigger value="comparison">Delta</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="sidebar-section">
            <div className="flex justify-between items-center mb-4">
              <label className="section-label mb-0">Flood Threshold</label>
              <span className="text-xs font-bold px-2 py-0.5 bg-accent/10 text-accent rounded-full">{draftThreshold}m</span>
            </div>
            <Slider
              value={[draftThreshold]}
              min={5}
              max={35}
              step={0.5}
              onValueChange={([val]) => setDraftThreshold(val)}
              onPointerUp={() => setThreshold(draftThreshold)}
            />
          </div>

          <div className="sidebar-footer">
            <Button 
               onClick={downloadReport} 
               className="w-full bg-accent hover:bg-accent/90"
            >
              <FileDown size={16} className="mr-2" /> Export Intelligence
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. CENTER: Map Viewport */}
      <main className="workspace-main">
        <header className="workspace-top-bar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="desktop-only icon-btn">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <button onClick={() => setMobileMenuOpen(true)} className="mobile-only icon-btn">
            <Menu size={20} />
          </button>
          
          <div className="breadcrumb">
            <MapIcon size={14} className="text-accent" />
            <span>GIS Analysis</span>
            <span className="divider">/</span>
            <span className="current">
              {mapMode === "vulnerability_forecast" ? "Vulnerability Forecast" : 
               (viewMode === "comparison" ? "Temporal Comparison" : `${viewMode === "year1" ? "2024" : "2025"} Observation`)}
            </span>
          </div>

          <div className="top-actions">
            <div className="study-area-badge">
              Vijayawada Region
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="map-container-wrapper">
          <InteractiveMap 
            points={combinedPoints}
            threshold={threshold}
            mode={mapMode}
          />
          
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
