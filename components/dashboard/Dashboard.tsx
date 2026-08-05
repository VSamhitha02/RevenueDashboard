"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

import DateFilter from "./DateFilter";
import SummaryCards from "./SummaryCards";
import RevenueTrend from "./RevenueTrend";
import OrderTypeRevenueAnalysis from "./OrderTypeRevenueAnalysis";
import PaymentModeAnalysis from "./PaymentModeAnalysis";
import HourlyRevenueTrend from "./HourlyRevenueTrend";
import SegmentwiseRevenue from "./SegmentwiseRevenue";

import {
  getSummaryData,
  getRevenueTrend,
  getOrderTypeRevenueAnalysis,
  getPaymentModeAnalysis,
  getHourlyRevenueTrend,
  getHourlySegmentRevenue,
} from "@/utils/chartData";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ItemSegment from "./ItemSegment";

interface DashboardProps {
  fseId: string;
  cutoffHour: number;
}

export default function Dashboard({ fseId, cutoffHour }: DashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dateFilterParam =
    (searchParams.get("dateFilter") as DateFilterOption) ?? "Today";
  const customStartParam = searchParams.get("customStart") ?? undefined;
  const customEndParam = searchParams.get("customEnd") ?? undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateOption, setDateOption] =
    useState<DateFilterOption>(dateFilterParam);

  async function fetchData(range: { startDate: string; endDate: string }) {
    try {
      setLoading(true);
      const response = await getRevenueDashboard({
        fseIds: [fseId],
        startDate: range.startDate,
        endDate: range.endDate,
        orderTypes: [],
        cutoffHour,
      });

      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Don't fetch yet if the URL says "Custom" but doesn't have customStart/customEnd set
    if (
      dateFilterParam === "Custom" &&
      (!customStartParam || !customEndParam)
    ) {
      return;
    }

    const range = getDateRange(
      dateFilterParam,
      customStartParam,
      customEndParam,
      cutoffHour
    );
    fetchData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cutoffHour,
    dateFilterParam,
    customStartParam,
    customEndParam,
  ]);

  function handleDateSelect(
    option: DateFilterOption,
    _customDate?: string,
    customStart?: string,
    customEnd?: string
  ) {
    setDateOption(option);

    if (option === "Custom" && (!customStart || !customEnd)) {
      return;
    }

    const range = getDateRange(
      option,
      customStart,
      customEnd,
      cutoffHour
    );
    fetchData(range);
  }

  function handleCutoffChange(hour: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cutoffHour", hour);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  const hourlyRevenue = getHourlyRevenueTrend(data, cutoffHour);

  // Generate all chart data AFTER data is available
  const summary = getSummaryData(data);
  const revenueTrend = getRevenueTrend(data);
  const paymentMode = getPaymentModeAnalysis(data);
  const orderTypeRevenue = getOrderTypeRevenueAnalysis(data);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">
            Revenue Dashboard
          </h1>
        </div>

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-semibold text-gray-800">
                Loading...
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Fetching dashboard data
              </p>
            </div>
          </div>
        )}

        <DateFilter
          selected={dateOption}
          cutoffHour={searchParams.get("cutoffHour") ?? String(cutoffHour).padStart(2, "0")}
          onCutoffChange={handleCutoffChange}
          onSelect={handleDateSelect}
        />

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
            othersBreakdown={paymentMode.othersBreakdown}
          />
        </div>

        <div className="mt-8">
          <OrderTypeRevenueAnalysis
            data={orderTypeRevenue.rows}
            orderTypes={orderTypeRevenue.orderTypes}
            orderTypeLabels={orderTypeRevenue.orderTypeLabels}
          />
        </div>

        <div className="mt-8">
          <SegmentwiseRevenue
            data={data}
            fseId={fseId}
            cutoffHour={cutoffHour}
            dateFilter={dateOption}
          />
        </div>

        <div className="mt-8">
          <ItemSegment data={data} cutoffHour={cutoffHour} />
        </div>
      </div>
    </main>
  );
}