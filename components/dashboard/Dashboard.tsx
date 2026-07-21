"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";

import FilterBar from "./FilterBar";
import SummaryCards from "./SummaryCards";
import RevenueTrend from "./RevenueTrend";
import OrderTypeRevenueAnalysis from "./OrderTypeRevenueAnalysis";
import PaymentModeAnalysis from "./PaymentModeAnalysis";
import ItemSegmentDashboard from "./ItemSegmentDashboard";
import HourlyRevenueTrend from "./HourlyRevenueTrend";
// import HourlyRevenueTrend from "./HourlyRevenueTrend";
// import RevenueLeakageAnalysis from "./RevenueLeakageAnalysis";
// import DailyAverageTrend from "./DailyAverageTrend";
// import OverallAnalysis from "./OverallAnalysis";

import {
  getSummaryData,
  getRevenueTrend,
  getOrderTypeRevenueAnalysis,
  getPaymentModeAnalysis,
  getDailyAverageTrend,
  getRevenueLeakageAnalysis,
  getOverallAnalysis,
  getHourlyRevenueTrend,
} from "@/utils/chartData";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hourlySource, setHourlySource] = useState("All");
  const [orderType, setOrderType] = useState("All");
// const hourlyRevenue = getHourlyRevenueTrend(data, hourlySource);

// console.log("Offline Hour Wise", data.offline_revenue_hour_wise);
// console.log("Online Hour Wise", data.online_revenue_hour_wise);
// console.log("First Offline Hour", data.offline_revenue_hour_wise?.[0]);
// console.log("First Online Hour", data.online_revenue_hour_wise?.[0]);
// console.log("Hourly Revenue", hourlyRevenue);

// console.log("First Offline Hour", data.offline_revenue_hour_wise?.[0]);
// console.log("First Online Hour", data.online_revenue_hour_wise?.[0]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getRevenueDashboard({
          fseIds: ["8iAd7dWWxD5XLz50Dv0l"],
          startDate: "2026-07-13 04:00:00",
          endDate: "2026-07-20 04:00:00",
          orderTypes: [],
          cutoffHour: 4,
        });

        // console.log("API Response:", response);
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!data) {
    return <div className="p-10">No data found</div>;
  }
const hourlyRevenue = getHourlyRevenueTrend(data); // no source arg now
// console.log("Offline Hour Wise", data?.offline_revenue_hour_wise);
// console.log("Online Hour Wise", data?.online_revenue_hour_wise);

// console.log("First Offline Hour", data?.offline_revenue_hour_wise?.[0]);
// console.log("First Online Hour", data?.online_revenue_hour_wise?.[0]);

  // Generate all chart data AFTER data is available
  const summary = getSummaryData(data, orderType);
  const revenueTrend = getRevenueTrend(data, orderType);
  const paymentMode = getPaymentModeAnalysis(data, orderType);
  const orderTypeRevenue = getOrderTypeRevenueAnalysis(data, orderType);

  // Uncomment later when required
  // const dailyAverageTrend = getDailyAverageTrend(data, orderType);
  // const revenueLeakage = getRevenueLeakageAnalysis(data, orderType);
  // const overallAnalysis = getOverallAnalysis(data);
// console.log("SUMMARY =", summary);
// console.log("REVENUE TREND =", revenueTrend);
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">
          Revenue Dashboard
        </h1>

        <FilterBar orderType={orderType} setOrderType={setOrderType} />

        <div className="mt-6">
          <SummaryCards summary={summary} />
        </div>

        <div className="mt-8">
          <RevenueTrend data={revenueTrend} />
        </div>
        {/* Hourly Filter */}
<div className="mt-8 flex justify-end">
  <select
    value={hourlySource}
    onChange={(e) => setHourlySource(e.target.value)}
    className="border rounded-md px-4 py-2"
  >
    <option value="All">All</option>
    <option value="Offline">Offline</option>
    <option value="Online">Online</option>
  </select>
</div>

<div className="mt-4">
  <HourlyRevenueTrend data={hourlyRevenue}  />
</div>
        <div className="grid grid-cols-1 gap-6 mt-8">
          <PaymentModeAnalysis
            pieData={paymentMode.pieData}
            barData={paymentMode.barData}
            orderType={orderType}
          />
        </div>

        <div className="mt-8">
          <OrderTypeRevenueAnalysis data={orderTypeRevenue} />
        </div>

        <div className="mt-8">
          <ItemSegmentDashboard data={data} />
        </div>

        {/*
        <RevenueLeakageAnalysis
          data={revenueLeakage}
          orderType={orderType}
        />

        <DailyAverageTrend
          data={dailyAverageTrend}
          orderType={orderType}
        />

        <OverallAnalysis data={overallAnalysis} />
        */}
        <select
    value={hourlySource}
    onChange={(e) => setHourlySource(e.target.value)}
>
    <option value="All">All</option>
    <option value="Offline">Offline</option>
    <option value="Online">Online</option>
</select>
      </div>
    </main>
  );
}