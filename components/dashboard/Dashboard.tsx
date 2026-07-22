"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

import FilterBar from "./FilterBar";
import DateFilter from "./DateFilter";
import SummaryCards from "./SummaryCards";
import RevenueTrend from "./RevenueTrend";
import OrderTypeRevenueAnalysis from "./OrderTypeRevenueAnalysis";
import PaymentModeAnalysis from "./PaymentModeAnalysis";
import ItemSegmentDashboard from "./ItemSegmentDashboard";
import HourlyRevenueTrend from "./HourlyRevenueTrend";

import {
  getSummaryData,
  getRevenueTrend,
  getOrderTypeRevenueAnalysis,
  getPaymentModeAnalysis,
  getHourlyRevenueTrend,
} from "@/utils/chartData";
interface DashboardProps {
  fseId: string;
}
export default function Dashboard({ fseId }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hourlySource, setHourlySource] = useState("All");
  const [orderType, setOrderType] = useState("All");
  const [dateOption, setDateOption] = useState<DateFilterOption>("Today");
  const [selectedRange, setSelectedRange] = useState("1D");
  async function fetchData(range: { startDate: string; endDate: string }) {
    try {
      setLoading(true);
      const response = await getRevenueDashboard({
        fseIds: [fseId],
        startDate: range.startDate,
        endDate: range.endDate,
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

  useEffect(() => {
    const range = getDateRange(dateOption);
    fetchData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDateSelect(
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string
  ) {
    setDateOption(option);

    // only re-fetch immediately for non-custom options,
    // or once both custom dates are filled in
    if (option === "Custom Date" && !customDate) return;
    if (option === "Custom Date Range" && (!customStart || !customEnd))
      return;

    const range = getDateRange(option, customDate, customStart, customEnd);
    fetchData(range);
  }

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!data) {
    return <div className="p-10">No data found</div>;
  }

  const hourlyRevenue = getHourlyRevenueTrend(data);

  // in Dashboard.tsx, after data is fetched
  console.log("Offline Hour Wise:", data.offline_revenue_hour_wise);
  console.log("Online Hour Wise:", data.online_revenue_hour_wise);

  // Generate all chart data AFTER data is available
  const summary = getSummaryData(data, orderType);
  const revenueTrend = getRevenueTrend(data, orderType);
  const paymentMode = getPaymentModeAnalysis(data, orderType);
  const orderTypeRevenue = getOrderTypeRevenueAnalysis(data, orderType);

  // Uncomment later when required
  // const dailyAverageTrend = getDailyAverageTrend(data, orderType);
  // const revenueLeakage = getRevenueLeakageAnalysis(data, orderType);
  // const overallAnalysis = getOverallAnalysis(data);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">
            Revenue Dashboard
          </h1>
          <DateFilter selected={dateOption} onSelect={handleDateSelect} />
        </div>

        <FilterBar orderType={orderType} setOrderType={setOrderType} />

        <div className="mt-6">
          <SummaryCards summary={summary} />
        </div>

        <div className="mt-8">
          <RevenueTrend
  data={revenueTrend}
  dateOption={dateOption}
/>
        </div>

        <div className="mt-4">
          <HourlyRevenueTrend data={hourlyRevenue} />
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

        {/* <select
          value={hourlySource}
          onChange={(e) => setHourlySource(e.target.value)}
          className="mt-4 border rounded-md px-3 py-2 text-black bg-white"
        >
          <option value="All">All</option>
          <option value="Offline">Offline</option>
          <option value="Online">Online</option>
        </select> */}
      </div>
    </main>
  );
}