"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Map } from "lucide-react";
import type { SummaryStats } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface Props {
  stats: SummaryStats;
  threshold: number;
}

export default function AnalysisCard({ stats, threshold }: Props) {
  const cards = [
    {
      icon: <Map className="stat-icon" />,
      label: "Total Points",
      value: formatNumber(stats.total_area_points),
      sub: `Threshold: ${threshold}m`,
      color: "blue",
    },
    {
      icon: <AlertTriangle className="stat-icon" />,
      label: "Flood Risk",
      value: formatPercent(stats.flood_risk_percentage),
      sub: "of area currently at risk",
      color: stats.flood_risk_percentage > 50 ? "red" : "yellow",
    },
    {
      icon: <TrendingDown className="stat-icon" />,
      label: "Newly Vulnerable",
      value: formatNumber(stats.newly_vulnerable_points),
      sub: "points worsened vs Year 1",
      color: "red",
    },
    {
      icon: <TrendingUp className="stat-icon" />,
      label: "Recovered",
      value: formatNumber(stats.improved_points),
      sub: "points improved vs Year 1",
      color: "green",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card stat-card--${card.color}`}>
          <div className="stat-header">
            {card.icon}
            <span className="stat-label">{card.label}</span>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
