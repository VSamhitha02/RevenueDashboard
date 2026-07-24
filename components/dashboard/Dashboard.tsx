// "use client";

// import { useEffect, useState } from "react";
// import { getRevenueDashboard } from "@/lib/axios";
// import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

// import DateFilter from "./DateFilter";
// import SummaryCards from "./SummaryCards";
// import RevenueTrend from "./RevenueTrend";
// import OrderTypeRevenueAnalysis from "./OrderTypeRevenueAnalysis";
// import PaymentModeAnalysis from "./PaymentModeAnalysis";
// import ItemSegmentDashboard from "./ItemSegmentDashboard";
// import HourlyRevenueTrend from "./HourlyRevenueTrend";

// import {
//   getSummaryData,
//   getRevenueTrend,
//   getOrderTypeRevenueAnalysis,
//   getPaymentModeAnalysis,
//   getHourlyRevenueTrend,
// } from "@/utils/chartData";
// import { useSearchParams } from "next/navigation";

// interface DashboardProps {
//   fseId: string;
// }

// export default function Dashboard({ fseId }: DashboardProps) {
//   const searchParams = useSearchParams();

// const dateFilter =
//   (searchParams.get("dateFilter") as DateFilterOption) ?? "Today";
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [hourlySource, setHourlySource] = useState("All");
//   const [dateOption, setDateOption] = useState<DateFilterOption>("Today");
//   const [selectedRange, setSelectedRange] = useState("1D");

//   async function fetchData(range: { startDate: string; endDate: string }) {
//     try {
//       setLoading(true);
//       const response = await getRevenueDashboard({
//         fseIds: [fseId],
//         startDate: range.startDate,
//         endDate: range.endDate,
//         orderTypes: [],
//         cutoffHour: 4,
//       });

//       setData(response);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // useEffect(() => {
//   //   const range = getDateRange(dateOption);
//   //   fetchData(range);
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);
  

//   function handleDateSelect(
//     option: DateFilterOption,
//     customDate?: string,
//     customStart?: string,
//     customEnd?: string
//   ) {
//     setDateOption(option);

//     if (option === "Custom Date" && !customDate) return;
//     if (option === "Custom Date Range" && (!customStart || !customEnd))
//       return;

//     const range = getDateRange(option, customDate, customStart, customEnd);
//     fetchData(range);
//   }

  

//   // if (!data) {
//   //   return <div className="p-10">No data found</div>;
//   // }

//   const hourlyRevenue = getHourlyRevenueTrend(data);

//   // Generate all chart data AFTER data is available
//   const summary = getSummaryData(data);
//   const revenueTrend = getRevenueTrend(data);
//   const paymentMode = getPaymentModeAnalysis(data);
//   const orderTypeRevenue = getOrderTypeRevenueAnalysis(data);

//   return (
//     <main className="min-h-screen bg-slate-100">
//       <div className="max-w-7xl mx-auto px-8 py-8">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-4xl font-bold text-black">
//             Revenue Dashboard
//           </h1>
         
//         </div>
// {loading && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//     <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center">
//       <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>

//       <p className="mt-4 text-lg font-semibold text-gray-800">
//         Loading...
//       </p>

//       <p className="mt-1 text-sm text-gray-500">
//         Fetching dashboard data
//       </p>
//     </div>
//   </div>
// )}
//         {/* <FilterBar orderType={orderType} setOrderType={setOrderType} /> */}
//        <DateFilter selected={dateOption} onSelect={handleDateSelect} />
//         <div className="mt-6">
//           <SummaryCards summary={summary} />
//         </div>

//         <div className="mt-8">
//           <RevenueTrend
//             data={revenueTrend}
//             dateOption={dateOption}
//           />
//         </div>

//         <div className="mt-4">
//           <HourlyRevenueTrend data={hourlyRevenue} />
//         </div>

//         <div className="grid grid-cols-1 gap-6 mt-8">
//           <PaymentModeAnalysis
//             pieData={paymentMode.pieData}
//             barData={paymentMode.barData}
//           />
//         </div>

//         <div className="mt-8">
//           <OrderTypeRevenueAnalysis
//             data={orderTypeRevenue.rows}
//             orderTypes={orderTypeRevenue.orderTypes}
//             orderTypeLabels={orderTypeRevenue.orderTypeLabels}
//           />
//         </div>

//         <div className="mt-8">
//           <ItemSegmentDashboard data={data} />
//         </div>
//       </div>
//     </main>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { getRevenueDashboard } from "@/lib/axios";
import { getDateRange, DateFilterOption } from "@/utils/dateRanges";

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
import { useSearchParams } from "next/navigation";

interface DashboardProps {
  fseId: string;
}

export default function Dashboard({ fseId }: DashboardProps) {
  const searchParams = useSearchParams();

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
        cutoffHour: 4,
      });

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
      customEndParam
    );
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

    if (option === "Custom Date" && !customDate) return;
    if (option === "Custom Date Range" && (!customStart || !customEnd))
      return;

    const range = getDateRange(option, customDate, customStart, customEnd);
    fetchData(range);
  }

  

  // if (!data) {
  //   return <div className="p-10">No data found</div>;
  // }

  const hourlyRevenue = getHourlyRevenueTrend(data);

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
        {/* <FilterBar orderType={orderType} setOrderType={setOrderType} /> */}
       <DateFilter selected={dateOption} onSelect={handleDateSelect} />
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
          <ItemSegmentDashboard data={data} />
        </div>
      </div>
    </main>
  );
}