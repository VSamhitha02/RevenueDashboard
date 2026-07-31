export type DateFilterOption =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Last Month"
  | "Custom Date"
  | "Custom Date Range";

function formatForApi(date: Date, cutoffHour: number) {
  const d = new Date(date);
  d.setHours(cutoffHour, 0, 0, 0);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getDateRange(
  option: DateFilterOption,
  customDate?: string,
  customStart?: string,
  customEnd?: string,
  cutoffHour: number = 4
): { startDate: string; endDate: string } {
  const now = new Date();

  switch (option) {
    case "Today": {
      const start = new Date(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    case "Yesterday": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      const end = new Date(now);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
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
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
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
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    case "This Month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    case "Last Month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    case "Custom Date": {
      if (!customDate) return getDateRange("Today", undefined, undefined, undefined, cutoffHour);
      const start = new Date(customDate);
      const end = new Date(customDate);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    case "Custom Date Range": {
      if (!customStart || !customEnd) return getDateRange("Today", undefined, undefined, undefined, cutoffHour);
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setDate(end.getDate() + 1);
      return {
        startDate: formatForApi(start, cutoffHour),
        endDate: formatForApi(end, cutoffHour),
      };
    }

    default:
      return getDateRange("Today", undefined, undefined, undefined, cutoffHour);
  }
}