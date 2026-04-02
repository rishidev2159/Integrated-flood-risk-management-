"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface FloodPoint {
  id: number;
  baseline_index: string;
  current_index: string;
  latitude: number;
  longitude: number;
  elevation_baseline: number;
  elevation_current: number;
  elevation_delta: number;
  risk_status: string;
  change_analysis: string;
}

interface RiskSummary {
  status: string;
  count: number;
}

export function useFloodPoints() {
  return useQuery<FloodPoint[]>({
    queryKey: ["flood-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_risk_view")
        .select("*")
        .limit(2000); // UI performance limit for markers
      
      if (error) throw error;
      return data as FloodPoint[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRiskSummary() {
  return useQuery<RiskSummary[]>({
    queryKey: ["risk-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_risk_summary");
      if (error) throw error;
      return data as RiskSummary[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface SpatialStats {
  total_elevation_points: number;
  total_river_points: number;
  analyzed_area_km2: number;
}

export function useRiverPoints() {
  return useQuery<FloodPoint[]>({
    queryKey: ["river-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("river_data")
        .select("*")
        .limit(2000);
      
      if (error) throw error;
      // Map river data to FloodPoint structure for map compatibility
      return (data || []).map((d: any) => ({
        id: d.id,
        baseline_index: d.system_index,
        current_index: d.system_index,
        latitude: d.latitude,
        longitude: d.longitude,
        elevation_baseline: d.elevation,
        elevation_current: d.elevation,
        elevation_delta: 0,
        risk_status: 'River Point',
        change_analysis: 'Stable'
      })) as FloodPoint[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSpatialStats() {
  return useQuery<SpatialStats>({
    queryKey: ["spatial-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_spatial_stats");
      if (error) throw error;
      return (data as any)[0] as SpatialStats;
    },
    staleTime: 1000 * 60 * 2, // Slightly shorter stale time for stats
  });
}
