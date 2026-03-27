"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { fetchProjectStatus, API_BASE } from "@/lib/api";

export default function FileUploader() {
  const [projectName, setProjectName] = useState("Krishna River Basin");
  const [files, setFiles] = useState<{ year1: File | null; year2: File | null }>({
    year1: null,
    year2: null,
  });
  const [baselinePresent, setBaselinePresent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing baseline on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchProjectStatus();
        if (data.baseline_present) setBaselinePresent(true);
        if (data.project_name) setProjectName(data.project_name);
      } catch (err) {
        console.warn("Could not fetch baseline status", err);
      }
    };
    checkStatus();
  }, []); 

  const onDropYear1 = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, year1: acceptedFiles[0] }));
    setError(null);
  };

  const onDropYear2 = (acceptedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, year2: acceptedFiles[0] }));
    setError(null);
  };

  const { getRootProps: getRoot1, getInputProps: getInput1, isDragActive: active1 } = useDropzone({
    onDrop: onDropYear1,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const { getRootProps: getRoot2, getInputProps: getInput2, isDragActive: active2 } = useDropzone({
    onDrop: onDropYear2,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!files.year2 || (!files.year1 && !baselinePresent)) {
      setError("Please provide a Year 2 CSV to continue comparison.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("project_name", projectName);
    if (files.year1) formData.append("year1", files.year1);
    formData.append("year2", files.year2);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Upload failed.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      {/* Project Name Field */}
      <div className="project-name-field">
        <label className="section-label">Study Area Name</label>
        <input 
          type="text" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Krishna River Basin"
          className="project-input"
        />
      </div>

      <div className="uploader-grid">
        {/* Year 1 Dropzone */}
        <div {...getRoot1()} className={`dropzone ${active1 ? "dropzone--active" : ""} ${(files.year1 || baselinePresent) ? "dropzone--done" : ""}`}>
          <input {...getInput1()} />
          {files.year1 ? <FileCheck className="drop-icon text-green" /> : <Upload className="drop-icon" />}
          <p className="drop-text">
            {files.year1 ? files.year1.name : baselinePresent ? "Baseline Active" : "Drop Year 1 CSV"}
          </p>
          <span className="drop-sub">
            {baselinePresent && !files.year1 ? "Historical Data Stored" : "Historical Baseline Data"}
          </span>
        </div>

        {/* Year 2 Dropzone */}
        <div {...getRoot2()} className={`dropzone ${active2 ? "dropzone--active" : ""} ${files.year2 ? "dropzone--done" : ""}`}>
          <input {...getInput2()} />
          {files.year2 ? <FileCheck className="drop-icon text-green" /> : <Upload className="drop-icon" />}
          <p className="drop-text">{files.year2 ? files.year2.name : "Drop Year 2 CSV"}</p>
          <span className="drop-sub">Current Comparative Data</span>
        </div>
      </div>

      <AnimatePresence>
        {files.year2 && (files.year1 || baselinePresent) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={handleUpload}
            disabled={uploading}
            className="upload-submit-btn"
          >
            {uploading ? <Loader2 className="spin" /> : baselinePresent && !files.year1 ? "Update Comparison" : "Initialize Analysis"}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <div className="uploader-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
