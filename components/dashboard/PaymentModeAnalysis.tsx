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
  Others: "#8b5cf6",
};

type Props = {
  pieData: any[];
  barData: any[];
};

const formatAmount = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

export default function PaymentModeAnalysis({ pieData, barData }: Props) {
  const totalRevenue = barData.reduce(
    (sum: number, item: any) =>
      sum + item.cash + item.gateway + item.noCharge + item.notPaid,
    0
  );

  const paymentNames: Record<string, string> = {
    cash: "Cash",
    gateway: "Gateway",
    notPaid: "Not Paid",
    noCharge: "Others",
  };


  const average = barData.length === 0 ? 0 : totalRevenue / barData.length;

  return (
    <div className="bg-green-50 rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold text-black mb-6">
        Payment Mode Revenue
      </h2>

      {/* ---------------- PIE CHART ---------------- */}

      <div className="mb-10">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ percent }) => {
                if (!percent || percent < 0.03) return "";
                return `${(percent * 100).toFixed(0)}%`;
              }}
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

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ---------------- BAR CHART ---------------- */}
<div className="mt-10"/>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={barData} margin={{ top: 35 }}>
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

          {/* <Tooltip
            labelStyle={{
              color: "#000",
              fontWeight: 600,
            }}
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Revenue",
            ]}
          /> */}
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

          <Legend />

          <ReferenceLine
            y={average}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Avg ₹${formatAmount(average)}`,
              position: "insideTopRight",
              fill: "#ef4444",
            }}
          />

          <Bar dataKey="gateway" fill="#16a34a" name="Gateway">
            <LabelList
              dataKey="gateway"
              position="top"
              fill="#111827"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            />
          </Bar>

          <Bar dataKey="cash" fill="#2563eb" name="Cash">
            <LabelList
              fill="#111827"
              fontSize={16}
              fontWeight="700"
              dataKey="cash"
              position="top"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            />
          </Bar>

          <Bar dataKey="noCharge" fill="#ef4444" name="Others">
            <LabelList
              fill="#111827"
              dataKey="noCharge"
              position="top"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            />
          </Bar>

          <Bar dataKey="notPaid" fill="#f97316" name="Not Paid">
            <LabelList
              fill="#111827"
              dataKey="notPaid"
              position="top"
              fontSize={16}
              fontWeight="700"
              offset={8}
              formatter={(value: any) => formatAmount(value)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
