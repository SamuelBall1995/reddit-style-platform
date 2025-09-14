"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type Row = { day: string; count: number };

// area chart showing number of users over time
// uses recharts for rendering
// expects data in the form [{ day: '2025-09-10', count: 3 }, ...]

export default function UsersChart({ data }: { data: Row[] }) {
  // data: [{ day: '2025-09-10', count: 3 }, ...]
  return (
    <div className="h-64 w-full rounded border bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopOpacity={0.4}/>
              <stop offset="95%" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickFormatter={(d) => new Date(d).toLocaleDateString()}
            minTickGap={32}
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            labelFormatter={(d) => new Date(d as string).toLocaleDateString()}
          />
          <Area type="monotone" dataKey="count" fillOpacity={1} fill="url(#fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
