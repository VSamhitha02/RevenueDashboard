// import { TrendingUp, CreditCard } from "lucide-react";

// type SummaryCardsProps = {
//   summary: {
//     totalRevenue: number;
//     offlineRevenue: number;
//     onlineRevenue: number;

//     totalCharges: number;
//     totalTaxes: number;
//     totalMerchantDiscount: number;

//     totalOrders: number;
//     averageRevenue: number;

//     // Offline-only payment status breakdown
//     offlineNotPaid: number;
//     offlineCredit: number;
//     offlineNoCharge: number;
//   };
// };

// export default function SummaryCards({ summary }: SummaryCardsProps) {
//   // Total Received is derived purely from offline data, since online
//   // payments settle instantly and don't carry a "not paid" state.
//   const totalReceived =
//     summary.offlineRevenue - summary.offlineNotPaid - summary.offlineCredit;

//   return (
//     <div className="space-y-3">
//       {/* Top row: Revenue vs Received (offline-only) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         {/* Total Revenue */}
//         <div className="bg-[#FDE3D3] rounded-2xl shadow-sm p-5 border border-orange-200/50">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
//               <h3 className="text-gray-800 text-base font-semibold">
//                 Total Revenue
//               </h3>
//             </div>
//             <p
//               className="text-2xl xl:text-3xl font-extrabold text-orange-500 tracking-tight truncate"
//               title={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
//             >
//               ₹{summary.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
//             <div>
//               <p className="text-gray-600 text-sm">Charges</p>
//               <p className="text-emerald-600 font-bold text-base">
//                 ₹{summary.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm">Taxes</p>
//               <p className="text-sky-600 font-bold text-base">
//                 ₹{summary.totalTaxes.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm">Discounts</p>
//               <p className="text-rose-500 font-bold text-base">
//                 ₹{summary.totalMerchantDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div>
//                   <p className="text-gray-600 text-sm">Avg/day</p>
//       <p className="text-violet-600 font-bold text-base">
//         ₹{summary.averageRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
//       </p>
//       </div>
//           </div>
//         </div>

//         {/* Total Received - offline only */}
//         <div className="bg-[#CFF7E3] rounded-2xl shadow-sm p-5 border border-emerald-200/50">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <CreditCard className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
//               <h3 className="text-gray-800 text-base font-semibold">
//                 Total Received
//               </h3>
//             </div>
//             <p
//               className="text-2xl xl:text-3xl font-extrabold text-emerald-600 tracking-tight truncate"
//               title={`₹${totalReceived.toLocaleString("en-IN")}`}
//             >
//               ₹{totalReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//             </p>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             <div>
//               <p className="text-gray-600 text-sm">Not Paid</p>
//               <p className="text-orange-500 font-bold text-base">
//                 ₹{summary.offlineNotPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm">Credit</p>
//               <p className="text-amber-500 font-bold text-base">
//                 ₹{summary.offlineCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div>
//               <p className="text-gray-600 text-sm">No Charge</p>
//               <p className="text-sky-500 font-bold text-base">
//                 ₹{summary.offlineNoCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Existing small stat cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
//         {/* ...keep your existing 6 cards here unchanged... */}
//       </div>
//     </div>
//   );
// }

import { TrendingUp, CreditCard } from "lucide-react";

type SummaryCardsProps = {
  summary: {
    totalRevenue: number;
    offlineRevenue: number;
    onlineRevenue: number;

    totalCharges: number;
    totalTaxes: number;
    totalMerchantDiscount: number;

    totalOrders: number;
    averageRevenue: number;

    offlineNotPaid: number;
    offlineCredit: number;
    offlineNoCharge: number;
    offlineReceived: number; // <-- already computed correctly upstream
  };
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  // Offline "received" excludes Not Paid / Credit — online has no unpaid
  // state (it settles instantly), so the whole of onlineRevenue counts as
  // received. Total Received now reflects offline + online together.
  const offlineReceived =
    summary.offlineRevenue - summary.offlineNotPaid - summary.offlineCredit -  summary.offlineNoCharge;
  const onlineReceived = summary.onlineRevenue;
  const totalReceived = offlineReceived + onlineReceived;

  return (
    <div className="space-y-3">
      {/* Top row: Revenue vs Received (offline + online) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ===================== Total Revenue ===================== */}
        <div className="bg-[#FDE3D3] rounded-2xl shadow-sm border border-orange-200/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-5 h-5 text-orange-500"
                strokeWidth={2.5}
              />

              <h3 className="text-gray-800 text-lg font-semibold">
                Total Revenue
              </h3>
            </div>

            <p
              className="text-2xl sm:text-3xl font-extrabold text-orange-500 tracking-tight"
              title={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
            >
              ₹
              {summary.totalRevenue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Revenue Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Charges
              </p>
              <p className="text-emerald-600 text-lg md:text-base font-bold">
                ₹
                {summary.totalCharges.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Taxes
              </p>
              <p className="text-sky-600 text-lg md:text-base font-bold">
                ₹
                {summary.totalTaxes.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Discounts
              </p>
              <p className="text-rose-500 text-lg md:text-base font-bold">
                ₹
                {summary.totalMerchantDiscount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Avg/day
              </p>
              <p className="text-violet-600 text-lg md:text-base font-bold">
                ₹
                {summary.averageRevenue.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Total Received - offline + online */}
        <div className="bg-[#CFF7E3] rounded-2xl shadow-sm p-5 border border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard
                className="w-5 h-5 text-emerald-600"
                strokeWidth={2.5}
              />

              <h3 className="text-gray-800 text-lg font-semibold">
                Total Received
              </h3>
            </div>

            <p
              className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight"
              title={`₹${totalReceived.toLocaleString("en-IN")}`}
            >
              ₹
              {totalReceived.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <p className="text-gray-600 text-sm">Offline</p>
              <p className="text-emerald-700 font-bold text-base">
                ₹{offlineReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Online</p>
              <p className="text-emerald-700 font-bold text-base">
                ₹{onlineReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Not Paid
              </p>
              <p className="text-orange-500 text-lg md:text-base font-bold">
                ₹
                {summary.offlineNotPaid.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                Credit
              </p>
              <p className="text-amber-500 text-lg md:text-base font-bold">
                ₹
                {summary.offlineCredit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-base md:text-sm font-medium">
                No Charge
              </p>
              <p className="text-sky-500 text-lg md:text-base font-bold">
                ₹
                {summary.offlineNoCharge.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Existing small stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
        {/* Keep your existing six small cards unchanged */}
      </div>
    </div>
  );
}