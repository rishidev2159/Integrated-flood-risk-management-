import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { GeoPoint } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

interface AnalyticsHubProps {
  points: GeoPoint[];
}

const chartConfig = {
  stable: { label: "Stable", color: "hsl(var(--muted-foreground))" },
  worsened: { label: "Worsened", color: "var(--red)" },
  improved: { label: "Improved", color: "var(--green)" },
  count: { label: "Points", color: "var(--accent)" }
} satisfies ChartConfig;

export default function AnalyticsHub({ points }: AnalyticsHubProps) {
  // 1. Status Distribution (Pie Chart)
  const statusData = useMemo(() => [
    { name: "stable", value: points.filter((p) => p.change_analysis === "Stable").length, fill: "oklch(0.556 0 0)" },
    { name: "worsened", value: points.filter((p) => p.change_analysis === "Worsened").length, fill: "var(--red)" },
    { name: "improved", value: points.filter((p) => p.change_analysis === "Improved").length, fill: "var(--green)" },
  ].filter(d => d.value > 0), [points]);

  // 2. Delta Distribution
  const deltaBuckets = useMemo(() => [
    { range: "< -1m", count: points.filter(p => p.elevation_delta < -1).length },
    { range: "-1m to -0.5m", count: points.filter(p => p.elevation_delta >= -1 && p.elevation_delta < -0.5).length },
    { range: "Stable (±0.5m)", count: points.filter(p => p.elevation_delta >= -0.5 && p.elevation_delta <= 0.5).length },
    { range: "0.5m to 1m", count: points.filter(p => p.elevation_delta > 0.5 && p.elevation_delta <= 1).length },
    { range: "> 1m", count: points.filter(p => p.elevation_delta > 1).length },
  ], [points]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Terrain Stability
          </CardTitle>
          <CardDescription className="text-[10px]">Comparative distribution of elevation shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" payload={[]} />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Elevation Delta Index
          </CardTitle>
          <CardDescription className="text-[10px]">Real-time vertical shift magnitudes</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart data={deltaBuckets} layout="vertical" margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <YAxis 
                dataKey="range" 
                type="category" 
                tick={{ fontSize: 9 }} 
                width={80}
              />
              <XAxis type="number" hide />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
