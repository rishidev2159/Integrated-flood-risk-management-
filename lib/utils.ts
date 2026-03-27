import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

/** Returns a CSS hex color for a flood probability [0, 1] */
export function probabilityToColor(prob: number): string {
  if (prob < 0.25) return "#22c55e";   // green  – Low
  if (prob < 0.50) return "#eab308";   // yellow – Moderate
  if (prob < 0.75) return "#f97316";   // orange – High
  return "#dc2626";                    // red    – Critical
}

/** Returns a CSS color for change analysis status */
export function changeToColor(status: string): string {
  switch (status) {
    case "Worsened": return "#ef4444";
    case "Improved":  return "#22c55e";
    default:          return "#3b82f6";
  }
}

/** Returns color for flooded/safe status */
export function statusToColor(status: string): string {
  return status === "Flooded" ? "#ef4444" : "#22c55e";
}
