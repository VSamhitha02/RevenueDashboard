"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Props = {
  data: any[];
  orderType: string;
};

export default function DailyAverageTrend({ data, orderType }: Props) {
  const title =
    orderType === "All"
      ? "Average Daily Revenue"
      : `Average Daily Revenue (${orderType})`;

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold text-black mb-4">
        {title}
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis
            tickFormatter={(value) =>
              `₹${Number(value).toLocaleString("en-IN")}`
            }
          />

          <Tooltip
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              name,
            ]}
          />

          <Legend />

          <Bar
            dataKey="revenue"
            name="Daily Revenue"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            barSize={35}
          />

          <Line
            type="monotone"
            dataKey="average"
            name="Average Revenue"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}