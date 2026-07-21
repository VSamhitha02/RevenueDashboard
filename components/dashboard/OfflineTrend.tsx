"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  data: any[];
};

export default function OfflineTrend({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5">

      <h2 className="text-xl text-black font-semibold mb-5">
        Offline Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={70}
          />

                    <YAxis
            tickFormatter={(value) => `₹${value}`}
          />

                    <Tooltip
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}