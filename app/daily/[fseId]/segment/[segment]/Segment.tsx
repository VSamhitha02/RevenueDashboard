"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ItemSegmentDashboard from "@/components/dashboard/ItemSegmentDashboard";
import DateFilter from "@/components/dashboard/DateFilter";

interface DashboardProps {
  fseId: string;
  selectedSegment: string;
  cutoffHour: number;
  dateFilter: string;
}

export default function Segment({
  fseId,
  selectedSegment,
  cutoffHour,
}: DashboardProps) {
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
    // Don't fetch yet if the URL says "Custom" but doesn't (yet) have start and end dates
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

        <DateFilter
          selected={dateOption}
          onSelect={handleDateSelect}
          cutoffHour={
            searchParams.get("cutoffHour") ??
            String(cutoffHour).padStart(2, "0")
          }
          onCutoffChange={handleCutoffChange}
        />

        <div className="mt-8">
          <ItemSegmentDashboard
            data={data}
            selectedSegment={selectedSegment}
            cutoffHour={cutoffHour}
            fseId={fseId}
          />
        </div>
      </div>
    </main>
  );
}