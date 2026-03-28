"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, AlertCircle, Database } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

export default function FileUploader() {
  const [files, setFiles] = useState<{ year1: File | null; year2: File | null }>({
    year1: null,
    year2: null,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDropYear1 = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, year1: acceptedFiles[0] }));
    setError(null);
  };

  const onDropYear2 = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, year2: acceptedFiles[0] }));
    setError(null);
  };

  const { getRootProps: getRoot1, getInputProps: getInput1 } = useDropzone({
    onDrop: onDropYear1,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const { getRootProps: getRoot2, getInputProps: getInput2 } = useDropzone({
    onDrop: onDropYear2,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
      });
    });
  };

  const mapData = (rawData: any[]) => {
    return rawData.map((row) => ({
      system_index: row["system:index"] || row["id"] || row["index"],
      latitude: parseFloat(row["latitude"] || row["lat"]),
      longitude: parseFloat(row["longitude"] || row["lng"] || row["long"]),
      elevation: parseFloat(row["elevation"] || row["elev"]),
    })).filter(r => !isNaN(r.latitude) && !isNaN(r.longitude));
  };

  const handleIngest = async () => {
    if (!files.year1 || !files.year2) {
      setError("Please provide both Source A (Baseline) and Source B (Satellite) CSVs.");
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      // 1. Clear massive datasets via high-performance RPC
      const { error: clearError } = await supabase.rpc('clear_elevation_data');
      if (clearError) throw clearError;

      const dataA = mapData(await parseCSV(files.year1));
      setProgress(30);
      
      for (let i = 0 ; i < dataA.length; i += 1000) {
        const batch = dataA.slice(i, i + 1000);
        const { error: err } = await supabase.from('elevation_primary').insert(batch);
        if (err) throw err;
        setProgress(30 + Math.floor((i / dataA.length) * 20));
      }

      const dataB = mapData(await parseCSV(files.year2));
      setProgress(60);

      for (let i = 0 ; i < dataB.length; i += 1000) {
        const batch = dataB.slice(i, i + 1000);
        const { error: err } = await supabase.from('elevation_secondary').insert(batch);
        if (err) throw err;
        setProgress(60 + Math.floor((i / dataB.length) * 30));
      }

      setProgress(100);
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Data ingestion failed. Check CSV format.");
      setUploading(false);
    }
  };

  return (
    <div className="ring-1 ring-slate-200 dark:ring-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <DropzoneBox 
          getRootProps={getRoot1} 
          getInputProps={getInput1} 
          file={files.year1} 
          label="Source A: Baseline" 
          sub="Historical Data" 
        />
        <DropzoneBox 
          getRootProps={getRoot2} 
          getInputProps={getInput2} 
          file={files.year2} 
          label="Source B: Satellite" 
          sub="Current Data" 
        />
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-sm px-4">
              <div className="flex justify-between text-[10px] sm:text-xs mb-2 text-slate-500 font-bold uppercase tracking-widest">
                <span>Analyzing SQL Buffers...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={handleIngest}
              disabled={!files.year1 || !files.year2}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-accent text-white dark:text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg dark:shadow-[0_0_25px_rgba(94,241,255,0.3)] disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-xs"
            >
              <Database className="w-4 h-4 mr-3" />
              Initialize Ingestion
            </motion.button>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 dark:text-red-400 text-[10px] sm:text-xs mt-4 bg-red-50 dark:bg-red-400/10 px-4 py-3 rounded-xl border border-red-200 dark:border-red-400/20 font-bold">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DropzoneBox({ getRootProps, getInputProps, file, label, sub }: any) {
  const isActive = !!file;
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center text-center group ${
      isActive 
        ? "border-accent bg-accent/5 shadow-inner" 
        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
    }`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={`p-4 rounded-2xl transition-all duration-500 ${isActive ? "bg-accent text-black scale-110" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 group-hover:scale-110"}`}>
          {isActive ? <FileCheck className="w-6 h-6 sm:w-8 sm:h-8" /> : <Upload className="w-6 h-6 sm:w-8 sm:h-8" />}
        </div>
        <div className="space-y-1">
          <p className={`font-bold text-sm sm:text-base tracking-tight transition-colors ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            {isActive ? file.name : label}
          </p>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-widest">{sub}</span>
        </div>
      </div>
    </div>
  );
}
