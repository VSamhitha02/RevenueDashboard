"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ReferenceLine,
  Label,
  LabelList,
} from "recharts";

type Props = {
  data: any[];
  dateOption: string;
};

const formatNumber = (value: number) => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

export default function RevenueTrend({ data, dateOption }: Props) {
  const avg =
    data.length > 0
      ? data[0]?.average ??
        data.reduce((sum, d) => sum + (d.revenue || 0), 0) / data.length
      : 0;

  const title = ["Today", "Yesterday"].includes(dateOption)
    ? "Revenue Trend"
    : "Total Revenue Trend";

  const isSingleDay = data.length <= 1;

  if (isSingleDay) {
    return null;
  }

  return (
    <div className="bg-pink-50 rounded-xl shadow-md p-6">
      <h2 className="text-3xl font-bold mb-5 text-black">{title}</h2>

      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart
          data={data}
          barGap={6}
          barCategoryGap="18%"
          margin={{
            top: 40,
            right: 30,
            left: 45,
            bottom: 35,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={90}
            tick={{ fontSize: 14 }}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            }
          >
            <Label
              value="Date"
              position="insideBottom"
              offset={-5}
              style={{
                fill: "#000",
                fontWeight: 700,
                fontSize: 18,
              }}
            />
          </XAxis>

          <YAxis
            tickFormatter={(value) =>
              `₹${Number(value).toLocaleString("en-IN")}`
            }
            tick={{ fontSize: 14 }}
            // give a little headroom above the tallest bar's label
            domain={[0, (max: number) => Math.ceil(max * 1.15)]}
          >
            <Label
              value="Total Revenue"
              angle={-90}
              position="insideLeft"
              offset={-30}
              style={{
                fill: "#000",
                fontWeight: 700,
                fontSize: 18,
              }}
            />
          </YAxis>

          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload || payload.length === 0) return null;

              const revenue = payload.find(
                (p: any) => p.dataKey === "revenue"
              )?.value;

              const formattedDate = new Date(label).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              );

              return (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "10px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      color: "#111827",
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {formattedDate}
                  </div>
                  <div style={{ color: "#2563eb", fontSize: 14 }}>
                    Total Revenue :{" "}
                    <span style={{ fontWeight: 700 }}>
                      ₹{Number(revenue).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ color: "#ef4444", fontSize: 14 }}>
                    Average :{" "}
                    <span style={{ fontWeight: 700 }}>
                      ₹{Number(avg).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            }}
          />

          <Bar
            dataKey="revenue"
            name="Total Revenue"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="revenue"
              position="top"
              content={(props: any) => {
                const { x, y, width, value } = props;

                return (
                  <text
                    x={x + width / 2}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#000"
                    fontSize={14}
                    fontWeight="700"
                  >
                    {formatNumber(Number(value))}
                  </text>
                );
              }}
            />
          </Bar>

          {/* Average line, drawn only for reference — label sits in a fixed
              corner instead of tracking the first data point, so it never
              collides with a bar's value label. */}
          <ReferenceLine
            y={avg}
            stroke="#ef4444"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            ifOverflow="extendDomain"
            label={{
              value: `Avg ₹${formatNumber(avg)}`,
              position: "insideTopRight",
              fill: "#ef4444",
              fontWeight: 700,
              fontSize: 13,
              offset: 10,
            }}
          />

          {/* Keep the Line so the "average" series still shows in the
              Tooltip legend/hover, but hide its own dots/labels since the
              ReferenceLine above already renders the visual line + label. */}
          <Line
            type="monotone"
            dataKey="average"
            name="Average"
            stroke="transparent"
            strokeWidth={0}
            dot={false}
            activeDot={false}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
