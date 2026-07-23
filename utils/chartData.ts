

 
// ---------------------------------------------------------------------------
// Normalizes the raw revenue JSON.
//
// revenue.json can either be:
//   - a single object: { offline_revenue_day_wise: [...], ... }
//   - an array of partial objects: [ { offline_revenue_day_wise: [...] },
//                                     { payment_mode_wise: [...], ... } ]
//
// This merges an array into one flat object so every function below can
// keep using `data.offline_revenue_day_wise`, `data.payment_mode_wise`, etc.
// without needing to know which shape it originally came in.
// ---------------------------------------------------------------------------
function normalizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }
  return data ?? {};
}
 
function filterOfflineData(data: any[], orderType: string) {
  if (
    orderType === "All" ||
    orderType === "swiggy" ||
    orderType === "zomato"
  ) {
    return data.filter((item) => item.orderType === "");
  }
 
  return data.filter((item) => item.orderType === orderType);
}
 
function filterOnlineData(data: any[], orderType: string) {
  if (
    orderType === "All" ||
    orderType === "dineIn" ||
    orderType === "takeAway"
  ) {
    return data.filter((item) => item.orderType === "");
  }
 
  return data.filter((item) => item.orderType === orderType);
}
 
export function getSummaryData(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  let offline = data.offline_revenue_day_wise ?? [];
  let online = data.online_revenue_day_wise ?? [];
 
  // Offline filtering
  if (orderType === "dineIn" || orderType === "takeAway") {
    offline = offline.filter(
      (item: any) => item.orderType === orderType
    );
  }
 
  // Online filtering
  else if (orderType === "swiggy" || orderType === "zomato") {
    online = online.filter(
      (item: any) =>
        item.orderType === orderType ||
        item.orderType === orderType
    );
    offline = [];
  }
 
  // All = don't filter anything
 
  const offlineRevenue = offline.reduce(
    (sum: number, item: any) => sum + (item.totalRevenue ?? 0),
    0
  );
 
  const onlineRevenue = online.reduce(
    (sum: number, item: any) => sum + (item.totalRevenue ?? 0),
    0
  );
 
  const offlineOrders = offline.reduce(
    (sum: number, item: any) => sum + (item.orders ?? 0),
    0
  );
 
  const onlineOrders = online.reduce(
    (sum: number, item: any) => sum + (item.orders ?? 0),
    0
  );
 
  const offlineTaxes = offline.reduce(
    (sum: number, item: any) =>
      sum +
      (item.taxes ||
        item.totalTax ||
        item.cgst +
          item.sgst ||
        0),
    0
  );
 
  const onlineTaxes = online.reduce(
    (sum: number, item: any) =>
      sum +
      (item.taxes ||
        item.totalTax ||
        item.cgst +
          item.sgst ||
        0),
    0
  );
 
  const offlineCharges = offline.reduce(
    (sum: number, item: any) =>
      sum +
      (item.charges ??
        item.deliveryCharge ??
        item.totalCharges ??
        0),
    0
  );
 
  const onlineCharges = online.reduce(
    (sum: number, item: any) =>
      sum +
      (item.charges ??
        item.deliveryCharge ??
        item.totalCharges ??
        0),
    0
  );
 
  const offlineMerchantDiscount = offline.reduce(
    (sum: number, item: any) =>
      sum + (item.merchantDiscount ?? 0),
    0
  );
 
  const onlineMerchantDiscount = online.reduce(
    (sum: number, item: any) =>
      sum + (item.merchantDiscount ?? 0),
    0
  );
 
  const totalRevenue = offlineRevenue + onlineRevenue;
 
  const totalOrders = offlineOrders + onlineOrders;
 
  const daySet = new Set<string>();
 
  offline.forEach((item: any) => {
    if (item.invoiceDate) daySet.add(item.invoiceDate);
  });
 
  online.forEach((item: any) => {
    if (item.orderDate) daySet.add(item.orderDate);
  });
 
  const totalDays = daySet.size;
 
  return {
    totalRevenue,
    offlineRevenue,
    onlineRevenue,
    totalCharges: offlineCharges + onlineCharges,
    totalTaxes: offlineTaxes + onlineTaxes,
    totalMerchantDiscount:
      offlineMerchantDiscount + onlineMerchantDiscount,
    totalOrders,
    averageRevenue:
      totalDays === 0 ? 0 : totalRevenue / totalDays,
  };
}
 
