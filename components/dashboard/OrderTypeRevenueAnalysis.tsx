"use client";

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

const formatAmount = (value: number) => {
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }

  // Show complete number for anything below 1 lakh
  return value.toLocaleString("en-IN");
};

// Cycles if there are more order types than colors.
const BAR_COLORS = ["#0ea5e9", "#f59e0b", "#ef4444", "#ec4899", "#16a34a", "#8b5cf6"];

export default function OrderTypeRevenueAnalysis({ data, orderTypes, orderTypeLabels }: Props) {
  const chartData = data.map((item: any) => ({
    ...item,
    total: orderTypes.reduce((sum: number, type: string) => sum + (item[type] ?? 0), 0),
  }));

  // Top-most bar in the stack carries the "total" label above it.
  const lastIndex = orderTypes.length - 1;

  return (
    <div className="bg-purple-100 rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Order Type Revenue Analysis
      </h2>

      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={chartData} barGap={4} barCategoryGap="20%"  margin={{ top: 8  }}>
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
  tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
/>

          <Tooltip
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })
            }
            labelStyle={{
              color: "#000",
              fontWeight: 600,
            }}
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              name,
            ]}
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
              <LabelList
  dataKey={idx === lastIndex ? "total" : type}
  position={idx === lastIndex ? "top" : "center"}
  fill="#111827"          // Dark text
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
  );
}
