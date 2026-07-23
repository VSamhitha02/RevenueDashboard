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

// Turns a raw orderType string like "pickUp" / "dineIn" into a readable
// label: "Pick Up", "Dine In". Falls back to "Offline"/"Online"/"Unknown".
function formatOrderTypeLabel(type: string): string {
  if (!type) return "Unknown";
  const spaced = type.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function getSummaryData(rawData: any) {
  const data = normalizeData(rawData);

  const offline = data.offline_revenue_day_wise ?? [];
  const online = data.online_revenue_day_wise ?? [];

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
      sum + (item.taxes || item.totalTax || (item.cgst ?? 0) + (item.sgst ?? 0) || 0),
    0
  );

  const onlineTaxes = online.reduce(
    (sum: number, item: any) =>
      sum + (item.taxes || item.totalTax || (item.cgst ?? 0) + (item.sgst ?? 0) || 0),
    0
  );

  const offlineCharges = offline.reduce(
    (sum: number, item: any) =>
      sum + (item.charges ?? item.deliveryCharge ?? item.totalCharges ?? 0),
    0
  );

  const onlineCharges = online.reduce(
    (sum: number, item: any) =>
      sum + (item.charges ?? item.deliveryCharge ?? item.totalCharges ?? 0),
    0
  );

  const offlineMerchantDiscount = offline.reduce(
    (sum: number, item: any) => sum + (item.merchantDiscount ?? 0),
    0
  );

  const onlineMerchantDiscount = online.reduce(
    (sum: number, item: any) => sum + (item.merchantDiscount ?? 0),
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
    totalMerchantDiscount: offlineMerchantDiscount + onlineMerchantDiscount,
    totalOrders,
    averageRevenue: totalDays === 0 ? 0 : totalRevenue / totalDays,
  };
}

export function getRevenueTrend(rawData: any) {
  const data = normalizeData(rawData);

  const offline = data.offline_revenue_day_wise ?? [];
  const online = data.online_revenue_day_wise ?? [];

  const grouped: Record<string, number> = {};

  offline.forEach((item: any) => {
    const date = item.invoiceDate;
    grouped[date] = (grouped[date] ?? 0) + (item.totalRevenue ?? 0);
  });

  online.forEach((item: any) => {
    const date = item.orderDate;
    grouped[date] = (grouped[date] ?? 0) + (item.totalRevenue ?? 0);
  });

  const result = Object.entries(grouped)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, revenue]) => ({ date, revenue }));

  const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
  const average = result.length === 0 ? 0 : totalRevenue / result.length;

  return result.map((item) => ({ ...item, average }));
}

export function getCashFlowAnalysis(rawData: any) {
  const data = normalizeData(rawData);
  const online = data.online_revenue_day_wise ?? [];

  const revenue = online.reduce((sum: number, item: any) => sum + item.totalRevenue, 0);
  const taxes = online.reduce((sum: number, item: any) => sum + item.taxes, 0);
  const charges = online.reduce((sum: number, item: any) => sum + item.charges, 0);
  const discounts = online.reduce((sum: number, item: any) => sum + item.merchantDiscount, 0);
  const payable = online.reduce((sum: number, item: any) => sum + item.payableAmount, 0);

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
    { name: "Offline", value: offlineRevenue },
    { name: "Online", value: onlineRevenue },
  ];
}

