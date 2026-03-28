"use client";

import { motion } from "framer-motion";
import FileUploader from "@/components/upload/FileUploader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, ShieldCheck, Map, Database, Info, FileText } from "lucide-react";

export default function Home() {
  const authors = [
    { name: "Mr. R. Rohith Babu", role: "Department of Civil Engineering, VIIT" },
    { name: "Krishnam Raju", role: "Department of Civil Engineering, VIIT" },
    { name: "Sagar", role: "Department of Civil Engineering, VIIT" },
    { name: "Rishi Dev", role: "Department of Civil Engineering, VIIT" },
    { name: "Santhosh", role: "Department of Civil Engineering, VIIT" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 2xl:px-10 h-16 sm:h-20 2xl:h-24 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-lg bg-slate-900 dark:bg-accent flex items-center justify-center transition-colors">
               <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-7 2xl:h-7 text-white dark:text-black" />
             </div>
             <div className="flex flex-col leading-tight">
               <span className="font-bold text-sm sm:text-lg 2xl:text-xl tracking-tight">HydroRisk</span>
               <span className="text-[9px] sm:text-[10px] 2xl:text-[11px] text-slate-500 font-semibold uppercase tracking-wider">GIS/SQL Framework</span>
             </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 2xl:gap-10">
            <span className="hidden lg:block text-[10px] 2xl:text-xs font-bold text-slate-400 border-x px-4 border-slate-200 dark:border-slate-800 uppercase tracking-widest text-center">
              Vijayawada Research Region<br/>VIIT Department of Civil Engineering
            </span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 2xl:px-10 py-10 sm:py-16 md:py-24 2xl:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 2xl:gap-24 items-start">
          
          {/* Header & Abstract - Column 1 (Large) */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] sm:leading-tight">
                  Integrated Flood Risk <br className="hidden sm:block"/> Management: <br className="hidden sm:block"/>
                  <span className="text-slate-500 dark:text-slate-400">A SQL and GIS Based Approach</span>
                </h1>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                  {authors.map((author, i) => (
                    <span key={i} className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
                      {author.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Research Abstract Section */}
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-none space-y-4 sm:space-y-6">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-accent">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Research Abstract
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed sm:leading-loose text-justify italic font-medium">
                  "This research contributes to the improvement of flood risk management through the combination of databases which uses SQL Server software and Geographic Information Systems (GIS)... Spatial analysis techniques were used in GIS for the evaluation of important factors influenced by elevation, slope, and land usage."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Region</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">Vijayawada, Krishna River Basin</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Framework Basis</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">PostGIS · Postgres · Next.js</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FeatureCard 
                  icon={<Map className="w-5 h-5 sm:w-6 sm:h-6" />} 
                  title="GIS Topology" 
                  desc="Precision mapping of urban vulnerability using satellite-derived Digital Elevation Models." 
                />
                <FeatureCard 
                  icon={<Database className="w-5 h-5 sm:w-6 sm:h-6" />} 
                  title="SQL Analysis" 
                  desc="High-performance data retrieval and real-time hydrological analysis using indexed SQL queries." 
                />
              </div>
            </motion.div>
          </div>

          {/* Ingestion Center - Column 2 (Small) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6 sm:space-y-8">
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="space-y-6 sm:space-y-8"
             >
                <div className="flex flex-col gap-2 text-center lg:text-left">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight underline decoration-accent decoration-2 underline-offset-8">Spatial Ingestion</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium pt-2">Process raw elevation CSVs for multi-temporal risk assessment.</p>
                </div>
                
                <div className="bg-white dark:bg-transparent shadow-xl dark:shadow-none rounded-3xl">
                  <FileUploader />
                </div>

                <div className="p-5 sm:p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl sm:rounded-3xl shadow-lg transition-colors overflow-hidden relative">
                   <div className="flex gap-4 items-start relative z-10">
                      <div className="p-2 rounded-lg bg-white/10 dark:bg-slate-900/10">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex flex-col gap-1.5 leading-normal">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Academic Affiliation</span>
                         <p className="text-[11px] sm:text-xs font-bold leading-relaxed">
                           Department of Civil Engineering, Vignan's Institute of Information Technology (A), Visakhapatnam, AP, India.
                         </p>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10" />
                </div>
             </motion.div>
          </div>
          
        </div>
      </div>

      <footer className="py-12 sm:py-20 bg-white dark:bg-[#050505] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm sm:text-base font-black tracking-tighter uppercase grayscale dark:grayscale-0 transition-all">HydroRisk GIS Framework</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 text-center max-w-sm">
              Supporting sustainable solutions and informed decision making for modern flood prone areas.
            </p>
          </div>
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 VIIT Civil Engineering</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-accent hover:shadow-xl transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-6 group-hover:bg-accent group-hover:text-black transition-colors shadow-sm">
        {icon}
      </div>
      <h4 className="font-black text-sm sm:text-base mb-2 group-hover:text-accent transition-colors">{title}</h4>
      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
