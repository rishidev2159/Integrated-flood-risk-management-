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
