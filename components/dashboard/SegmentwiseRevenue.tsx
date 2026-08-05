"use client";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { getSegmentWiseRevenue } from "@/utils/chartData";
import Link from "next/link";

type Props = {
  data: any; // RAW response JSON object
  fseId: string;
  cutoffHour: number;
  dateFilter: string;
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

// Converts "Beverages", "Health & Hygiene", etc. into a URL-safe slug
const toSlug = (str: string) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PIE_COLORS = ["#22c55e", "#f97316", "#3b82f6", "#a855f7", "#ef4444"];

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: item.color,
          }}
        />
        <span
          style={{
            fontWeight: 700,
            color: "#000",
          }}
        >
          {item.payload.name}
        </span>
      </div>

      <div style={{ color: "#555" }}>
        {formatCurrency(item.value)}
      </div>
    </div>
  );
};

export default function SegmentwiseRevenue({
  data,
  fseId,
  cutoffHour,
  dateFilter,
}: Props) {
  // ---------------- Segment-wise totals ----------------
  const rawSegmentRevenue = data ? getSegmentWiseRevenue(data) : [];

  // Map and compute the true row total for each segment
  const segmentRevenue = rawSegmentRevenue.map((s: any) => {
    const itemTotal = Number(s.itemTotal ?? s.finalCost ?? 0);
    const discount = Number(s.discount ?? 0);
    const taxes = Number(s.taxes ?? 0);
    const charges = Number(s.charges ?? 0);
    const quantity = Number(s.quantity ?? 0);

    const grandTotal = itemTotal - discount + taxes + charges;

    return {
      ...s,
      quantity,
      itemTotal,
      discount,
      taxes,
      charges,
      grandTotal,
    };
  });

  const top5Segments = segmentRevenue.slice(0, 5);
  const remainingSegments = segmentRevenue.slice(5);

  const pieData = [
    ...top5Segments.map((s: any) => ({
      name: s.segment,
      value: s.grandTotal,
    })),
    ...(remainingSegments.length > 0
      ? [
          {
            name: "Others",
            value: remainingSegments.reduce(
              (sum: number, s: any) => sum + s.grandTotal,
              0
            ),
          },
        ]
      : []),
  ];

  const remainingTotalGrandTotal = remainingSegments.reduce(
    (sum: number, s: any) => sum + s.grandTotal,
    0
  );

  // Calculate table footer totals across all segment rows
  const tableTotals = segmentRevenue.reduce(
    (acc: any, s: any) => ({
      quantity: acc.quantity + s.quantity,
      itemTotal: acc.itemTotal + s.itemTotal,
      discount: acc.discount + s.discount,
      taxes: acc.taxes + s.taxes,
      charges: acc.charges + s.charges,
      grandTotal: acc.grandTotal + s.grandTotal,
    }),
    {
      quantity: 0,
      itemTotal: 0,
      discount: 0,
      taxes: 0,
      charges: 0,
      grandTotal: 0,
    }
  );

  return (
    <div className="bg-yellow-100 rounded-xl shadow p-5">
      <h3 className="text-2xl text-black font-bold mb-4 text-left">
        Segment Wise Revenue
      </h3>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Pie chart */}
        <div className="w-full lg:w-1/2 min-w-0" style={{ minHeight: 380 }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={440} minWidth={280}>
              <PieChart
                margin={{
                  top: 40,
                  right: 30,
                  bottom: 35,
                  left: 30,
                }}
              >
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="52%"
                  outerRadius={105}
                  label={(entry: any) => formatChartValue(Number(entry.value))}
                >
                  {pieData.map((entry: any, idx: number) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.name === "Others"
                          ? "#9ca3af"
                          : PIE_COLORS[idx % PIE_COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomPieTooltip />} />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[380px] text-black text-sm">
              No segment data available to chart.
            </div>
          )}
        </div>

        {/* Remaining segments table */}
        <div className="w-full lg:w-1/2 min-w-0 overflow-auto bg-white rounded-xl border border-gray-100 p-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-3 py-2 text-left text-black font-bold">Segment</th>
                <th className="px-3 py-2 text-right text-black font-bold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {remainingSegments.length > 0 ? (
                <>
                  <tr className="border-b border-gray-200">
                    <td className="px-3 py-2 leading-tight text-black font-bold">
                      Others
                    </td>
                    <td className="px-3 py-2 leading-tight text-right text-black font-bold">
                      {formatCurrency(remainingTotalGrandTotal)}
                    </td>
                  </tr>

                  {remainingSegments.map((s: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 py-1.5 pl-8 leading-tight text-gray-500">
                        <span className="mr-1">↳</span>
                        {s.segment}
                      </td>
                      <td className="px-3 py-1.5 leading-tight text-right text-gray-500">
                        {formatCurrency(s.grandTotal)}
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={2} className="px-3 py-3 text-center text-black text-sm">
                    No remaining segments — all segments are in the top 5.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- All Segments Table ---------------- */}
      <div className="bg-indigo-100 rounded-xl shadow p-5 mt-6">
        <h3 className="text-xl text-black font-semibold mb-4 text-center">
          Segment Wise Revenue Details
        </h3>

        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-200">
                <th className="px-3 py-2 text-center text-black">S. No.</th>
                <th className="px-3 py-2 text-left text-black">Segment</th>
                <th className="px-3 py-2 text-right text-black">Quantity</th>
                <th className="px-3 py-2 text-right text-black">Item Total</th>
                <th className="px-3 py-2 text-right text-black">Discount</th>
                <th className="px-3 py-2 text-right text-black">Taxes</th>
                <th className="px-3 py-2 text-right text-black">Charges</th>
                <th className="px-3 py-2 text-right text-black">Total Revenue</th>
              </tr>
            </thead>

            <tbody>
              {segmentRevenue.map((s: any, index: number) => (
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
                  <td className="px-3 py-1.5 leading-tight text-black">
                    <Link
                      href={`/daily/${fseId}/segment/${toSlug(
                        s.segment
                      )}?cutoffHour=${cutoffHour}&dateFilter=${encodeURIComponent(dateFilter)}`}
                      className="text-black hover:underline"
                    >
                      {s.segment}
                    </Link>
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {s.quantity.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {formatCurrency(s.itemTotal)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {formatCurrency(s.discount)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {formatCurrency(s.taxes)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black">
                    {formatCurrency(s.charges)}
                  </td>
                  <td className="px-3 py-1.5 leading-tight text-right text-black font-semibold">
                    {formatCurrency(s.grandTotal)}
                  </td>
                </tr>
              ))}

              {segmentRevenue.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-center text-black text-sm">
                    No segment data available.
                  </td>
                </tr>
              )}

              {segmentRevenue.length > 0 && (
                <tr className="font-bold text-black bg-yellow-200">
                  <td className="px-3 py-2 text-black leading-tight" colSpan={2}>
                    Total
                  </td>
                  <td className="px-3 py-2 text-right text-black leading-tight">
                    {tableTotals.quantity.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-right text-black leading-tight">
                    {formatCurrency(tableTotals.itemTotal)}
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}