export function getRevenueTrend(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  let offline = data.offline_revenue_day_wise ?? [];
  let online = data.online_revenue_day_wise ?? [];
 
  if (orderType === "dineIn" || orderType === "takeAway") {
    offline = offline.filter(
      (item: any) => item.orderType === orderType
    );
    online = [];
  } else if (
    orderType === "swiggy" ||
    orderType === "zomato"
  ) {
    online = online.filter(
      (item: any) =>
        item.orderType === orderType ||
        item.orderType === orderType
    );
    offline = [];
  }
 
  const grouped: Record<string, number> = {};
 
  offline.forEach((item: any) => {
    const date = item.invoiceDate;
 
    grouped[date] =
      (grouped[date] ?? 0) +
      (item.totalRevenue ?? 0);
  });
 
  online.forEach((item: any) => {
    const date = item.orderDate;
 
    grouped[date] =
      (grouped[date] ?? 0) +
      (item.totalRevenue ?? 0);
  });
 
  const result = Object.entries(grouped)
    .sort(
      ([a], [b]) =>
        new Date(a).getTime() -
        new Date(b).getTime()
    )
    .map(([date, revenue]) => ({
      date,
      revenue,
    }));
 
  const totalRevenue = result.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
 
  const average =
    result.length === 0
      ? 0
      : totalRevenue / result.length;
 
  return result.map((item) => ({
    ...item,
    average,
  }));
}
 
export function getCashFlowAnalysis(rawData: any) {
  const data = normalizeData(rawData);
  const online = data.online_revenue_day_wise ?? [];
 
  const revenue = online.reduce(
    (sum: number, item: any) => sum + item.totalRevenue,
    0
  );
 
  const taxes = online.reduce(
    (sum: number, item: any) => sum + item.taxes,
    0
  );
 
  const charges = online.reduce(
    (sum: number, item: any) => sum + item.charges,
    0
  );
 
  const discounts = online.reduce(
    (sum: number, item: any) => sum + item.merchantDiscount,
    0
  );
 
  const payable = online.reduce(
    (sum: number, item: any) => sum + item.payableAmount,
    0
  );
 
  return [
    { metric: "Revenue", amount: revenue },
    { metric: "Taxes", amount: taxes },
    { metric: "Charges", amount: charges },
    { metric: "Discounts", amount: discounts },
    { metric: "Payable", amount: payable },
  ];
}
 
export function getOverallAnalysis(rawData: any) {
  const data = normalizeData(rawData);
 
  const offlineRevenue = (data.offline_revenue_day_wise ?? []).reduce(
    (sum: number, item: any) => sum + item.totalRevenue,
    0
  );
 
  const onlineRevenue = (data.online_revenue_day_wise ?? []).reduce(
    (sum: number, item: any) => sum + item.totalRevenue,
    0
  );
 
  return [
    {
      name: "Offline",
      value: offlineRevenue,
    },
    {
      name: "Online",
      value: onlineRevenue,
    },
  ];
}
 
