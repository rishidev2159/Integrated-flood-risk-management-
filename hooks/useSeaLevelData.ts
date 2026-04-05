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
  // Dynamic Spatial Enrichment Properties (SQL Calculated)
  river_clearance?: number;
  nearest_river_elevation?: number;
  distance_to_river_m?: number;
  dynamic_risk_status?: string;
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

export function useSpatialStats() {
  return useQuery<SpatialStats>({
    queryKey: ["spatial-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_spatial_stats");
      if (error) throw error;
      return (Array.isArray(data) ? data[0] : data) as SpatialStats;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRiverPoints() {
  return useQuery<FloodPoint[]>({
    queryKey: ["river-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("river_current")
        .select("*")
        .limit(2000);
      
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        baseline_index: d.system_index || "River",
        current_index: d.system_index || "River",
        latitude: d.latitude,
        longitude: d.longitude,
        elevation_baseline: d.elevation,
        elevation_current: d.elevation,
        elevation_delta: 0,
        risk_status: 'River Point',
        change_analysis: 'Stable'
      } as FloodPoint));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface TotalCounts {
  elevation: number;
  river: number;
}

export function useTotalCounts() {
  return useQuery<TotalCounts>({
    queryKey: ["total-counts"],
    queryFn: async () => {
      // Supabase count queries bypass the 1000 row API limit
      const [elevationRes, riverRes] = await Promise.all([
        supabase.from("land_data").select("*", { count: "exact", head: true }),
        supabase.from("river_current").select("*", { count: "exact", head: true })
      ]);

      return {
        elevation: elevationRes.count || 0,
        river: riverRes.count || 0
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
