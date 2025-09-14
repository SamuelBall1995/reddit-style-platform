"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PostsOverTimeApex({
  categories,
  data,
}: {
  categories: string[];   // ["2025-09-01", ...]
  data: number[];         // [3, 0, 5, ...]
}) {
  const options: ApexOptions = {
    chart: { type: "line", stacked: false, animations: { enabled: false }, toolbar: { show: false } },
    colors: ["var(--chart-1)"],
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      type: "category",
      categories,
      labels: {
        rotate: -45,
        formatter: (val) => {
          const d = new Date(String(val));
          return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
        },
      },
      tickAmount: Math.min(8, categories.length),
    },
    yaxis: { min: 0, decimalsInFloat: 0, forceNiceScale: true },
    tooltip: { shared: false, x: { formatter: (val) => new Date(String(val)).toLocaleDateString() } },
    grid: { strokeDashArray: 4 },
  };

  const series = [{ name: "Posts", data }];

  return (
    <div className="w-full h-72 border rounded p-3 bg-white overflow-hidden">
      <Chart options={options} series={series} type="line" height="100%" width="100%" />
    </div>
  );
}
