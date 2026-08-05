"use client";

import { useEffect, useRef, useState } from "react";
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

const formatAmount = (value: number, short = false) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(value >= 100000000 ? 0 : 1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    return short
      ? `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
      : `₹${Number(value).toLocaleString("en-IN")}`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const formatModeLabel = (mode: string) => {
  const spaced = mode.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const CHART_MARGIN = { top: 80, right: 30, left: 35, bottom: 20 };
const CARD_HEIGHT = 88;
const CARD_TOP = 20;

export default function PaymentModeAnalysis({
  pieData,
  barData,
  othersBreakdown,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalRevenue = barData.reduce(
    (sum: number, item: any) =>
      sum + item.cash + item.gateway + item.card + item.noCharge + item.notPaid,
    0,
  );

  const paymentNames: Record<string, string> = {
    gateway: "Gateway",
    cash: "Cash",
    card: "Card",
    notPaid: "Not Paid",
    noCharge: "Others",
  };

  const RADIAN = Math.PI / 180;
  const pieLabelPositionsRef = useRef<Array<{ y: number; side: "left" | "right" }>>([]);
  const MIN_LABEL_GAP = 16;

  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, index, name } = props;

    if (index === 0) {
      pieLabelPositionsRef.current = [];
    }

    const sliceColor = PIE_COLORS[name as keyof typeof PIE_COLORS] || "#040404";
    const innerX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const innerY = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    const labelRadius = outerRadius + 30;
    let x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    let y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
    const side: "left" | "right" = x >= cx ? "right" : "left";

    for (const prior of pieLabelPositionsRef.current) {
      if (prior.side === side && Math.abs(y - prior.y) < MIN_LABEL_GAP) {
        y = prior.y + MIN_LABEL_GAP;
      }
    }
    pieLabelPositionsRef.current.push({ y, side });

    return (
      <g>
        <line
          x1={innerX}
          y1={innerY}
          x2={x}
          y2={y}
          stroke={sliceColor}
          strokeWidth={1.5}
        />
        <text
          x={x + (side === "right" ? 4 : -4)}
          y={y}
          fill={sliceColor}
          textAnchor={side === "right" ? "start" : "end"}
          dominantBaseline="central"
          fontSize={13}
          fontWeight={600}
        >
          {(percent * 100).toFixed(1)}%
        </text>
      </g>
    );
  };

  const average = barData.length === 0 ? 0 : totalRevenue / barData.length;
  const sortedLegend = [...pieData].sort((a, b) => b.value - a.value);

  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [wrapWidth, setWrapWidth] = useState(0);
  const [viewportWide, setViewportWide] = useState(false);

  useEffect(() => {
    const updateViewport = () => setViewportWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = chartWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWrapWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setWrapWidth(el.clientWidth);

    return () => ro.disconnect();
  }, [barData.length, viewportWide]);

  const minWidthPx = viewportWide
    ? undefined
    : Math.max(barData.length * 130, 900);

  const plotWidth = Math.max(
    0,
    (minWidthPx ?? wrapWidth) - CHART_MARGIN.left - CHART_MARGIN.right,
  );
  const slotWidth = barData.length > 0 ? plotWidth / barData.length : 0;
  const cardWidth = Math.max(72, Math.min(132, slotWidth - 10));
  const useShortNames = cardWidth < 92;

  const handleBarClick = (_data: any, index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const leftPx = (index: number) => {
    const slotCenter = CHART_MARGIN.left + slotWidth * (index + 0.5);
    const totalWidth = minWidthPx ?? wrapWidth;
    return Math.min(
      Math.max(slotCenter, cardWidth / 2 + 4),
      totalWidth - cardWidth / 2 - 4,
    );
  };

  const activeRows = (() => {
    if (activeIndex === null || !barData[activeIndex]) return [];
    const item = barData[activeIndex];
    return [
      { key: "card", label: "Card", short: "Card", value: item.card, color: "#f59e0b" },
      { key: "noCharge", label: "Others", short: "Oth", value: item.noCharge, color: "#8b5cf6" },
      { key: "notPaid", label: "Not Paid", short: "N/P", value: item.notPaid, color: "#ef4444" },
    ].filter((row) => row.value > 0);
  })();

  const connectorTop = CARD_TOP + CARD_HEIGHT;
  const connectorHeight = Math.max(0, CHART_MARGIN.top - connectorTop);

  return (
    <div className="bg-orange-100 rounded-lg shadow-md p-4 sm:p-5">
      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .desktop-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      <h2 className="text-xl font-semibold text-black mb-6">
        Payment Mode Revenue
      </h2>

      {/* ---------------- PIE CHART + TABLE ---------------- */}

      <div className="mb-10 flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
        {/* Pie Chart Container */}
        <div className="flex-1 w-full overflow-x-auto desktop-hide-scrollbar">
          <div className="min-w-[340px] sm:min-w-[480px] h-[340px] sm:h-[400px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderLabel}
                  labelLine={false}
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
                  labelStyle={{ color: "#000", fontWeight: 600 }}
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
                        gap: "12px",
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
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              backgroundColor:
                                PIE_COLORS[
                                  item.name as keyof typeof PIE_COLORS
                                ] || "#040404",
                              display: "inline-block",
                            }}
                          />
                          <span
                            className="text-xs sm:text-sm"
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
        </div>

        {/* Payment Summary Table */}
        <div className="w-full max-w-md mx-auto md:w-80 shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <h3 className="text-base sm:text-lg font-semibold text-black mb-3">
            Payment Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-black">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Mode</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b bg-gray-50">
                  <td className="py-2.5 font-semibold text-black">Others</td>
                  <td className="py-2.5 text-right font-semibold text-black">
                    ₹
                    {Number(
                      pieData.find((item) => item.name === "Others")?.value ||
                        0,
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>

                {Object.keys(othersBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-3 text-center text-gray-500">
                      No breakdown available
                    </td>
                  </tr>
                ) : (
                  Object.entries(othersBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([mode, amount]) => (
                      <tr key={mode} className="border-b border-gray-100 last:border-b-0">
                        <td className="pl-4 sm:pl-6 py-2 text-gray-600 truncate max-w-[140px]">
                          ↳ {formatModeLabel(mode)}
                        </td>
                        <td className="py-2 text-right text-gray-600 font-mono text-xs sm:text-sm">
                          ₹{Number(amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- BAR CHART ---------------- */}

      <div className="relative w-full overflow-x-auto desktop-hide-scrollbar">
        <div
          ref={chartWrapRef}
          className="h-[400px] sm:h-[450px]"
          style={{
            minWidth: minWidthPx ? `${minWidthPx}px` : "100%",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => formatAmount(Number(value), true)}
              />
              <Tooltip
                labelStyle={{ color: "#000", fontWeight: 600 }}
                formatter={(value: any, name: any) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  paymentNames[name] || name,
                ]}
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

              <Bar
                dataKey="gateway"
                stackId="payment"
                fill="#16a34a"
                name="Gateway"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="gateway"
                  position="center"
                  fill="#000000"
                  fontSize={14}
                  fontWeight="900"
                  formatter={(v: any) => formatAmount(v, true)}
                />
              </Bar>

              <Bar
                dataKey="cash"
                stackId="payment"
                fill="#2563eb"
                name="Cash"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="cash"
                  position="center"
                  fill="#000000"
                  fontSize={14}
                  fontWeight="900"
                  formatter={(v: any) => formatAmount(v, true)}
                />
              </Bar>

              <Bar
                dataKey="card"
                stackId="payment"
                fill="#f59e0b"
                name="Card"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="card"
                  position="center"
                  fill="#000000"
                  fontSize={14}
                  fontWeight="900"
                  formatter={(v: any) => (v > 3000 ? formatAmount(v, true) : "")}
                />
              </Bar>

              <Bar
                dataKey="noCharge"
                stackId="payment"
                fill="#8b5cf6"
                name="Others"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="noCharge"
                  position="center"
                  fill="#000000"
                  fontSize={14}
                  fontWeight="900"
                  formatter={(v: any) => (v > 3000 ? formatAmount(v, true) : "")}
                />
              </Bar>

              <Bar
                dataKey="notPaid"
                stackId="payment"
                fill="#ef4444"
                name="Not Paid"
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
                <LabelList
                  dataKey="notPaid"
                  position="center"
                  fill="#000000"
                  fontSize={14}
                  fontWeight="900"
                  formatter={(v: any) => (v > 3000 ? formatAmount(v, true) : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {activeIndex !== null && activeRows.length > 0 && slotWidth > 0 && (
          <>
            <div
              className="absolute bg-white border border-gray-300 rounded-md shadow-md px-2 py-1.5 flex flex-col"
              style={{
                top: CARD_TOP,
                left: `${leftPx(activeIndex)}px`,
                transform: "translateX(-50%)",
                width: cardWidth,
                height: CARD_HEIGHT,
                zIndex: 10,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-black font-semibold truncate">
                  Split — {barData[activeIndex]?.date}
                </span>
                <button
                  type="button"
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-700 text-xs leading-none shrink-0 ml-1"
                  onClick={() => setActiveIndex(null)}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-0.5 flex-1 justify-center">
                {activeRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between gap-1 text-[10px] leading-tight"
                  >
                    <span className="flex items-center gap-1 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-sm shrink-0"
                        style={{ background: row.color }}
                      />
                      <span
                        className="truncate font-medium"
                        style={{ color: row.color }}
                      >
                        {useShortNames ? row.short : row.label}
                      </span>
                    </span>
                    <span className="text-black font-semibold whitespace-nowrap">
                      {formatAmount(row.value, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {connectorHeight > 0 && (
              <div
                className="absolute"
                style={{
                  top: connectorTop,
                  left: `${leftPx(activeIndex)}px`,
                  height: connectorHeight,
                  borderLeft: "1.5px dashed #9ca3af",
                  zIndex: 9,
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}