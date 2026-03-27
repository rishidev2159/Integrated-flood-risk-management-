import { AlertTriangle, TrendingUp, TrendingDown, Map } from "lucide-react";
import type { SummaryStats } from "@/lib/types";
import { formatNumber, formatPercent, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  stats: SummaryStats;
  threshold: number;
}

export default function AnalysisCard({ stats, threshold }: Props) {
  const cards = [
    {
      icon: <Map className="w-4 h-4 text-blue-500" />,
      label: "Total Points",
      value: formatNumber(stats.total_area_points),
      sub: `Threshold: ${threshold}m`,
      color: "border-blue-500/20",
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      label: "Flood Risk",
      value: formatPercent(stats.flood_risk_percentage),
      sub: "area currently at risk",
      color: stats.flood_risk_percentage > 50 ? "border-red-500/20" : "border-yellow-500/20",
    },
    {
      icon: <TrendingDown className="w-4 h-4 text-red-500" />,
      label: "Vulnerability",
      value: formatNumber(stats.newly_vulnerable_points),
      sub: "points worsened vs Y1",
      color: "border-red-500/20",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      label: "Resilience",
      value: formatNumber(stats.improved_points),
      sub: "points improved vs Y1",
      color: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.label} className={cn("overflow-hidden border-l-4", card.color)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {card.label}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
