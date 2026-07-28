"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

import DateFilter from "./DateFilter";
import ItemSegmentDashboard from "./ItemSegmentDashboard";

interface ItemSegmentPageProps {
  fseId: string;
}

export default function ItemSegmentPage({ fseId }: ItemSegmentPageProps) {
  const searchParams = useSearchParams();

  const dateFilterParam =
    (searchParams.get("dateFilter") as DateFilterOption) ?? "Today";
  const customDateParam = searchParams.get("customDate") ?? undefined;
  const customStartParam = searchParams.get("customStart") ?? undefined;
  const customEndParam = searchParams.get("customEnd") ?? undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateOption, setDateOption] = useState<DateFilterOption>(dateFilterParam);

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

      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resolveAndFetch(
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string
  ) {
    if (option === "Custom Date" && !customDate) return;
    if (option === "Custom Date Range" && (!customStart || !customEnd)) return;

    const range = getDateRange(option, customDate, customStart, customEnd);
    fetchData(range);
  }

  useEffect(() => {
    resolveAndFetch(
      dateFilterParam,
      customDateParam,
      customStartParam,
      customEndParam
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilterParam, customDateParam, customStartParam, customEndParam, fseId]);

  function handleDateSelect(
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string
  ) {
    setDateOption(option);
    resolveAndFetch(option, customDate, customStart, customEnd);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">Item Segment Report</h1>
        </div>

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-semibold text-gray-800">Loading...</p>
              <p className="mt-1 text-sm text-gray-500">Fetching dashboard data</p>
            </div>
          </div>
        )}

        <DateFilter selected={dateOption} onSelect={handleDateSelect} />

        <div className="mt-8">
          <ItemSegmentDashboard data={data} />
        </div>
      </div>
    </main>
  );
}