export function getOfflineTrend(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  const filtered = (data.offline_revenue_day_wise ?? []).filter((item: any) => {
    if (
      orderType === "All" ||
      orderType === "swiggy" ||
      orderType === "zomato"
    ) {
      return item.orderType === "" || item.orderType == null;
    }
 
    return item.orderType === orderType;
  });
 
  return filtered.map((item: any) => ({
    date: new Date(item.invoiceDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    revenue: item.totalRevenue,
    orders: item.orders,
  }));
}
 
export function getOnlineTrend(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  const filtered = (data.online_revenue_day_wise ?? []).filter((item: any) => {
    if (
      orderType === "All" ||
      orderType === "dineIn" ||
      orderType === "takeAway"
    ) {
      return item.orderType === "" || item.orderType == null;
    }
 
    return item.orderType === orderType;
  });
 
  return filtered.map((item: any) => ({
    date: new Date(item.orderDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    revenue: item.totalRevenue,
    orders: item.orders,
  }));
}
 
export function getOfflineSessionChartData(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
  let sessions = data.offline_revenue_session ?? [];
 
  if (orderType === "dineIn" || orderType === "takeAway") {
    sessions = sessions.filter(
      (item: any) => item.orderType === orderType
    );
  } else {
    sessions = sessions.filter(
      (item: any) => item.orderType === "" || item.orderType == null
    );
  }
 
  const map = new Map();
 
  sessions.forEach((item: any) => {
    const key = item.session;
 
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        value: 0,
      });
    }
 
    map.get(key).value += item.totalRevenue;
  });
 
  return Array.from(map.values());
}
 
export function getOnlineSessionChartData(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
  let sessions = data.online_revenue_session ?? [];
 
  if (orderType === "swiggy" || orderType === "zomato") {
    sessions = sessions.filter(
      (item: any) => item.orderType === orderType
    );
  } else {
    sessions = sessions.filter(
      (item: any) => item.orderType === "" || item.orderType == null
    );
  }
 
  const map = new Map();
 
  sessions.forEach((item: any) => {
    const key = item.session;
 
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        value: 0,
      });
    }
 
    map.get(key).value += item.totalRevenue;
  });
 
  return Array.from(map.values());
}
 
export function getOrderTypeRevenueAnalysis(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
  const result: Record<string, any> = {};
 
  // ---------------- OFFLINE ----------------
 
  (data.offline_revenue_day_wise ?? []).forEach((item: any) => {
    const date = item.invoiceDate;
 
    if (!result[date]) {
      result[date] = {
        date,
        offline: 0,
        dineIn: 0,
        takeAway: 0,
        online: 0,
        swiggy: 0,
        zomato: 0,
      };
    }
 
    if (item.orderType === "" || item.orderType == null) {
      result[date].offline = item.totalRevenue;
    }
 
    if (item.orderType === "dineIn") {
      result[date].dineIn = item.totalRevenue;
    }
 
    if (item.orderType === "takeAway") {
      result[date].takeAway = item.totalRevenue;
    }
  });
 
  // ---------------- ONLINE ----------------
 
  (data.online_revenue_day_wise ?? []).forEach((item: any) => {
    const date = item.orderDate;
 
    if (!result[date]) {
      result[date] = {
        date,
        offline: 0,
        dineIn: 0,
        takeAway: 0,
        online: 0,
        swiggy: 0,
        zomato: 0,
      };
    }
 
    if (item.orderType === "" || item.orderType == null) {
      result[date].online = item.totalRevenue;
    }
 
    if (item.orderType === "swiggy") {
      result[date].swiggy = item.totalRevenue;
    }
 
    if (item.orderType === "zomato") {
      result[date].zomato = item.totalRevenue;
    }
  });
 
  let rows = Object.values(result);
 
  if (orderType !== "All") {
    rows = rows.map((row: any) => ({
      date: row.date,
      offline: orderType === "offline" ? row.offline : 0,
      dineIn: orderType === "dineIn" ? row.dineIn : 0,
      takeAway: orderType === "takeAway" ? row.takeAway : 0,
      online: orderType === "online" ? row.online : 0,
      swiggy: orderType === "swiggy" ? row.swiggy : 0,
      zomato: orderType === "zomato" ? row.zomato : 0,
    }));
  }
 
  return rows;
}
 
