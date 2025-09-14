"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

type Series = { key: string; label: string };
type Row = Record<string, number | string>; // { day: "YYYY-MM-DD", "<authorId>": number, ... }

export default function UsersStackedChartClient({
  data,
  series,
}: {
  data: Row[];
  series: Series[];
}) {
  const chartData = useMemo(() => {
    return data.map((row) => {
      const out: Record<string, number | string> = { day: String(row.day) };
      for (const s of series) out[s.key] = Number(row[s.key] ?? 0) || 0;
      return out;
    });
  }, [data, series]);

  const max = useMemo(
    () => Math.max(1, ...chartData.map((d) => series.reduce((sum, s) => sum + Number(d[s.key] ?? 0), 0))),
    [chartData, series]
  );

  const palette = ["#1d4ed8","#9333ea","#16a34a","#ef4444","#f59e0b","#06b6d4","#64748b","#db2777","#0ea5e9"];

  return (
    <div className="h-64 w-full border rounded p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" minTickGap={24} tickFormatter={(d) => new Date(d).toLocaleDateString()} />
          <YAxis allowDecimals={false} domain={[0, max]} />
          <Tooltip labelFormatter={(d) => new Date(d as string).toLocaleDateString()} />
          <Legend />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}          // ✅ safe, no spaces/accents
              name={s.label}           // legend shows the human name
              type="monotone"
              stackId="1"
              stroke={palette[i % palette.length]}
              fill={palette[i % palette.length]}
              fillOpacity={0.35}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* TEMP debug: remove when happy */}
      <div className="text-[10px] text-gray-500 mt-1">
        rows:{chartData.length} series:{series.length} sample:{JSON.stringify(chartData[0])}
      </div>
    </div>
  );
}
