"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, AlertCircle, Database } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

export default function FileUploader() {
  const [files, setFiles] = useState<{ land: File | null; riverBaseline: File | null; riverCurrent: File | null }>({
    land: null,
    riverBaseline: null,
    riverCurrent: null,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDropLand = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, land: acceptedFiles[0] }));
    setError(null);
  };

  const onDropRiverBaseline = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, riverBaseline: acceptedFiles[0] }));
    setError(null);
  };

  const onDropRiverCurrent = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, riverCurrent: acceptedFiles[0] }));
    setError(null);
  };

  const { getRootProps: getRoot1, getInputProps: getInput1 } = useDropzone({
    onDrop: onDropLand,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const { getRootProps: getRoot2, getInputProps: getInput2 } = useDropzone({
    onDrop: onDropRiverBaseline,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const { getRootProps: getRoot3, getInputProps: getInput3 } = useDropzone({
    onDrop: onDropRiverCurrent,
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
    if (!files.land || !files.riverBaseline || !files.riverCurrent) {
      setError("Please provide all 3 CSVs: Land Elevation, River Baseline, and River Current.");
      return;
    }

    setUploading(true);
    setProgress(5);
    setError(null);

    try {
      // 1. Clear massive datasets via high-performance RPC
      const { error: clearError } = await supabase.rpc('clear_elevation_data');
      if (clearError) throw new Error(`Clearing failed: ${clearError.message}`);
      
      setProgress(10);

      // 2. Process Land Data
      const dataLand = mapData(await parseCSV(files.land));
      if (dataLand.length === 0) throw new Error("Land Elevation CSV is empty or invalid.");
      
      for (let i = 0 ; i < dataLand.length; i += 1000) {
        const batch = dataLand.slice(i, i + 1000);
        const { error: err } = await supabase.from('land_data').insert(batch);
        if (err) throw err;
        setProgress(10 + Math.floor((i / dataLand.length) * 30));
      }
      setProgress(40);

      // 3. Process River Baseline
      const dataRB = mapData(await parseCSV(files.riverBaseline));
      if (dataRB.length === 0) throw new Error("River Baseline CSV is empty or invalid.");

      for (let i = 0 ; i < dataRB.length; i += 1000) {
        const batch = dataRB.slice(i, i + 1000);
        const { error: err } = await supabase.from('river_baseline').insert(batch);
        if (err) throw err;
        setProgress(40 + Math.floor((i / dataRB.length) * 30));
      }
      setProgress(70);

      // 4. Process River Current
      const dataRC = mapData(await parseCSV(files.riverCurrent));
      if (dataRC.length === 0) throw new Error("River Current CSV is empty or invalid.");

      for (let i = 0 ; i < dataRC.length; i += 1000) {
        const batch = dataRC.slice(i, i + 1000);
        const { error: err } = await supabase.from('river_current').insert(batch);
        if (err) throw err;
        setProgress(70 + Math.floor((i / dataRC.length) * 30));
      }

      setProgress(100);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      console.error("Ingestion Error:", err);
      setError(err.message || "Data ingestion failed. Check CSV format and network.");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="ring-1 ring-slate-200 dark:ring-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DropzoneBox 
          getRootProps={getRoot1} 
          getInputProps={getInput1} 
          file={files.land} 
          label="Source A: Land" 
          sub="Base Topography" 
        />
        <DropzoneBox 
          getRootProps={getRoot2} 
          getInputProps={getInput2} 
          file={files.riverBaseline} 
          label="Source B: River (B)" 
          sub="Historical Stage" 
        />
        <DropzoneBox 
          getRootProps={getRoot3} 
          getInputProps={getInput3} 
          file={files.riverCurrent} 
          label="Source C: River (C)" 
          sub="Satellite/Current" 
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
              disabled={!files.land || !files.riverBaseline || !files.riverCurrent}
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
