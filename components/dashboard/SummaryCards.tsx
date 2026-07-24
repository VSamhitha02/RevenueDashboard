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
  };
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
      {/* Total Revenue - Soft Lavender */}
      <div className="bg-[#E9D5FF] rounded-2xl shadow-sm p-3.5 border border-purple-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
          Total Revenue
        </h3>
        <p
          className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter"
          title={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
        >
          ₹{summary.totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Orders - Soft Peach */}
      <div className="bg-[#FED7AA] rounded-2xl shadow-sm p-3.5 border border-orange-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
          No. of Orders
        </h3>
        <p className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter">
          {summary.totalOrders.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Average Revenue - Soft Pink */}
      <div className="bg-[#FECDD3] rounded-2xl shadow-sm p-3.5 border border-rose-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
         Avg Revenue Per Day
        </h3>
        <p
          className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter"
          title={`₹${summary.averageRevenue.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}`}
        >
          ₹
          {summary.averageRevenue.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Total Charges - Soft Purple */}
      <div className="bg-[#DDD6FE] rounded-2xl shadow-sm p-3.5 border border-violet-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
          Total Charges
        </h3>
        <p className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter">
          ₹{summary.totalCharges.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Total Taxes - Soft Sage Green */}
      <div className="bg-[#D1FAE5] rounded-2xl shadow-sm p-3.5 border border-emerald-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
          Total Taxes
        </h3>
        <p className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter">
          ₹{summary.totalTaxes.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Merchant Discount - Soft Sky Blue */}
      <div className="bg-[#E0F2FE] rounded-2xl shadow-sm p-3.5 border border-sky-200/50 min-w-0 text-left pl-3">
        <h3 className="text-gray-700 text-xs sm:text-sm font-semibold tracking-wide truncate">
          Merchant Discount
        </h3>
        <p className="text-lg xl:text-xl 2xl:text-2xl font-extrabold text-black mt-1.5 truncate tracking-tighter">
          ₹{summary.totalMerchantDiscount.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}