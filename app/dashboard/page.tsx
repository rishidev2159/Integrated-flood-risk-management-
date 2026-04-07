"use client";
import { useState, useMemo } from "react";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useFloodPoints, useRiskSummary, useRiverPoints, useTotalCounts } from "@/hooks/useSeaLevelData";
import {
  Activity,
  AlertTriangle,
  Map as MapIcon,
  TrendingUp,
  FileText,
  ArrowLeft,
  Database
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RiverElevationChart } from "@/components/charts/RiverElevationChart";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <MapIcon className="w-12 h-12" />
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">Initializing Spatial Engine...</span>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  const { data: points = [], isLoading: pointsLoading } = useFloodPoints();
  const { data: summary = [], isLoading: summaryLoading } = useRiskSummary();
  const { data: riverPoints = [] } = useRiverPoints();
  const { data: dbCounts } = useTotalCounts();
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Area Calculation (Frontend Fallback)
  const calculatedArea = useMemo(() => {
    if (!points?.length) return 0;
    const lats = points.map(p => p.latitude);
    const lngs = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // at Vijayawada (16.5N), 1deg lat ~111km, 1deg lng ~106km
    const kmH = (maxLat - minLat) * 111.12;
    const kmW = (maxLng - minLng) * 106.3;
    return Math.max(kmH * kmW, 0.05); // min 0.05km for points close together
  }, [points]);

  // River-Relative Risk Enrichment
  const enrichedPoints = useMemo(() => {
    if (!points?.length) return [];
    
    return points.map(pt => {
      // 🚀 Use SQL-calculated spatial attributes if present (High Performance)
      if (pt.river_clearance !== undefined) {
        return {
          ...pt,
          dynamic_risk_status: pt.risk_status
        };
      }

      // 🔄 Fallback: Frontend spatial logic (if view hasn't updated yet)
      if (!riverPoints?.length) return pt;
      
      let minDist = Infinity;
      let nearestRiverPt = riverPoints[0];
      
      for (const rpt of riverPoints) {
        const dLat = pt.latitude - rpt.latitude;
        const dLng = pt.longitude - rpt.longitude;
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < minDist) {
          minDist = distSq;
          nearestRiverPt = rpt;
        }
      }

      const dx = (pt.longitude - nearestRiverPt.longitude) * 106300;
      const dy = (pt.latitude - nearestRiverPt.latitude) * 111120;
      const distanceMeters = Math.sqrt(dx * dx + dy * dy);
      const clearance = pt.elevation_baseline - nearestRiverPt.elevation_current;
      
      let status = "Safe Zone";
      if (clearance < 1.0) status = "High Risk (Critical)";
      else if (clearance < 3.0) status = "Moderate Risk";

      return {
        ...pt,
        river_clearance: clearance,
        nearest_river_elevation: nearestRiverPt.elevation_current,
        distance_to_river_m: distanceMeters,
        dynamic_risk_status: status
      };
    });
  }, [points, riverPoints]);

  const riskCounts = useMemo(() => {
    const counts = { high: 0, moderate: 0, safe: 0 };
    enrichedPoints.forEach(p => {
      if (p.dynamic_risk_status?.includes("High")) counts.high++;
      else if (p.dynamic_risk_status?.includes("Moderate")) counts.moderate++;
      else counts.safe++;
    });
    return counts;
  }, [enrichedPoints]);

  const total = enrichedPoints.length;
  const highRisk = riskCounts.high;
  const modRisk = riskCounts.moderate;
  const safe = riskCounts.safe;

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 2xl:p-16 transition-colors duration-300 print:bg-white print:text-black print:p-0">
      <div className="max-w-[1800px] 2xl:max-w-[1920px] mx-auto relative z-10 space-y-8 sm:space-y-12 2xl:space-y-16 print:space-y-6">

        {/* Print-Only Academic Header */}
        <div className="hidden print:block border-b-2 border-slate-200 pb-6 mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Integrated Flood Risk Management</h1>
          <p className="text-xl font-bold text-slate-600 mb-4 tracking-wide italic">A SQL and GIS Based Approach</p>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>Flood Risk Intelligence System</span>
            <span>Research Analysis Report</span>
          </div>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-accent transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Ingestion
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">
                Integrated Flood Risk <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8 font-serif italic text-4xl sm:text-5xl ml-1">Management</span>
              </h1>
              <p className="text-lg font-bold text-slate-500 tracking-tight pl-1">A SQL and GIS Based Approach</p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest pt-2">Spatial Intelligence Dashboard · Vijayawada, AP</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto">
            <ThemeToggle />
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-sm transition-all text-xs font-black uppercase tracking-widest"
            >
              <FileText className="w-4 h-4" />
              Report
            </button>
          </div>
        </header>

        <div id="report-content" className="space-y-8 sm:space-y-12 2xl:space-y-16 print:space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 print:grid-cols-5">
            <StatCard title="Points Analyzed" value={(dbCounts?.elevation || total).toLocaleString()} icon={<Activity className="w-4 h-4 text-blue-500" />} subtitle="Total Ingested Nodes" />
            <StatCard title="River Nodes" value={(dbCounts?.river || riverPoints.length).toLocaleString()} icon={<Database className="w-4 h-4 text-sky-500" />} subtitle="Krishna Dataset" />
            <StatCard title="High Risk" value={highRisk.toLocaleString()} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} color="text-red-500" border="border-red-500/20" subtitle="Clearance < 1.0m" />
            <StatCard title="Safety Index" value={`${total > 0 ? ((safe / total) * 100).toFixed(1) : 0}%`} icon={<Activity className="w-4 h-4 text-green-500" />} color="text-green-500" border="border-green-500/20" subtitle="Clearance > 3.0m" />
            <StatCard title="Analyzed Area" value={`${calculatedArea.toFixed(2)} km²`} icon={<MapIcon className="w-4 h-4 text-purple-500" />} subtitle="Spatial Hull Coverage" />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:grid-cols-1 print:gap-12">
            <div className="lg:col-span-8 xl:col-span-9 h-[450px] sm:h-[600px] lg:h-[700px] print:h-[180mm] map-container">
              <MapComponent points={enrichedPoints} riverPoints={riverPoints} selectedPoint={selectedPoint} />
            </div>

            <aside className="lg:col-span-4 xl:col-span-3 space-y-6 print:lg:col-span-12">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-sm dark:shadow-none h-full max-h-[700px] flex flex-col print:border-0 print:p-0 print:max-h-none">
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-400">
                  <MapIcon className="w-4 h-4 text-accent" />
                  Live Feed
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar print:overflow-visible print:pr-0">
                  {pointsLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                    ))
                  ) : points.length > 0 ? (
                    enrichedPoints.slice(0, 10).map((p: any, i) => (
                      <div 
                        key={p.id || i} 
                        onClick={() => setSelectedPoint(p)}
                        className={`p-4 cursor-pointer border border-slate-100 dark:border-white/5 rounded-2xl transition-all group print:bg-white print:border-slate-200 ${
                          selectedPoint?.id === p.id ? 'bg-white dark:bg-white/10 ring-2 ring-accent shadow-xl border-accent' : 'bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-900 dark:text-white group-hover:text-accent transition-colors">SITE: {p.id?.toString().padStart(4, '0') || i}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                DIST: {p.distance_to_river_m?.toFixed(0)}m
                             </span>
                          </div>
                          <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-tighter ${p.dynamic_risk_status.includes("High") ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              p.dynamic_risk_status.includes("Moderate") ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-green-500/10 text-green-600 border-green-500/20'
                            }`}>
                            {p.dynamic_risk_status.split(' ')[0]}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[11px] mt-1">
                          <span className={`${selectedPoint?.id === p.id ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500'} font-bold uppercase tracking-widest print:text-slate-600`}>Elevation (Current)</span>
                          <span className={`font-black font-mono text-sm ${selectedPoint?.id === p.id ? 'text-accent' : ''}`}>{p.elevation_current}m</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                      <Database className="w-8 h-8 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic">No data ingested</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
             <div className="lg:col-span-2">
                <RiverElevationChart />
             </div>
             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center gap-4 group hover:border-accent/40 transition-all">
                <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent group-hover:text-black transition-all">
                  <Activity className="w-8 h-8 text-accent group-hover:text-black" />
                </div>
                <h4 className="text-xl font-black tracking-tight uppercase">System Status</h4>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-[2] italic">
                  Spatial Engine: Active <br />
                  Synchronization: 100% <br />
                  Temporal Analysis: {total.toLocaleString()} Points <br />
                  River Baseline: Consolidated
                </p>
                <div className="mt-4 px-6 py-2 bg-slate-900 dark:bg-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  Healthy
                </div>
             </div>
          </div>

          {/* Print-Only Academic Footer */}
          <div className="hidden print:block space-y-12 border-t-2 border-slate-100 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Research Abstract</h4>
                <p className="text-xs text-slate-600 leading-relaxed text-justify italic">
                  This research contributes to the improvement of flood risk management through the combination of databases which uses SQL Server software and Geographic Information Systems (GIS). Spatial analysis techniques were used for the evaluation of important factors influenced by elevation and topology in the Vijayawada region.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Research Contributors</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {[
                    { name: "Mr. R Rohith Babu", role: "Assistant Professor (Guide), VIIT" },
                    { name: "M Rishi Dev", role: "Dept. of Civil Engineering, VIIT" },
                    { name: "P Santhosh", role: "Dept. of Civil Engineering, VIIT" },
                    { name: "G Krishnam Raju", role: "Dept. of Civil Engineering, VIIT" },
                    { name: "K Sagar", role: "Dept. of Civil Engineering, VIIT" },
                  ].map((author, index) => (
                    <div key={index} className="flex flex-col gap-0.5">
                      <span className="text-slate-900 border-b border-slate-100 pb-0.5">{author.name}</span>
                      <span className="text-[8px] opacity-70">{author.role}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-center text-slate-400 font-black pt-4">VIIT - Vignan's Institute of Information Technology (A) · Visakhapatnam, AP, India</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon, subtitle, color = "text-slate-900 dark:text-white", border = "border-slate-200 dark:border-white/10" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-white/5 border rounded-2xl sm:rounded-3xl p-6 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:border-accent/40 transition-all group ${border}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
        <div className="p-2 sm:p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:bg-accent/10 group-hover:text-accent transition-all">
          {icon}
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-black tracking-tight ${color}`}>{value}</div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-widest">{subtitle}</p>
    </motion.div>
  );
}
