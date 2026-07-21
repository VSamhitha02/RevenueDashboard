"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#eab308",
];

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

export default function OnlineItemSegmentChart({
  data,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-5">

      <h3 className="text-lg font-semibold text-center mb-5">
        Online Segment Revenue
      </h3>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ value }) =>
              `₹${Number(value).toLocaleString()}`
            }
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}