export function getDailyAverageTrend(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  const dateMap = new Map();
 
  // ---------------- OFFLINE ----------------
 
  let offline = data.offline_revenue_day_wise ?? [];
 
  if (orderType === "dineIn") {
    offline = offline.filter((x: any) => x.orderType === "dineIn");
  } else if (orderType === "takeAway") {
    offline = offline.filter((x: any) => x.orderType === "takeAway");
  } else {
    offline = offline.filter(
      (x: any) => x.orderType === "" || x.orderType == null
    );
  }
 
  offline.forEach((item: any) => {
    const date = item.invoiceDate;
 
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        revenue: 0,
      });
    }
 
    dateMap.get(date).revenue += item.totalRevenue;
  });
 
  // ---------------- ONLINE ----------------
 
  let online = data.online_revenue_day_wise ?? [];
 
  if (orderType === "swiggy") {
    online = online.filter((x: any) => x.orderType === "swiggy");
  } else if (orderType === "zomato") {
    online = online.filter((x: any) => x.orderType === "zomato");
  } else {
    online = online.filter(
      (x: any) => x.orderType === "" || x.orderType == null
    );
  }
 
  online.forEach((item: any) => {
    const date = item.orderDate;
 
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        revenue: 0,
      });
    }
 
    dateMap.get(date).revenue += item.totalRevenue;
  });
 
  const rows = Array.from(dateMap.values());
 
  const avgRevenue =
    rows.reduce((sum, item) => sum + item.revenue, 0) /
    (rows.length || 1);
 
  return rows.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    revenue: item.revenue,
    average: avgRevenue,
  }));
}
 
