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
    revenue: number;
    average: number;
  }[];
}

export default function HourlyRevenueTrend({ data }: HourlyRevenueTrendProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Hourly Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hourLabel"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
          <Legend />

          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="average"
            name="Average"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}