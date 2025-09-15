"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// NO LONGER USING THIS CHART FILE
// REPLACED BY src/components/charts/PostsOverTimeApex.tsx
// KEPT FOR REFERENCE
// Recharts causing me alot of pain with SSR and values with accents/spaces

type Row = { day: string; count: number | string | bigint | null | undefined };

export default function UsersChartClient({ data }: { data: Row[] }) {
  const chartData = useMemo(() => {
    const arr = data.map(d => ({
      day: String(d.day),
      count: Number(d.count ?? 0) || 0, // hard-coerce
    }));
    // sort by day string "YYYY-MM-DD"
    arr.sort((a, b) => a.day.localeCompare(b.day));
    return arr;
  }, [data]);

  const max = useMemo(() => chartData.reduce((m, d) => Math.max(m, d.count), 0), [chartData]);

  return (
    <div className="h-64 w-full border rounded p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            minTickGap={24}
            tickFormatter={(d) => new Date(d).toLocaleDateString()}
          />
          <YAxis allowDecimals={false} domain={[0, Math.max(1, max)]} />
          <Tooltip labelFormatter={(d) => new Date(d as string).toLocaleDateString()} />
          {/* Area (filled) */}
          <Area
            type="monotone"
            dataKey="count"
            stroke="#4f46e5"
            fill="#c7d2fe"
            isAnimationActive={false}
            connectNulls
          />
          {/* Line overlay + dots so you *see* points even if area is subtle */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* TEMP debug — remove after you see the line */}
      <div className="text-[10px] text-gray-500 mt-1">
        points:{chartData.length} max:{max} sample:{JSON.stringify(chartData.slice(0,3))}
      </div>
    </div>
  );
}
