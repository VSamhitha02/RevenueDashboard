"use client";
import HourlySegmentRevenue from "./HourlySegmentRevenue";
import { useEffect, useState } from "react";
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
  LabelList
} from "recharts";

import {
  getItemSegmentDashboard,
  getHourlySegmentRevenue,
} from "@/utils/chartData";

type Props = {
  data: any; // RAW response JSON object
  selectedSegment:string
  cutoffHour: number
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatChartValue = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(value >= 100000000 ? 0 : 1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const BAR_COLORS = ["#22c55e", "#f97316", "#3b82f6", "#a855f7", "#ef4444", "#14b8a6"];

export default function ItemSegmentDashboard({ data,selectedSegment, cutoffHour}: Props) {
  //const [selectedSegment, setSelectedSegment] = useState("");

const dashboard = data
  ? getItemSegmentDashboard(data, selectedSegment)
  : {
      segments: [],
      cards: {
        totalRevenue: 0,
        avgRevenuePerDay: 0,
        totalOrders: 0,
        avgOrderValue: 0,
      },
      chartData: [],
      topItems: [],
      orderTypes: [],
      orderTypeLabels: [],
    };
console.log("selectedSegment:", selectedSegment);


const {
  segments,
  cards,
  chartData,
  topItems,
  orderTypes,
  orderTypeLabels,
} = dashboard;

// useEffect(() => {
//   if (!selectedSegment && segments.length > 0) {
//     setSelectedSegment(segments[0]);
//   }
// }, [segments, selectedSegment]);

 
const hourlySegmentData = data
  ? getHourlySegmentRevenue(
      data,
      selectedSegment,
      cutoffHour
    )
  : [];

 
console.log(topItems);
  // Calculate overall totals across all table rows
 const tableTotals = topItems.reduce(
  (acc: any, item: any) => {
    const finalCost = Number(item.finalCost ?? 0);
    const discount = Number(item.discountAmount ?? 0);
    const taxes = Number(item.itemTax ?? 0);
    const charges = Number(item.charges ?? 0);
    const quantity = Number(item.quantity ?? 0);

    const rowTotal = finalCost - discount + taxes + charges;

    return {
      finalCost: acc.finalCost + finalCost,
      discount: acc.discount + discount,
      taxes: acc.taxes + taxes,
      charges: acc.charges + charges,
      quantity: acc.quantity + quantity,
      grandTotal: acc.grandTotal + rowTotal,
    };
  },
  {
    finalCost: 0,
    discount: 0,
    taxes: 0,
    charges: 0,
    quantity: 0,
    grandTotal: 0,
  }
);

  // Desktop (>=1024px) keeps the chart at 100% width, same as before.
  // Below that, force a minimum width so bars get real breathing room
  // and the chart becomes horizontally scrollable instead of squeezing
  // everything into a too-narrow screen.
  const [viewportWide, setViewportWide] = useState(false);

  useEffect(() => {
    const updateViewport = () => setViewportWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const chartMinWidthPx = viewportWide
    ? undefined
    : Math.max(chartData.length * 110, 700);

  return (
    <div className="space-y-8">
      {/* ---------------- Filter ---------------- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-black font-bold">Segment Report</h2>

        {/* <select
          value={selectedSegment}
          onChange={(e) => setSelectedSegment(e.target.value)}
          className="border text-black rounded-md px-4 py-2"
        >
          {segments.map((segment: string) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>   */}
      </div>

      {/* ---------------- Cards ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl bg-purple-200 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">Total Revenue</p>
          <h2 className="text-2xl font-bold mt-2">{formatCurrency(cards.totalRevenue)}</h2>
        </div>

        <div className="rounded-xl bg-purple-300 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">Average Revenue Per Day</p>
          <h2 className="text-2xl font-bold mt-2">{formatCurrency(cards.avgRevenuePerDay)}</h2>
        </div>

        <div className="rounded-xl bg-orange-200 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">No. of Items</p>
          <h2 className="text-2xl font-bold mt-2">{cards.totalOrders}</h2>
        </div>

        <div className="rounded-xl bg-red-300 text-black p-5 shadow-lg">
          <p className="text-sm text-gray-700 font-semibold">Average Order Value</p>
          <h2 className="text-2xl font-bold mt-2">{formatCurrency(cards.avgOrderValue)}</h2>
        </div>
      </div>

      {/* ---------------- Chart ---------------- */}
      <div className="bg-gray-100 rounded-xl shadow p-5">
        <h3 className="text-lg text-black font-semibold mb-1 text-center">
          Order Type Wise Revenue
        </h3>

        <div className="w-full overflow-x-auto">
          <div
            style={{
              minWidth: chartMinWidthPx ? `${chartMinWidthPx}px` : "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart
                data={chartData}
                margin={{ top: 40, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#000000" }} />
<YAxis
  tickFormatter={(v) => formatChartValue(Number(v))}
  tick={{ fill: "#000000" }}
/>
                <Tooltip
                  labelStyle={{ color: "#000", fontWeight: 600 }}
                  itemStyle={{ color: "#000" }}
                  formatter={(value: any) => formatChartValue(Number(value))}
                />
                <Legend wrapperStyle={{ color: "#000000" }} />

                <ReferenceLine
                  y={cards.avgRevenuePerDay}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg: ${formatChartValue(cards.avgRevenuePerDay)}`,
                    position: "insideTopRight",
                    fill: "#3b82f6",
                    fontSize: 14,
                    fontWeight: 700,
                    dy: -10,
                  }}
                />
                {orderTypes.map((type: string, idx: number) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    name={orderTypeLabels[idx]}
                    fill={BAR_COLORS[idx % BAR_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  >
                    {/* Stacked segments sit at varying heights, so each
                        value is centered within its own slice instead of
                        "top" (which would land at the segment boundary
                        and clash with the segment stacked above it). */}
                    <LabelList
                      dataKey={type}
                      position="center"
                      fill="#000000"
                      fontSize={13}
                      fontWeight="700"
                      formatter={(value: any) =>
                        value > 0 ? formatChartValue(Number(value)) : ""
                      }
                    />
                  </Bar>
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ---------------- Hourly Revenue ---------------- */}
      <HourlySegmentRevenue chartData={hourlySegmentData} />

      {/* ---------------- Table ---------------- */}
      <div className="bg-indigo-100 rounded-xl shadow p-5">
        <h3 className="text-xl text-black font-semibold mb-4 text-center">
          Item Wise Revenue Details
        </h3>

        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-200">
            <th className="px-3 py-2 text-center text-black">S. No.</th>
                <th className="px-3 py-2 text-left text-black">Item Name</th>
                   <th className="px-3 py-2 text-right text-black">Quantity</th>
                <th className="px-3 py-2 text-right text-black">Item Total</th>
                <th className="px-3 py-2 text-right text-black">Discount</th>
                <th className="px-3 py-2 text-right text-black">Taxes</th>
                <th className="px-3 py-2 text-right text-black">Charges</th>
             
                <th className="px-3 py-2 text-right text-black">Total</th>
              </tr>
            </thead>

            <tbody>
              {topItems.map((item: any, index: number) => {
                const finalCost = Number(item.finalCost );
                const discount = Number(item.discountAmount );
                const taxes = Number(item.itemTax   );
                const charges = Number(item.charges );
                const quantity = Number(item.quantity );

                // Formula: Total = Item Total - Discount + Taxes + Charges
                const rowTotal = finalCost - discount + taxes + charges;

                return (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0
                        ? "bg-blue-100 border-b border-blue-200"
                        : "bg-blue-300 border-b border-blue-200"
                    }
                  >
                   <td className="px-3 py-1.5 leading-tight text-center text-black">
  {index + 1}
</td>
                    <td className="px-3 py-1.5 leading-tight text-black">{item.itemName}</td>
                      <td className="px-3 py-1.5 leading-tight text-right text-black">
                      {quantity}
                    </td>
                    <td className="px-3 py-1.5 leading-tight text-right text-black">
                      {formatCurrency(finalCost)}
                    </td>
                    <td className="px-3 py-1.5 leading-tight text-right text-black">
                      {formatCurrency(discount)}
                    </td>
                    <td className="px-3 py-1.5 leading-tight text-right text-black">
                      {formatCurrency(taxes)}
                    </td>
                    <td className="px-3 py-1.5 leading-tight text-right text-black">
                      {formatCurrency(charges)}
                    </td>
                  
                    <td className="px-3 py-1.5 leading-tight text-right text-black font-semibold">
                      {formatCurrency(rowTotal)}
                    </td>
                  </tr>
                );
              })}

              {/* Total Footer Row */}
              <tr className="font-bold text-black bg-yellow-200">
                <td className="px-3 py-2 text-black leading-tight" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
                     {tableTotals.quantity} 
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
                  {formatCurrency(tableTotals.finalCost)}
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
                  {formatCurrency(tableTotals.discount)}
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
                 {formatCurrency(tableTotals.taxes)} 
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
              {formatCurrency(tableTotals.charges)}
                </td>
                <td className="px-3 py-2 text-right text-black leading-tight">
                  {formatCurrency(tableTotals.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}