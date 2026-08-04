"use client";

import { useEffect, useState } from "react";
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

const formatNumber = (value: number) => {
  if (value >= 10000000) {
    return `₹${Math.round(value / 10000000)}Cr`;
  }

  if (value >= 100000) {
    return `₹${Math.round(value / 100000)}L`;
  }

    if (value >= 1000) {
    // Thousands
    return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }


  return `₹${Number(value).toLocaleString("en-IN")}`;
};

// Full, non-abbreviated amount — used in the tooltip so hovering a bar
// shows the exact figure instead of the K/L/Cr shorthand used on the
// axis and bar labels.
const formatFullNumber = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Custom label renderer: places values inside the bars, staggered at
// two different heights (uneven) so adjacent labels don't collide.
function renderStaggeredLabel(props: any) {
  const { x, y, width, height, value, index } = props;

  if (!value) return null; // skip labels for zero-revenue hours

  const isEven = index % 2 === 0;

  const innerOffset = isEven ? 16 : 36;
  const labelY = Math.min(y + innerOffset, y + height - 6); // stay inside short bars too

  return (
    <text
      x={x + width / 2}
      y={y - 10}
      textAnchor="middle"
      fontSize={14}
      fontWeight={700}
      fill="#000000"
    >
      {formatNumber(Number(value))}
    </text>
  );
}

export default function HourlyRevenueTrend({ data }: HourlyRevenueTrendProps) {
  // Desktop (>=1024px) keeps the chart at 100% width, same as before.
  // Below that, force a minimum width so each hourly bar/label keeps
  // the same spacing, and the chart becomes horizontally scrollable
  // instead of squeezing everything into a narrower screen.
  const [viewportWide, setViewportWide] = useState(false);

  useEffect(() => {
    const updateViewport = () => setViewportWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const chartMinWidthPx = viewportWide
    ? undefined
    : Math.max(data.length * 70, 700);

  return (
    <div className="bg-yellow-100 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Hourly Revenue Trend
      </h2>

      <div className="w-full overflow-x-auto">
        <div
          style={{
            minWidth: chartMinWidthPx ? `${chartMinWidthPx}px` : "100%",
          }}
        >
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
  tickFormatter={(value) => formatNumber(Number(value))}
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
                formatter={(value) => formatFullNumber(Number(value))}
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
      </div>
    </div>
  );
}