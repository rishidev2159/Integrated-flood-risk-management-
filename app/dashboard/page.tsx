"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useFloodPoints, useRiskSummary, useRiverPoints, useSpatialStats } from "@/hooks/useSeaLevelData";
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
  const { data: stats } = useSpatialStats();

  const getCount = (status: string) => summary.find(s => s.status.includes(status))?.count || 0;
  const highRisk = getCount("High");
  const modRisk = getCount("Moderate");
  const safe = getCount("Safe");
  const total = highRisk + modRisk + safe;

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white p-4 sm:p-6 md:p-10 2xl:p-16 transition-colors duration-300 print:bg-white print:text-black print:p-0">
      <div className="max-w-[1800px] 2xl:max-w-[1920px] mx-auto relative z-10 space-y-8 sm:space-y-12 2xl:space-y-16 print:space-y-6">

        {/* Print-Only Academic Header */}
        <div className="hidden print:block border-b-2 border-slate-200 pb-6 mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Integrated Flood Risk Management Framework</h1>
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
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              Flood Risk <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">Intelligence</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest pt-2">PostGIS Spatial Analysis Dashboard · VIIT Research</p>
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
            <StatCard title="Points Analyzed" value={(stats?.total_elevation_points || total).toLocaleString()} icon={<Activity className="w-4 h-4 text-blue-500" />} subtitle="Total Ingested Nodes" />
            <StatCard title="River Nodes" value={(stats?.total_river_points || riverPoints.length).toLocaleString()} icon={<Database className="w-4 h-4 text-sky-500" />} subtitle="Krishna Dataset" />
            <StatCard title="High Risk" value={highRisk.toLocaleString()} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} color="text-red-500" border="border-red-500/20" subtitle="Elevation < 19m" />
            <StatCard title="Safety Index" value={`${total > 0 ? ((safe / total) * 100).toFixed(1) : 0}%`} icon={<Activity className="w-4 h-4 text-green-500" />} color="text-green-500" border="border-green-500/20" subtitle="Areas Above 21m" />
            <StatCard title="Analyzed Area" value={`${stats?.analyzed_area_km2?.toFixed(2) || 0} km²`} icon={<MapIcon className="w-4 h-4 text-purple-500" />} subtitle="Spatial Hull Coverage" />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:grid-cols-1 print:gap-12">
            <div className="lg:col-span-8 xl:col-span-9 h-[450px] sm:h-[600px] lg:h-[700px] print:h-[180mm] map-container">
              <MapComponent points={points} riverPoints={riverPoints} />
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
                    points.slice(0, 10).map((p, i) => (
                      <div key={p.id || i} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-accent hover:bg-white dark:hover:bg-white/10 transition-all group print:bg-white print:border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black font-mono text-slate-400 group-hover:text-accent transition-colors">{p.current_index}</span>
                          <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-tighter ${p.risk_status.includes("High") ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              p.risk_status.includes("Moderate") ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-green-500/10 text-green-600 border-green-500/20'
                            }`}>
                            {p.risk_status.split(' ')[0]}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-bold uppercase tracking-widest print:text-slate-600">Elevation (Current)</span>
                          <span className="font-extrabold font-mono text-sm">{p.elevation_current}m</span>
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
