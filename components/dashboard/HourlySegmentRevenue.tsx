"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

type ChartData = {
  hour: number;
  hourLabel: string;
  offline: number;
  online: number;
  total: number;
};

interface HourlySegmentRevenueProps {
  chartData: ChartData[];
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(value >= 100000000 ? 0 : 1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

export default function HourlySegmentRevenue({
  chartData,
}: HourlySegmentRevenueProps) {
  const offlineTotal = chartData.reduce((sum, item) => sum + item.offline, 0);
  const onlineTotal = chartData.reduce((sum, item) => sum + item.online, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.total, 0);
const startHour = chartData[0]?.hourLabel ?? "";
const endHour = chartData[chartData.length - 1]?.hourLabel ?? "";

  // Desktop (>=1024px) keeps the chart at 100% width, same as before.
  // Below that, force a minimum width so each hourly bar gets real
  // breathing room and the chart becomes horizontally scrollable
  // instead of squeezing every bar into a too-narrow screen.
  const [viewportWide, setViewportWide] = useState(false);

  useEffect(() => {
    const updateViewport = () => setViewportWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const chartMinWidthPx = viewportWide
    ? undefined
    : Math.max(chartData.length * 70, 700);

  return (
    <div className="bg-yellow-100 rounded-xl shadow p-6">
<h2 className="text-xl font-semibold mb-4 text-black">
  Hourly Segment Revenue ({startHour} - {endHour})
</h2>

      {/* Totals */}
      <div className="flex justify-center gap-10 mb-5 text-sm font-medium text-black">
        <div>
          Offline :{" "}
          <span className="text-blue-600">{formatCurrency(offlineTotal)}</span>
        </div>

        <div>
          Online :{" "}
          <span className="text-green-600">{formatCurrency(onlineTotal)}</span>
        </div>

        <div>
          Total :{" "}
          <span className="text-red-600">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div
          style={{
            minWidth: chartMinWidthPx ? `${chartMinWidthPx}px` : "100%",
          }}
        >
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="hourLabel"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
                tick={{ fill: "#000000" }}
              />

              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fill: "#000000" }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9f7f7",
                  border: "1px solid #f6f3f3",
                  borderRadius: "8px",
                  color: "#000000",
                }}
                labelStyle={{
                  color: "#000000",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: "#000000",
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />

              <Legend wrapperStyle={{ color: "#000000" }} />

              <Bar
                dataKey="offline"
                stackId="revenue"
                fill="#2563eb"
                name="Offline"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="offline"
                  position="top"
                  fill="#000000"
                  fontSize={13}
                  fontWeight={700}
                  formatter={(value: any) => (value > 0 ? formatCurrency(Number(value)) : "")}
                />
              </Bar>

              <Bar
                dataKey="online"
                stackId="revenue"
                fill="#16a34a"
                name="Online"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="online"
                  position="top"
                  fill="#000000"
                  fontSize={13}
                  fontWeight={700}
                  formatter={(value: any) => (value > 0 ? formatCurrency(Number(value)) : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}