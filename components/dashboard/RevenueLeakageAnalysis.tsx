"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  data: any[];
  orderType: string;
};

export default function RevenueLeakageAnalysis({
  data,
  orderType,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5">

      <h2 className=" text-black text-xl font-semibold mb-4">
        Revenue Leakage

        {orderType === "dineIn" && " (Dine In)"}
        {orderType === "takeAway" && " (Take Away)"}
        {orderType === "swiggy" && " (Swiggy)"}
        {orderType === "zomato" && " (Zomato)"}
        {orderType === "All" && " (Default)"}
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="groupType" />

          <YAxis />

          <Tooltip
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Bar
            dataKey="totalRevenue"
            fill="#2563eb"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}