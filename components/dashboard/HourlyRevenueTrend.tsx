"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HourlyRevenueTrendProps {
  data: {
    hour: number;
    hourLabel: string;
    offlineRevenue: number;
    onlineRevenue: number;
    totalRevenue: number;
  }[];
  source: "All" | "Offline" | "Online";
}

export default function HourlyRevenueTrend({
  data,
  source,
}: HourlyRevenueTrendProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Hourly Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hourLabel" />
          <YAxis />
          <Tooltip />
          <Legend />

          {(source === "All" || source === "Offline") && (
            <Line
              type="monotone"
              dataKey="offlineRevenue"
              name="Offline Revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          )}

          {(source === "All" || source === "Online") && (
            <Line
              type="monotone"
              dataKey="onlineRevenue"
              name="Online Revenue"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          )}

          {source === "All" && (
            <Line
              type="monotone"
              dataKey="totalRevenue"
              name="Total Revenue"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}