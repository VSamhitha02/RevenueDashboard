"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ReferenceLine,
} from "recharts";

const PIE_COLORS = {
  Gateway: "#16a34a",
  Cash: "#2563eb",
  // UPI: "#06b6d4",
  Card: "#f59e0b",
  Others: "#8b5cf6",
  "Not Paid": "#ef4444",
};

type Props = {
  pieData: any[];
  barData: any[];
  othersBreakdown: Record<string, number>;
};

// const formatAmount = (value: number) => {
//   if (value >= 100000) {
//     return `₹${(value / 100000).toFixed(1)}L`;
//   }

//   return `₹${Number(value).toLocaleString("en-IN")}`;
// };
const formatAmount = (value: number, short = false) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (short && value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};
// Turns raw mode keys like "noCharge" / "dineout" into readable labels
// like "No Charge" / "Dineout" — display only, doesn't touch the data.
const formatModeLabel = (mode: string) => {
  const spaced = mode.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export default function PaymentModeAnalysis({
  pieData,
  barData,
  othersBreakdown,
}: Props) {
  const totalRevenue = barData.reduce(
    (sum: number, item: any) =>
      sum +
      item.cash +
      item.gateway +
      // item.upi +
      item.card +
      item.noCharge +
      item.notPaid,
    0,
  );

  const paymentNames: Record<string, string> = {
    cash: "Cash",
    gateway: "Gateway",
    // upi: "UPI",
    card: "Card",
    noCharge: "Others",
    notPaid: "Not Paid",
  };
  const RADIAN = Math.PI / 180;

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    const radius = outerRadius + 25;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
      >
        {(percent * 100).toFixed(1)}%
      </text>
    );
  };
  const average = barData.length === 0 ? 0 : totalRevenue / barData.length;
  const sortedLegend = [...pieData].sort((a, b) => b.value - a.value);
  const showLabels = barData.length <= 4;
  return (
    <div className="bg-orange-100 rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold text-black mb-6">
        Payment Mode Revenue
      </h2>

      {/* ---------------- PIE CHART + TABLE ---------------- */}

      <div className="mb-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Pie Chart */}
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={renderLabel}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      PIE_COLORS[entry.name as keyof typeof PIE_COLORS] ||
                      "#040404"
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                labelStyle={{
                  color: "#000",
                  fontWeight: 600,
                }}
                formatter={(value: any, name: any) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  paymentNames[name] || name,
                ]}
              />

              <Legend
                content={() => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginTop: "10px",
                    }}
                  >
                    {sortedLegend.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            backgroundColor:
                              PIE_COLORS[
                                item.name as keyof typeof PIE_COLORS
                              ] || "#040404",
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            color:
                              PIE_COLORS[
                                item.name as keyof typeof PIE_COLORS
                              ] || "#040404",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="w-80 mx-auto md:mx-auto lg:mx-0 rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <h3 className="text-lg font-semibold text-black mb-4">
            Payment Summary
          </h3>

          <table className="w-full text-sm text-black">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Mode</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {/* Others Total */}
              <tr className="border-b bg-gray-50">
                <td className="py-2 font-semibold text-black">Others</td>

                <td className="py-2 text-right font-semibold text-black">
                  ₹
                  {Number(
                    pieData.find((item) => item.name === "Others")?.value || 0,
                  ).toLocaleString("en-IN")}
                </td>
              </tr>

              {/* Others Breakdown */}
              {Object.keys(othersBreakdown).length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-3 text-center text-gray-500">
                    No breakdown available
                  </td>
                </tr>
              ) : (
                Object.entries(othersBreakdown)
                  .sort(([, a], [, b]) => b - a) // Highest first
                  .map(([mode, amount]) => (
                    <tr key={mode}>
                      <td className="pl-6 py-2 text-gray-600">
                        ↳ {formatModeLabel(mode)}
                      </td>

                      <td className="py-2 text-right text-gray-600">
                        ₹{Number(amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- BAR CHART ---------------- */}
      <div className="mt-10" />
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={barData} margin={{ top: 35, left: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis
            tickFormatter={(value) => {
              if (value >= 100000) {
                return `₹${(value / 100000).toFixed(1)}L`;
              }

              return `₹${Number(value).toLocaleString("en-IN")}`;
            }}
          />

          <Tooltip
            labelStyle={{
              color: "#000",
              fontWeight: 600,
            }}
            formatter={(value: any, name) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              paymentNames[String(name)] || String(name),
            ]}
          />

          <Legend
            content={() => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginTop: "10px",
                }}
              >
                {sortedLegend.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor:
                          PIE_COLORS[item.name as keyof typeof PIE_COLORS] ||
                          "#040404",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        color:
                          PIE_COLORS[item.name as keyof typeof PIE_COLORS] ||
                          "#040404",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />

          <ReferenceLine
            y={average}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Avg ${formatAmount(average)}`,
              position: "insideTopRight",
              fill: "#ef4444",
            }}
          />

          <Bar dataKey="gateway" fill="#16a34a" name="Gateway">
            {/* <LabelList
              dataKey="gateway"
              position="top"
              fill="#111827"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            /> */}
            {showLabels && (
              <LabelList
                dataKey="gateway"
                position="top"
                fill="#111827"
                fontSize={16}
                fontWeight="700"
                offset={8}
              formatter={(value: any) => formatAmount(value, barData.length === 4)}
              />
            )}
          </Bar>

          <Bar dataKey="cash" fill="#2563eb" name="Cash">
            {/* <LabelList
              fill="#111827"
              fontSize={16}
              fontWeight="700"
              dataKey="cash"
              position="top"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            /> */}
            {showLabels && (
              <LabelList
                dataKey="cash"
                position="top"
                fill="#111827"
                fontSize={16}
                fontWeight="700"
                offset={8}
             formatter={(value: any) => formatAmount(value, barData.length === 4)}
              />
            )}
          </Bar>

          <Bar dataKey="card" fill="#f59e0b" name="Card">
            {/* <LabelList
              fill="#111827"
              fontSize={16}
              fontWeight="700"
              dataKey="card"
              position="top"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            /> */}
            {showLabels && (
              <LabelList
                dataKey="card"
                position="top"
                fill="#111827"
                fontSize={16}
                fontWeight="700"
                offset={8}
              formatter={(value: any) => formatAmount(value, barData.length === 4)}
              />
            )}
          </Bar>

          <Bar dataKey="noCharge" fill="#ef4444" name="Others">
            {/* <LabelList
              fill="#111827"
              dataKey="noCharge"
              position="top"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            /> */}
            {showLabels && (
              <LabelList
                dataKey="noCharge"
                position="top"
                fill="#111827"
                fontSize={16}
                fontWeight="700"
                offset={8}
             formatter={(value: any) => formatAmount(value, barData.length === 4)}
              />
            )}
          </Bar>

          {/* <Bar dataKey="upi" fill="#06b6d4" name="UPI">
            <LabelList
              fill="#111827"
              dataKey="upi"
              position="top"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            />
          </Bar> */}

          <Bar dataKey="notPaid" fill="#f97316" name="Not Paid">
            {/* <LabelList
              fill="#111827"
              dataKey="notPaid"
              position="top"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            /> */}
            {showLabels && (
              <LabelList
                dataKey="notPaid"
                position="top"
                fill="#111827"
                fontSize={16}
                fontWeight="700"
                offset={8}
                formatter={(value: any) => formatAmount(value, barData.length === 4)}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
