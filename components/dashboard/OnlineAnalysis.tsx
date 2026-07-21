"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  data: any
  ;
  orderType: string;
};

export default function OnlineAnalysis({ data, orderType }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
<h2 className="text-xl font-semibold">
  Online Revenue Analysis
  {orderType !== "All" &&
    (orderType === "dineIn" || orderType === "takeAway") &&
    ` (${orderType})`}
</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="type" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="revenue"
            fill="#f97316"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}