export type DateFilterOption =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Last Month"
  | "Custom Date"
  | "Custom Date Range";

function formatForApi(date: Date, endOfDay = false) {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(4, 0, 0, 0); // matches your cutoffHour: 4
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getDateRange(
  option: DateFilterOption,
  customDate?: string,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  const now = new Date();

  switch (option) {
    case "Today": {
      const start = new Date(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "Yesterday": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      const end = new Date(now);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "This Week": {
      const start = new Date(now);
      const day = start.getDay(); // 0 = Sunday
      const diff = day === 0 ? 6 : day - 1; // treat Monday as start
      start.setDate(start.getDate() - diff);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "Last Week": {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "This Month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "Last Month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "Custom Date": {
      if (!customDate) return getDateRange("Today");
      const start = new Date(customDate);
      const end = new Date(customDate);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    case "Custom Date Range": {
      if (!customStart || !customEnd) return getDateRange("Today");
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start),
        endDate: formatForApi(end),
      };
    }

    default:
      return getDateRange("Today");
  }
}