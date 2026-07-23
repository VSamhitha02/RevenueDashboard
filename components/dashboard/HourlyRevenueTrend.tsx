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
  LabelList,
} from "recharts";

interface HourlyRevenueTrendProps {
  data: {
    hour: number;
    hourLabel: string;
    revenue: number;
    average: number;
  }[];
}

// Custom label renderer: places values inside the bars, staggered at
// two different heights (uneven) so adjacent labels don't collide.
function renderStaggeredLabel(props: any) {
  const { x, y, width, height, value, index } = props;

  if (!value) return null; // skip labels for zero-revenue hours

  const isEven = index % 2 === 0;

  // Position inside the bar, near the top — alternate how far down
  // from the bar's top edge the label sits, so consecutive labels
  // land at different heights instead of a flat row.
  const innerOffset = isEven ? 16 : 36;
  const labelY = Math.min(y + innerOffset, y + height - 6); // stay inside short bars too

  return (
    <text
      x={x + width / 2}
      y={y - 10}   // places label above the bar
      textAnchor="middle"
      fontSize={14}
      fontWeight={700}
      fill="#000000"
    >
      {`₹${Number(value).toLocaleString("en-IN")}`}
    </text>
  );
}

export default function HourlyRevenueTrend({ data }: HourlyRevenueTrendProps) {
  return (
    <div className="bg-yellow-50 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Hourly Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
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

          <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="revenue" content={renderStaggeredLabel} />
          </Bar>

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