/**
 * Centralized API Configuration & Data Fetching
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

/**
 * Basic status check for baseline data
 */
export async function fetchProjectStatus(projectName?: string) {
  const url = projectName 
    ? `${API_BASE}/api/status?project_name=${encodeURIComponent(projectName)}`
    : `${API_BASE}/api/status`;
    
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch project status");
  return res.json();
}

/**
 * Analysis fetcher (Gzipped results)
 */
export async function fetchAnalysis(threshold: number) {
  const res = await fetch(`${API_BASE}/api/analysis?threshold=${threshold}`);
  if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
  return res.json();
}

/**
 * ML Prediction fetcher
 */
export async function fetchPrediction(threshold: number) {
  const res = await fetch(`${API_BASE}/api/predict?threshold=${threshold}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prediction failed: ${text}`);
  }
  return res.json();
}

/**
 * ML Model Training
 */
export async function trainModel(threshold: number) {
  const res = await fetch(`${API_BASE}/api/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threshold }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Training failed: ${text}`);
  }
  return res.json();
}
