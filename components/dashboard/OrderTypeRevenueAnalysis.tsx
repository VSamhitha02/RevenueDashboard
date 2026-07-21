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
};
const formatAmount = (value: number) => {
  if (value >= 100000)
    return `${(value / 100000).toFixed(1)}L`;

  if (value >= 1000)
    return `${(value / 1000).toFixed(1)}K`;

  return value.toString();
};
export default function OrderTypeRevenueAnalysis({ data }: Props) {
  const chartData = data.map((item: any) => ({
  ...item,
  total:
    (item.dineIn ?? 0) +
    (item.takeAway ?? 0) +
    (item.swiggy ?? 0) +
    (item.zomato ?? 0),
}));
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Order Type Revenue Analysis
      </h2>

      <ResponsiveContainer width="100%" height={450}>
        <BarChart
  data={chartData}
  barGap={4}
  barCategoryGap="20%"
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
            tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
          />

<Tooltip
  formatter={(value: any, name: any) => [
    `₹${Number(value).toLocaleString("en-IN")}`,
    name,
  ]}
/>

          <Legend />
          {/* <Bar
  dataKey="offline"
  name="Offline"
  fill="#2563eb"
/> */}

{/* <Bar
  dataKey="online"
  name="Online"
  fill="#16a34a"
/> */}
<Bar
  dataKey="zomato"
  stackId="a"
  name="Zomato Revenue"
  fill="#ec4899"
>
    <LabelList
    dataKey="zomato"
    position="center"
    formatter={(value: any) =>
      value > 0 ? formatAmount(Number(value)) : ""
    }
  />
</Bar>
<Bar
  dataKey="swiggy"
  stackId="a"
  name="Swiggy Revenue"
  fill="#ef4444"
>
    <LabelList
    dataKey="swiggy"
    position="center"
    formatter={(value: any) =>
      value > 0 ? formatAmount(Number(value)) : ""
    }
  />
</Bar>
<Bar
  dataKey="takeAway"
  stackId="a"
  name="Take Away Revenue"
  fill="#f59e0b"
>
    <LabelList
    dataKey="takeAway"
    position="center"
    formatter={(value: any) =>
      value > 0 ? formatAmount(Number(value)) : ""
    }
  />
</Bar>


<Bar
  dataKey="dineIn"
  stackId="a"
  name="Dine In Revenue"
  fill="#0ea5e9"
  >

  <LabelList
    dataKey="total"
    position="top"
    formatter={(value: any) =>
      formatAmount(Number(value))
    }
  />
</Bar>
{/* <Bar
  dataKey="takeAway"
  stackId="a"
  name="Take Away Revenue"
  fill="#f59e0b"
/> */}

{/* <Bar
  dataKey="swiggy"
  stackId="a"
  name="Swiggy Revenue"
  fill="#ef4444"
/> */}

{/* <Bar
  dataKey="zomato"
  stackId="a"
  name="Zomato Revenue"
  fill="#ec4899"
/> */}

          {/* Offline Total */}
          {/* <Line
            type="monotone"
            dataKey="offline"
            stroke="#2563eb"
            strokeWidth={3}
            name="Offline"
          /> */}

          {/* Dine In */}
          {/* <Line
            type="monotone"
            dataKey="dineIn"
            stroke="#16a34a"
            strokeWidth={3}
            name="Dine In"
          /> */}

          {/* Take Away */}
          {/* <Line
            type="monotone"
            dataKey="takeAway"
            stroke="#f59e0b"
            strokeWidth={3}
            name="Take Away"
          /> */}

          {/* Online Total */}
          {/* <Line
            type="monotone"
            dataKey="online"
            stroke="#8b5cf6"
            strokeWidth={3}
            name="Online"
          /> */}

          {/* Swiggy */}
          {/* <Line
            type="monotone"
            dataKey="swiggy"
            stroke="#ef4444"
            strokeWidth={3}
            name="Swiggy"
          /> */}

          {/* Zomato */}
          {/* <Line
            type="monotone"
            dataKey="zomato"
            stroke="#ec4899"
            strokeWidth={3}
            name="Zomato"
          /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}