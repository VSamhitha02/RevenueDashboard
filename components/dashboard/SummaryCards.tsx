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

export default function SummaryCards({
  summary,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

      {/* Total Revenue */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-blue-500
p-5
">
        <h3 className="text-gray-500">Total Revenue</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Offline Revenue */}
      {/* <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="text-gray-500">Offline Revenue</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.offlineRevenue.toLocaleString("en-IN")}
        </p>
      </div> */}

      {/* Online Revenue */}
      {/* <div className="bg-white rounded-lg shadow-md p-5">
        <h3 className="text-gray-500">Online Revenue</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.onlineRevenue.toLocaleString("en-IN")}
        </p>
      </div> */}

      {/* Orders */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-green-500
p-5
">
        <h3 className="text-gray-500">Orders</h3>
        <p className="text-3xl font-bold text-black">
          {summary.totalOrders}
        </p>
      </div>

      {/* Average Revenue */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-purple-500
p-5
">
        <h3 className="text-gray-500">Avg Revenue</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.averageRevenue.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Total Charges */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-orange-500
p-5
">
        <h3 className="text-gray-500">Total Charges</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.totalCharges.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Total Taxes */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-red-500
p-5
">
        <h3 className="text-gray-500">Total Taxes</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.totalTaxes.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Merchant Discount */}
      <div className="
bg-white
rounded-xl
shadow-md
border-l-4
border-pink-500
p-5
">
        <h3 className="text-gray-500">Merchant Discount</h3>
        <p className="text-3xl font-bold text-black">
          ₹{summary.totalMerchantDiscount.toLocaleString("en-IN")}
        </p>
      </div>

    </div>
    
  );
}