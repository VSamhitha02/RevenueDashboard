"use client";

import { useEffect, useState } from "react";
import ItemSegmentDashboard from "@/components/dashboard/ItemSegmentDashboard";
import { getRevenueDashboard } from "@/lib/axios";

type Props = {
  fseId: string;
  segment: string;
};

export default function Segment({ fseId, segment }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fseId) return;

    async function loadData() {
      setLoading(true);
      try {
        const response = await getRevenueDashboard({
          fseIds: [fseId],
          // Tip: Widen the date range or pass props/state if you want historical data
         
          cutoffHour: 4,
        });

        setData(response);
      } catch (err) {
        console.error("Error loading segment data:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fseId, segment]);

  if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;

  // Handle empty or null response cleanly
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return (
      <div className="p-8 text-center border rounded-lg bg-gray-50 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          No Revenue Data Found
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          No records matching FSE ID <code className="font-mono">{fseId}</code> were found for the selected segment.
        </p>
      </div>
    );
  }

  return (
    <ItemSegmentDashboard
      data={data}
      selectedSegment={segment}
    />
  );
}