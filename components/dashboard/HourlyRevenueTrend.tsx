"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
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
    <div className="bg-yellow-50 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Hourly Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hourLabel"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fill: "#000000" }}
          />
          <YAxis
            tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
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
            formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
          />
          <Legend wrapperStyle={{ color: "#000000" }} />

          <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />

          <Line
            type="monotone"
            dataKey="average"
            name="Average"
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
