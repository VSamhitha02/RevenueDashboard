"use client";

import { title } from "process";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type SessionData = {
  name: string;
  value: number;
  orders: number;
};

type Props = {
  title: string;
  data: SessionData[];
};
const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#9333ea",
  "#06b6d4",
];

export default function SessionPieChart({ title, data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
<h2 className="text-xl font-semibold mb-4 text-black">
  {title}
</h2>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}