export function getOfflineTrend(rawData: any) {
  const data = normalizeData(rawData);

  return (data.offline_revenue_day_wise ?? []).map((item: any) => ({
    date: new Date(item.invoiceDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    revenue: item.totalRevenue,
    orders: item.orders,
  }));
}

export function getOnlineTrend(rawData: any) {
  const data = normalizeData(rawData);

  return (data.online_revenue_day_wise ?? []).map((item: any) => ({
    date: new Date(item.orderDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    revenue: item.totalRevenue,
    orders: item.orders,
  }));
}

export function getOfflineSessionChartData(rawData: any) {
  const data = normalizeData(rawData);
  const sessions = data.offline_revenue_session ?? [];

  const map = new Map();

  sessions.forEach((item: any) => {
    const key = item.session;
    if (!map.has(key)) map.set(key, { name: key, value: 0 });
    map.get(key).value += item.totalRevenue;
  });

  return Array.from(map.values());
}

export function getOnlineSessionChartData(rawData: any) {
  const data = normalizeData(rawData);
  const sessions = data.online_revenue_session ?? [];

  const map = new Map();

  sessions.forEach((item: any) => {
    const key = item.session;
    if (!map.has(key)) map.set(key, { name: key, value: 0 });
    map.get(key).value += item.totalRevenue;
  });

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Day-wise revenue broken down by whatever orderType values actually exist
// in the data (e.g. "pickUp", "dineIn", "swiggy"...) instead of a hardcoded
// dineIn/takeAway/swiggy/zomato set. Rows come back with a `date` field plus
// one numeric field per real order type; `orderTypes` lists which keys are
// present so a chart can render a <Bar> per type dynamically.
// ---------------------------------------------------------------------------
export function getOrderTypeRevenueAnalysis(rawData: any) {
  const data = normalizeData(rawData);

  const grouped: Record<string, any> = {};
  const types = new Set<string>();

  const addRow = (date: string, type: string, revenue: number) => {
    if (!date) return;
    const key = type && type.trim() !== "" ? type : "offline";
    types.add(key);
    if (!grouped[date]) grouped[date] = { date };
    grouped[date][key] = (grouped[date][key] ?? 0) + revenue;
  };

  (data.offline_revenue_day_wise ?? []).forEach((item: any) => {
    addRow(item.invoiceDate, item.orderType, item.totalRevenue ?? 0);
  });

  (data.online_revenue_day_wise ?? []).forEach((item: any) => {
    addRow(item.orderDate, item.orderType, item.totalRevenue ?? 0);
  });

  const orderTypes = Array.from(types);

  const rows = Object.values(grouped)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((row: any) => {
      const filled: any = { date: row.date };
      orderTypes.forEach((t) => (filled[t] = row[t] ?? 0));
      return filled;
    });

  return { rows, orderTypes, orderTypeLabels: orderTypes.map(formatOrderTypeLabel) };
}

export function getDailyAverageTrend(rawData: any) {
  const data = normalizeData(rawData);
  const dateMap = new Map();

  (data.offline_revenue_day_wise ?? []).forEach((item: any) => {
    const date = item.invoiceDate;
    if (!dateMap.has(date)) dateMap.set(date, { date, revenue: 0 });
    dateMap.get(date).revenue += item.totalRevenue;
  });

  (data.online_revenue_day_wise ?? []).forEach((item: any) => {
    const date = item.orderDate;
    if (!dateMap.has(date)) dateMap.set(date, { date, revenue: 0 });
    dateMap.get(date).revenue += item.totalRevenue;
  });

  const rows = Array.from(dateMap.values());

  const avgRevenue =
    rows.reduce((sum, item) => sum + item.revenue, 0) / (rows.length || 1);

  return rows.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    revenue: item.revenue,
    average: avgRevenue,
  }));
}