export function getPaymentModeAnalysis(rawData: any, orderType: string = "All") {
  try {
    console.log("--- DEBUG START: getPaymentModeAnalysis ---");
    // console.log("Raw Data Received Type:", orderTypeof rawData);
   
    const data = normalizeData(rawData);
    console.log("Normalized Data Keys:", Object.keys(data));
 
    let payment = data.payment_mode_wise;
   
    // Fallback if the array doesn't exist at all
    if (!payment) {
      console.warn("⚠️ Warning: data.payment_mode_wise is undefined or null!");
      payment = [];
    }
   
    if (!Array.isArray(payment)) {
      console.error("❌ Error: data.payment_mode_wise is not an array!", payment);
      payment = [];
    }
 
    // Filter array securely
    if (orderType === "dineIn") {
      payment = payment.filter((item: any) => item?.orderType === "dineIn");
    } else if (orderType === "takeAway") {
      payment = payment.filter((item: any) => item?.orderType === "takeAway");
    } else {
      payment = payment.filter((item: any) => item?.orderType === "" || item?.orderType == null);
    }
 
    console.log(`Filtered payment array count for [${orderType}]:`, payment.length);
 
    const map = new Map();
 
    payment.forEach((item: any) => {
      if (!item) return;
     
      const rawMode = item.mode || item.paymentMode || item.payment_mode || item.paymentMethod || "";
      if (!item.invoiceDate) return;
 
      const date = new Date(item.invoiceDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
 
      if (!map.has(date)) {
        map.set(date, { date, cash: 0, gateway: 0, noCharge: 0, notPaid: 0 });
      }
 
const row = map.get(date);
      const mode = String(rawMode).trim().toLowerCase().replace(/\s+/g, "");
      const rev = Number(item.totalRevenue || item.revenue || 0);

      switch (mode) {
        case "cash":
          row.cash += rev;
          break;
        case "gateway":
        case "online":
        case "upi":
        case "card":
        case "cards":
          row.gateway += rev;
          break;
        case "notpaid":
        case "due":
          row.notPaid += rev;
          break;
        default:
          // anything else (dineout, nocharge, complimentary, unknown modes) → Others
          row.noCharge += rev;
          break;
      }
    });
 
    const barData = Array.from(map.values());
    const totals = { gateway: 0, cash: 0, noCharge: 0, notPaid: 0 };
 
    barData.forEach((item: any) => {
      totals.gateway += item.gateway;
      totals.cash += item.cash;
      totals.noCharge += item.noCharge;
      totals.notPaid += item.notPaid;
    });
 
    const pieData = [
      { name: "Gateway", value: totals.gateway },
      { name: "Cash", value: totals.cash },
      { name: "Others", value: totals.noCharge + totals.notPaid },
    ];
 
    console.log("Output barData generated successfully:", barData.length, "rows");
    console.log("--- DEBUG END ---");
 
    return { pieData, barData };
 
  } catch (error) {
    // This stops a full page crash if something deeper goes wrong
    console.error("💥 CRASH inside getPaymentModeAnalysis:", error);
    return { pieData: [], barData: [] };
  }
}
 
export function getRevenueLeakageAnalysis(
  rawData: any,
  orderType: string = "All"
) {
  const data = normalizeData(rawData);
 
  let leakage = data.revenue_leakage_wise ?? [];
 
  // Apply filter
  if (
    orderType === "dineIn" ||
    orderType === "takeAway" ||
    orderType === "swiggy" ||
    orderType === "zomato"
  ) {
    leakage = leakage.filter(
      (item: any) => item.orderType === orderType
    );
  } else {
    leakage = leakage.filter(
      (item: any) =>
        item.orderType == null ||
        item.orderType === ""
    );
  }
 
  const map = new Map<
    string,
    {
      groupType: string;
      totalRevenue: number;
      orders: number;
    }
  >();
 
  leakage.forEach((item: any) => {
    const key = item.groupType || "Unknown";
 
    if (!map.has(key)) {
      map.set(key, {
        groupType: key,
        totalRevenue: 0,
        orders: 0,
      });
    }
 
    const row = map.get(key)!;
 
    row.totalRevenue += item.totalRevenue ?? 0;
    row.orders += item.orders ?? 0;
  });
 
  return Array.from(map.values());
}
 
// export function getItemSegmentAnalysis(
//   rawData: any,
//   orderType: string = "All"
// ) {
//   const data = normalizeData(rawData);
 
//   // ==========================
//   // OFFLINE
//   // ==========================
 
//   let offline = data.offline_item_wise ?? [];
 
//   if (orderType === "dineIn") {
//     offline = offline.filter(
//       (item: any) =>
//         (item.orderType === "dineIn" || item.orderType === "dineIn") &&
//         item.segment !== ""
//     );
//   } else if (orderType === "takeAway") {
//     offline = offline.filter(
//       (item: any) =>
//         (item.orderType === "takeAway" || item.orderType === "takeAway") &&
//         item.segment !== ""
//     );
//   } else if (orderType === "swiggy" || orderType === "zomato") {
//     offline = [];
//   } else {
//     offline = offline.filter(
//       (item: any) =>
//         (
//           item.orderType === "dineIn" ||
//           item.orderType === "takeAway" ||
//           item.orderType === "dineIn" ||
//           item.orderType === "takeAway"
//         ) &&
//         item.segment !== ""
//     );
//   }
 
//   // ==========================
//   // ONLINE
//   // ==========================
 
//   let online = data.online_item_wise ?? [];
 
//   if (orderType === "swiggy") {
//     online = online.filter(
//       (item: any) =>
//         item.orderType === "swiggy" &&
//         item.segment !== ""
//     );
//   } else if (orderType === "zomato") {
//     online = online.filter(
//       (item: any) =>
//         item.orderType === "zomato" &&
//         item.segment !== ""
//     );
//   } else if (orderType === "dineIn" || orderType === "takeAway") {
//     online = [];
//   } else {
//     online = online.filter(
//       (item: any) =>
//         (
//           item.orderType === "swiggy" ||
//           item.orderType === "zomato"
//         ) &&
//         item.segment !== ""
//     );
//   }
 
// return {
//   offlineItems: offline,
//   onlineItems: online,
// };
// }
export function getItemSegmentAnalysis(rawData: any) {
  const data = normalizeData(rawData);
 
  const offlineItems = (data.offline_item_wise ?? []).map((item: any) => ({
    itemName: item.name,
    segment: item.segment,
    orderType: item.orderType, // "dineIn" | "takeAway"
    date: item.invoiceDate,
    quantity: item.totalQuantity ?? 0,
    revenue: item.netAmount ?? item.itemTotal ?? 0,
  }));
 
  const onlineItems = (data.online_item_wise ?? []).map((item: any) => ({
    itemName: item.name,
    segment: item.segment,
    orderType: item.orderType, // "swiggy" | "zomato"
    date: item.orderDate,
    quantity: item.totalQuantity ?? 0,
    revenue: item.netAmount ?? item.itemTotal ?? 0,
  }));
 
  return { offlineItems, onlineItems };
}
 
export function getItemSegmentDashboard(
  rawData: any,
  selectedSegment: string
) {
  const data = getItemSegmentAnalysis(rawData);
 
  const items = [...(data.offlineItems ?? []), ...(data.onlineItems ?? [])];
 
  const segments = [
    "All",
    ...Array.from(
      new Set(items.map((i: any) => i.segment).filter(Boolean))
    ),
  ];
 
  const filteredItems =
    selectedSegment === "All"
      ? items
      : items.filter((i: any) => i.segment === selectedSegment);
 
  // ---------------- Cards ----------------
 
  const totalRevenue = filteredItems.reduce(
    (s: number, i: any) => s + i.revenue,
    0
  );
 
  const totalOrders = filteredItems.reduce(
    (s: number, i: any) => s + i.quantity,
    0
  );
 
  const uniqueDays = new Set(filteredItems.map((i: any) => i.date));
 
  const avgRevenuePerDay =
    uniqueDays.size === 0 ? 0 : totalRevenue / uniqueDays.size;
 
  const avgOrderValue =
    totalOrders === 0 ? 0 : totalRevenue / totalOrders;
 
  // ---------------- Chart: dineIn vs takeAway per day ----------------
 
  const grouped: Record<string, any> = {};
 
  filteredItems.forEach((i: any) => {
    if (!i.date) return;
 
    if (!grouped[i.date]) {
      grouped[i.date] = { date: i.date, dineIn: 0, takeAway: 0 };
    }
 
    if (i.orderType === "dineIn") grouped[i.date].dineIn += i.revenue;
    if (i.orderType === "takeAway") grouped[i.date].takeAway += i.revenue;
  });
 
  const chartData = Object.values(grouped)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .map((row: any) => ({
      ...row,
      date: new Date(row.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
      }),
    }));
 
  // ---------------- Top 7 Items ----------------
 
  const itemsMap: Record<string, any> = {};
 
  filteredItems.forEach((i: any) => {
    if (!i.itemName) return;
 
    if (!itemsMap[i.itemName]) {
      itemsMap[i.itemName] = {
        itemName: i.itemName,
        segment: i.segment,
        totalRevenue: 0,
        orders: 0,
      };
    }
 
    itemsMap[i.itemName].totalRevenue += i.revenue;
    itemsMap[i.itemName].orders += i.quantity;
  });
 
const topItems = Object.values(itemsMap)
  .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
  .map((i: any) => ({
    ...i,
    avgRevenuePerDay:
      uniqueDays.size === 0 ? 0 : i.totalRevenue / uniqueDays.size,
    avgOrderValue: i.orders === 0 ? 0 : i.totalRevenue / i.orders,
  }));
  console.log("topItems count:", topItems.length, "total unique names:", Object.keys(itemsMap).length);
  return {
    segments,
    cards: {
      totalRevenue,
      avgRevenuePerDay,
      totalOrders,
      avgOrderValue,
    },
    chartData,
    topItems,
  };
}
function formatHour(h: number): string {
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
}
 
export function getHourlyRevenueTrend(rawData: any) {
  const data = normalizeData(rawData);

  const offline = data.offline_revenue_hour_wise ?? [];
  const online = data.online_revenue_hour_wise ?? [];

  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    hourLabel: formatHour(i),
    revenue: 0,
  }));

  offline.forEach((item: any) => {
    const hour = Number(item.orderHour); // <-- was invoiceHour
    const rev = Number(item.totalRevenue ?? item.itemTotal ?? 0);
    if (!isNaN(hour) && hours[hour]) {
      hours[hour].revenue += rev;
    }
  });

  online.forEach((item: any) => {
    const hour = Number(item.orderHour);
    const rev = Number(item.totalRevenue ?? item.itemTotal ?? 0);
    if (!isNaN(hour) && hours[hour]) {
      hours[hour].revenue += rev;
    }
  });

  const totalRevenue = hours.reduce((sum, h) => sum + h.revenue, 0);
  const average = totalRevenue / hours.length;

  return hours.map((h) => ({ ...h, average }));
}