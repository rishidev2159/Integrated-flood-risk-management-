"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAnalysis, fetchPrediction, trainModel } from "@/lib/api";
import type { AnalysisResponse, PredictionResponse, TrainMetrics } from "@/lib/types";

export function useFloodAnalysis(threshold: number) {
  return useQuery<AnalysisResponse>({
    queryKey: ["flood-analysis", threshold],
    queryFn: () => fetchAnalysis(threshold),
    staleTime: 5 * 60 * 1000,   // cache for 5 min
    retry: 1,
  });
}

export function useAIPrediction(threshold: number, enabled: boolean) {
  return useQuery<PredictionResponse>({
    queryKey: ["ai-prediction", threshold],
    queryFn: () => fetchPrediction(threshold),
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useTrainModel() {
  return useMutation<TrainMetrics, Error, number>({
    mutationFn: (threshold: number) => trainModel(threshold),
  });
}
