"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

import { getItemSegmentDashboard } from "@/utils/chartData";

type Props = {
  data: any; // pass your RAW axios response here (the whole JSON object)
};

const formatCurrency = (value: number) =>
  `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function ItemSegmentDashboard({ data }: Props) {
  const [selectedSegment, setSelectedSegment] = useState("All");

  const dashboard = getItemSegmentDashboard(data, selectedSegment);
  
  console.log("Dashboard", dashboard);
console.log("Cards", dashboard.cards);
console.log("ChartData", dashboard.chartData);
  const { segments, cards, chartData, topItems } = dashboard;

  // auto-select "Food" segment if present, only once
  useEffect(() => {
    if (segments.includes("Food") && selectedSegment === "All") {
      setSelectedSegment("Food");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments.length]);

  const totalOrdersSum = topItems.reduce(
    (s: number, i: any) => s + i.orders,
    0
  );
  const totalRevenueSum = topItems.reduce(
    (s: number, i: any) => s + i.totalRevenue,
    0
  );
  const totalAvgRevenuePerDaySum = topItems.reduce(
    (s: number, i: any) => s + i.avgRevenuePerDay,
    0
  );
  const totalAOV = totalOrdersSum === 0 ? 0 : totalRevenueSum / totalOrdersSum;
console.log("FULL DATA", data);
console.log("offlineItems", data.offlineItems);
console.log("onlineItems", data.onlineItems);

console.log("FIRST OFFLINE ITEM");
console.log(data.offline_item_wise[0]);

console.log("FIRST ONLINE ITEM");
console.log(data.online_item_wise[0]);

console.log("online_item_wise", data.online_item_wise);
  return (
    <div className="space-y-8">
      {/* ---------------- Filter ---------------- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-black font-bold">{selectedSegment} Segment Report</h2>

        <select
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value)}
          className="border text-black rounded-md px-4 py-2"
        >
          {segments.map((segment: string) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Cards ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl bg-purple-200 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">Total Revenue</p>
          <h2 className="text-2xl font-bold mt-2">
            {formatCurrency(cards.totalRevenue)}
          </h2>
        </div>

        <div className="rounded-xl bg-purple-300 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">
            Average Revenue Per Day
          </p>
          <h2 className="text-2xl font-bold mt-2">
            {formatCurrency(cards.avgRevenuePerDay)}
          </h2>
        </div>

        <div className="rounded-xl bg-orange-200 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">No. of Orders</p>
          <h2 className="text-2xl font-bold mt-2">{cards.totalOrders}</h2>
        </div>

        <div className="rounded-xl bg-red-300 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">
            Average Order Value
          </p>
          <h2 className="text-2xl font-bold mt-2">
            {formatCurrency(cards.avgOrderValue)}
          </h2>
        </div>
      </div>

      {/* ---------------- Chart ---------------- */}
      <div className="bg-gray-100 rounded-xl shadow p-5">
        <h3 className="text-lg text-black font-semibold mb-1 text-center">
          Order Type Wise Revenue
        </h3>

        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
            <Tooltip labelStyle={{
    color: "#000",
    fontWeight: 600,
  }}
  labelFormatter={(label) =>
    new Date(label).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })
  }
   formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />

            <ReferenceLine
              y={cards.avgRevenuePerDay}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              label={{ value: "Average", position: "right", fill: "#3b82f6" }}
            />

            <Bar dataKey="dineIn" name="DINEIN" fill="#22c55e" />
            <Bar dataKey="takeAway" name="TAKEAWAY" fill="#f97316" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ---------------- Top 10 Table ---------------- */}
      <div className="bg-indigo-100 rounded-xl shadow p-5">
        <h3 className="text-xl text-black font-semibold mb-4 text-center">
          Item Wise Revenue Details
        </h3>

        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-200">
                <th className="px-3 py-2 text-left text-black">Segment</th>
                <th className="px-3 py-2 text-left text-black">Item Name</th>
                <th className="px-3 py-2 text-right text-black">Total Revenue</th>
                <th className="px-3 py-2 text-right text-black">Avg. Item Revenue/Day</th>
                <th className="px-3 py-2 text-right text-black">No. of Orders</th>
                <th className="px-3 py-2 text-right text-black">AOV</th>
              </tr>
            </thead>

            <tbody>
              {topItems.map((item: any, index: number) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-blue-100 border-b border-blue-200"
                      : "bg-blue-300 border-b border-blue-200"
                  }
                >
                  <td className="px-3 py-1.5 leading-tight text-black">{item.segment}</td>
                  <td className="px-3 py-1.5 leading-tight text-black">{item.itemName}</td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-black text-right">
                    {formatCurrency(item.avgRevenuePerDay)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-black text-right">
                    {item.orders}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-black text-right">
                    {formatCurrency(item.avgOrderValue)}
                  </td>
                </tr>
              ))}

              <tr className="font-bold text-black bg-yellow-200">
                <td className="px-3 py-1.5 text-black leading-tight" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-1.5 text-black leading-tight text-right">
                  {formatCurrency(totalRevenueSum)}
                </td>
                <td className="px-3 py-1.5 leading-tight text-black text-right">
                  {formatCurrency(totalAvgRevenuePerDaySum)}
                </td>
                <td className="px-3 py-1.5 leading-tight text-black text-right">
                  {totalOrdersSum}
                </td>
                <td className="px-3 py-1.5 leading-tight text-black text-right">
                  {formatCurrency(totalAOV)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}