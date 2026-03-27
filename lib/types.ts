// Geo point types representing a processed GEE data point
export interface GeoPoint {
  "system:index": string | number;
  lat: number;
  lng: number;
  elevation_y1: number;
  elevation_y2: number;
  elevation_delta: number;
  status_y2: "Flooded" | "Safe";
  change_analysis: "Worsened" | "Improved" | "Stable";
}

export interface AIPredictionPoint {
  lat: number;
  lng: number;
  elevation_y2: number;
  status_y2: "Flooded" | "Safe";
  change_analysis: "Worsened" | "Improved" | "Stable";
  flood_probability: number;
  risk_level: "Low" | "Moderate" | "High" | "Critical";
}

export interface SummaryStats {
  total_area_points: number;
  flood_risk_percentage: number;
  newly_vulnerable_points: number;
  improved_points: number;
  stable_points: number;
  analysis_status: string;
}

export interface AnalysisResponse {
  threshold: number;
  summary: SummaryStats;
  points: GeoPoint[];
}

export interface PredictionResponse {
  threshold: number;
  points: AIPredictionPoint[];
}

export interface TrainMetrics {
  accuracy: number;
  precision_flooded: number;
  recall_flooded: number;
  f1_flooded: number;
  training_samples: number;
  test_samples: number;
  model_status: string;
}

export type MapMode = "analysis" | "vulnerability_forecast";
export type ChangeFilter = "all" | "Worsened" | "Improved" | "Stable";
