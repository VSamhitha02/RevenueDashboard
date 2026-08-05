"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

import {
  getSummaryData,
  getRevenueTrend,
  getOrderTypeRevenueAnalysis,
  getPaymentModeAnalysis,
  getHourlyRevenueTrend,
  getHourlySegmentRevenue,
} from "@/utils/chartData";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ItemSegmentDashboard from "@/components/dashboard/ItemSegmentDashboard";
import DateFilter from "@/components/dashboard/DateFilter";

interface DashboardProps {
  fseId: string;
  selectedSegment: string;
  cutoffHour: number;
  dateFilter: string;
}

export default function Segment({ fseId, selectedSegment, cutoffHour, dateFilter }: DashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dateFilterParam =
    (searchParams.get("dateFilter") as DateFilterOption) ?? "Today";
  const customDateParam = searchParams.get("customDate") ?? undefined;
  const customStartParam = searchParams.get("customStart") ?? undefined;
  const customEndParam = searchParams.get("customEnd") ?? undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hourlySource, setHourlySource] = useState("All");
  const [dateOption, setDateOption] =
    useState<DateFilterOption>(dateFilterParam);
  const [selectedRange, setSelectedRange] = useState("1D");

  async function fetchData(range: { startDate: string; endDate: string }) {
    
    try {
      setLoading(true);
      const response = await getRevenueDashboard({
        fseIds: [fseId],
        startDate: range.startDate,
        endDate: range.endDate,
        orderTypes: [],
        cutoffHour
      });
      console.log("API Response:", response);

      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Don't fetch yet if the URL says "Custom Date"/"Custom Date Range"
    // but doesn't (yet) have the dates needed to build a range.
    if (dateFilterParam === "Custom Date" && !customDateParam) return;
    if (
      dateFilterParam === "Custom Date Range" &&
      (!customStartParam || !customEndParam)
    )
      return;

    const range = getDateRange(
      dateFilterParam,
      customDateParam,
      customStartParam,
      customEndParam,
      cutoffHour,
    );
    fetchData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cutoffHour,
    dateFilterParam,
    customDateParam,
    customStartParam,
    customEndParam,
  ]);

  function handleDateSelect(
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string,
  ) {
    setDateOption(option);

    if (option === "Custom Date" && !customDate) return;
    if (option === "Custom Date Range" && (!customStart || !customEnd)) return;

    const range = getDateRange(
      option,
      customDate,
      customStart,
      customEnd,
      cutoffHour,
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

  // if (!data) {
  //   return <div className="p-10">No data found</div>;
  // }

 
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
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
        {/* <FilterBar orderType={orderType} setOrderType={setOrderType} /> */}
        <DateFilter
          selected={dateOption}
          onSelect={handleDateSelect}
          cutoffHour={searchParams.get("cutoffHour") ?? String(cutoffHour).padStart(2, "0")}
          onCutoffChange={handleCutoffChange}
        />

        <div className="mt-8">
          <ItemSegmentDashboard data={data} selectedSegment={selectedSegment} cutoffHour={cutoffHour} fseId={fseId} />
        </div>
      </div>
    </main>
  );
}