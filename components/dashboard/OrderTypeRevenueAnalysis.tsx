"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

type Props = {
  data: any[];
  orderTypes: string[];
  orderTypeLabels: string[];
};

const formatAmount = (value: number, short = true) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(value >= 100000000 ? 0 : 1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    return short
      ? `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
      : `₹${Number(value).toLocaleString("en-IN")}`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

// Cycles if there are more order types than colors.
const BAR_COLORS = [
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#16a34a",
  "#8b5cf6",
];

export default function OrderTypeRevenueAnalysis({
  data,
  orderTypes,
  orderTypeLabels,
}: Props) {
  const chartData = data.map((item: any) => ({
    ...item,
    total: orderTypes.reduce(
      (sum: number, type: string) => sum + (item[type] ?? 0),
      0,
    ),
  }));

  // Desktop (>=1024px) keeps the chart at 100% width, same as before.
  // Below that, force a minimum width so bars get real breathing room
  // and the chart becomes horizontally scrollable instead of squeezing
  // every bar into a too-narrow screen.
  const [viewportWide, setViewportWide] = useState(false);

  useEffect(() => {
    const updateViewport = () => setViewportWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const minWidthPx = viewportWide
    ? undefined
    : Math.max(chartData.length * 110, 700);

  return (
    <div className="bg-pink-50 rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Order Type Revenue Analysis
      </h2>

      <div className="w-full overflow-x-auto">
        <div
          style={{
            minWidth: minWidthPx ? `${minWidthPx}px` : "100%",
          }}
        >
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={chartData}
              barGap={4}
              barCategoryGap="20%"
              margin={{ top: 24, right: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />

<YAxis
  width={80}
  tickFormatter={(value) => formatAmount(Number(value))}
/>

              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || payload.length === 0) return null;

                  const total = payload[0]?.payload?.total ?? 0;
                  const dateLabel = new Date(label).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  });

                  return (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "10px 12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        style={{ color: "#000", fontWeight: 600, marginBottom: 6 }}
                      >
                        {dateLabel}
                      </div>
                      {payload.map((entry: any) => (
                        <div
                          key={entry.dataKey}
                          style={{
                            color: entry.color,
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        >
                          {entry.name}: {formatAmount(Number(entry.value))}
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 6,
                          paddingTop: 6,
                          borderTop: "1px solid #e5e7eb",
                          color: "#111827",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        Total: {formatAmount(Number(total))}
                      </div>
                    </div>
                  );
                }}
              />

              <Legend />

              {orderTypes.map((type: string, idx: number) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId="a"
                  name={orderTypeLabels[idx]}
                  fill={BAR_COLORS[idx % BAR_COLORS.length]}
                >
                  {/* Every segment shows its own value, centered within the segment. */}
                  <LabelList
                    dataKey={type}
                    position="center"
                    fill="#111827" // Dark text
                    fontSize={16}
                    fontWeight="700"
                    formatter={(value: any) =>
                      Number(value) > 0 ? formatAmount(Number(value)) : ""
                    }
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}