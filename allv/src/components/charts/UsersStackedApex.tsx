"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";

// Import Chart client-side only (avoids SSR "window" issues)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Series = { name: string; data: number[] };

export default function UsersStackedApex({
  categories,
  series,
}: {
  categories: string[];        // ["2025-09-01", ...]
  series: Series[];            // [{ name: "Alex Chen", data: [2,0,1,...] }, ...]
}) {
  // Ensure lengths match (defensive)
  const normalized = useMemo(() => {
    const len = categories.length;
    return series.map(s => ({
      ...s,
      data: s.data.length === len ? s.data : [...s.data, ...Array(Math.max(0, len - s.data.length)).fill(0)]
    }));
  }, [categories, series]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      stacked: true,
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.1 },
    },
    legend: { position: "top" },
    xaxis: {
      type: "category",
      categories,
      labels: {
        rotate: -45,
        formatter: (val) => {
          // val is "YYYY-MM-DD"
          const d = new Date(String(val));
          return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
        },
      },
      tickAmount: Math.min(8, categories.length),
    },
    yaxis: {
      forceNiceScale: true,
      decimalsInFloat: 0,
      min: 0,
    },
    tooltip: {
      shared: true,
      x: { formatter: (val) => new Date(String(val)).toLocaleDateString() },
    },
    grid: { strokeDashArray: 4 },
  };

  return (
    <div className="w-full h-72 border rounded p-3 bg-white overflow-hidden">
      <Chart options={options} series={normalized} type="area" height="100%" width="100%" />
      {/* TEMP debug — testing if data or chart was why the chart wasnt showing at all. It was the chart. Fixed. */}
      {/* <div className="text-[10px] text-gray-500 mt-1">
        days:{categories.length} series:{normalized.length} sample:
        {JSON.stringify({ day0: categories[0], s0: normalized[0]?.data?.slice(0,3) })}
      </div> */}
    </div>
  );
}