export function getPaymentModeAnalysis(rawData: any) {
  try {
    const data = normalizeData(rawData);

    let payment = data.payment_mode_wise;

    if (!payment || !Array.isArray(payment)) {
      payment = [];
    }

    const map = new Map();

    payment.forEach((item: any) => {
      if (!item || !item.invoiceDate) return;

      const rawMode =
        item.mode || item.paymentMode || item.payment_mode || item.paymentMethod || "";

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

    return { pieData, barData };
  } catch (error) {
    console.error("CRASH inside getPaymentModeAnalysis:", error);
    return { pieData: [], barData: [] };
  }
}

export function getRevenueLeakageAnalysis(rawData: any) {
  const data = normalizeData(rawData);
  const leakage = data.revenue_leakage_wise ?? [];

  const map = new Map<string, { groupType: string; totalRevenue: number; orders: number }>();

  leakage.forEach((item: any) => {
    const key = item.groupType || "Unknown";

    if (!map.has(key)) {
      map.set(key, { groupType: key, totalRevenue: 0, orders: 0 });
    }

    const row = map.get(key)!;
    row.totalRevenue += item.totalRevenue ?? 0;
    row.orders += item.orders ?? 0;
  });

  return Array.from(map.values());
}

export function getItemSegmentAnalysis(rawData: any) {
  const data = normalizeData(rawData);

  const offlineItems = (data.offline_item_wise ?? []).map((item: any) => ({
    itemName: item.name,
    segment: item.segment,
    orderType: item.orderType, // e.g. "pickUp", "dineIn", "takeAway" — whatever is actually in the data
    date: item.invoiceDate,
    quantity: item.totalQuantity ?? 0,
    revenue: item.netAmount ?? item.itemTotal ?? 0,
  }));

  const onlineItems = (data.online_item_wise ?? []).map((item: any) => ({
    itemName: item.name,
    segment: item.segment,
    orderType: item.orderType, // e.g. "swiggy", "zomato"
    date: item.orderDate,
    quantity: item.totalQuantity ?? 0,
    revenue: item.netAmount ?? item.itemTotal ?? 0,
  }));

  return { offlineItems, onlineItems };
}

export function getItemSegmentDashboard(rawData: any, selectedSegment: string) {
  const data = getItemSegmentAnalysis(rawData);

  const items = [...(data.offlineItems ?? []), ...(data.onlineItems ?? [])];

  const segments = [
    "All",
    ...Array.from(new Set(items.map((i: any) => i.segment).filter(Boolean))),
  ];

  const filteredItems =
    selectedSegment === "All" ? items : items.filter((i: any) => i.segment === selectedSegment);

  // ---------------- Cards ----------------

  const totalRevenue = filteredItems.reduce((s: number, i: any) => s + i.revenue, 0);
  const totalOrders = filteredItems.reduce((s: number, i: any) => s + i.quantity, 0);

  const uniqueDays = new Set(filteredItems.map((i: any) => i.date));

  const avgRevenuePerDay = uniqueDays.size === 0 ? 0 : totalRevenue / uniqueDays.size;
  const avgOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders;

  // ---------------- Chart: revenue per day, split by whichever order
  // types actually exist in the filtered items (no hardcoded dineIn/
  // takeAway — could be "pickUp", "dineIn", "swiggy", anything) ----------------

  const grouped: Record<string, any> = {};
  const typesSet = new Set<string>();

  filteredItems.forEach((i: any) => {
    if (!i.date) return;

    const type = i.orderType && i.orderType.trim() !== "" ? i.orderType : "Unknown";
    typesSet.add(type);

    if (!grouped[i.date]) {
      grouped[i.date] = { date: i.date };
    }

    grouped[i.date][type] = (grouped[i.date][type] ?? 0) + i.revenue;
  });

  const orderTypes = Array.from(typesSet);

  const chartData = Object.values(grouped)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((row: any) => {
      const filled: any = {
        date: new Date(row.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
        }),
      };
      orderTypes.forEach((t) => (filled[t] = row[t] ?? 0));
      return filled;
    });

  // ---------------- Top Items ----------------

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
      avgRevenuePerDay: uniqueDays.size === 0 ? 0 : i.totalRevenue / uniqueDays.size,
      avgOrderValue: i.orders === 0 ? 0 : i.totalRevenue / i.orders,
    }));

  return {
    segments,
    cards: {
      totalRevenue,
      avgRevenuePerDay,
      totalOrders,
      avgOrderValue,
    },
    chartData,
    // Raw keys (e.g. "pickUp") + human-readable labels (e.g. "Pick Up"),
    // in the same order, for rendering one <Bar> per real order type.
    orderTypes,
    orderTypeLabels: orderTypes.map(formatOrderTypeLabel),
    topItems,
  };
}

function formatHour(h: number): string {
  const hour = ((h % 24) + 24) % 24;
  return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
}

export function getHourlyRevenueTrend(rawData: any, cutoffHour: number = 5) {
  const data = normalizeData(rawData);

  const offline = data.offline_revenue_hour_wise ?? [];
  const online = data.online_revenue_hour_wise ?? [];

  // 24 points: cutoffHour -> ... -> (cutoffHour - 1) wrapped around.
  // e.g. cutoffHour = 5 -> [5 AM, 6 AM, ..., 11 PM, 12 AM, ..., 4 AM]
  const hours = Array.from({ length: 24 }, (_, i) => {
    const actualHour = (cutoffHour + i) % 24;
    return {
      hour: actualHour,
      hourLabel: formatHour(actualHour),
      revenue: 0,
    };
  });

  // Map actual clock hour -> its position in the `hours` array above
  const hourToIndex = new Map(hours.map((h, idx) => [h.hour, idx]));

  offline.forEach((item: any) => {
    const hour = Number(item.orderHour);
    const rev = Number(item.totalRevenue ?? item.itemTotal ?? 0);
    const idx = hourToIndex.get(hour);
    if (!isNaN(hour) && idx !== undefined) {
      hours[idx].revenue += rev;
    }
  });

  online.forEach((item: any) => {
    const hour = Number(item.orderHour);
    const rev = Number(item.totalRevenue ?? item.itemTotal ?? 0);
    const idx = hourToIndex.get(hour);
    if (!isNaN(hour) && idx !== undefined) {
      hours[idx].revenue += rev;
    }
  });

  const totalRevenue = hours.reduce((sum, h) => sum + h.revenue, 0);
  const average = totalRevenue / hours.length;

  return hours.map((h) => ({ ...h, average }));
}