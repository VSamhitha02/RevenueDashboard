"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LabelList,
} from "recharts";

type Props = {
  data: any[];
};

const formatNumber = (value: number) => {
  if (value >= 10000000)
    return `${(value / 10000000).toFixed(1)}Cr`;

  if (value >= 100000)
    return `${(value / 100000).toFixed(1)}L`;

  if (value >= 1000)
    return `${(value / 1000).toFixed(1)}K`;

  return value;
};

export default function RevenueTrend({ data }: Props) {
  return (
    <div className="
bg-white
rounded-xl
shadow-md
p-6
">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Total Revenue Trend
      </h2>

<ResponsiveContainer width="100%" height={400}>
<ComposedChart data={data}>
    barGap={4}
    barCategoryGap="20%"
  
    <CartesianGrid strokeDasharray="3 3" />

<XAxis
  dataKey="date"
  angle={-45}
  textAnchor="end"
  height={80}
  tickFormatter={(value) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }
/>

          <YAxis
  tickFormatter={(value) =>
    `₹${Number(value).toLocaleString("en-IN")}`
  }
/>

          <Tooltip
  formatter={(value: any) => [
    `₹${Number(value).toLocaleString("en-IN")}`,
    "Total Revenue",
  ]}
/>

          <Legend />
<Bar
  dataKey="revenue"
  fill="#2563eb"
>
<LabelList
  dataKey="revenue"
  position="top"
  content={(props: any) => {
    const { x, y, value } = props;

    return (
      <text
        x={x}
        y={y - 8}
        textAnchor="middle"
        fontSize={11}
        fill="#374151"
      >
        {formatNumber(Number(value))}
      </text>
    );
  }}
/>
</Bar>
<Line
  dataKey="average"
  stroke="#ef4444"
  strokeWidth={3}
  dot={false}
>
<LabelList
content={(props: any) => {
  const { x, y, value, index } = props;

  if (index !== 0) return null;

  return (
    <text
      x={x}
      y={y - 12}
      textAnchor="middle"
      fill="#ef4444"
      fontWeight="bold"
      fontSize={12}
    >
      Avg {formatNumber(Number(value))}
    </text>
  );
}}
/>
</Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}