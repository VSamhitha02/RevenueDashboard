"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  forwardRef,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateFilterOption } from "@/utils/dateRanges";

type Props = {
  selected: DateFilterOption;
  onSelect: (
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string,
  ) => void;
};

const OPTIONS: DateFilterOption[] = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "Custom Date",
  "Custom Date Range",
];

// Desktop button row excludes "Custom Date Range" — that one now lives
// permanently in the fixed right-corner box instead of being a button.
const BUTTON_OPTIONS: DateFilterOption[] = OPTIONS.filter(
  (o) => o !== "Custom Date Range",
);

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function toSegmentedStr(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function parseMaskedDate(formattedStr: string): Date | null {
  if (formattedStr.length !== 10) return null;
  const [day, month, year] = formattedStr.split("/").map(Number);
  if (!day || !month || !year || year < 1000) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  ) {
    return date;
  }
  return null;
}

type InputProps = {
  value?: string; // combined "DD/MM/YYYY", used to sync when the calendar sets a date
  onClick?: () => void;
  onChangeValue: (val: string) => void;
  onDateParsed: (d: Date) => void;
  className?: string;
};

// Segmented DD / MM / YYYY input — the two "/" are real, fixed characters.
// Only the digit boxes are editable; typing auto-advances; backspace on an
// empty box jumps back a segment. Clicking or focusing any segment still
// tells react-datepicker to open the calendar via onClick.
const SegmentedDateInput = forwardRef<HTMLDivElement, InputProps>(
  ({ value = "", onClick, onChangeValue, onDateParsed, className = "" }, ref) => {
    const [dd, setDd] = useState("");
    const [mm, setMm] = useState("");
    const [yyyy, setYyyy] = useState("");

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // Keep segments in sync when the parent sets a full value externally
    // (e.g. user clicked a day on the calendar popup).
    useEffect(() => {
      const [d = "", m = "", y = ""] = value.split("/");
      setDd(d);
      setMm(m);
      setYyyy(y);
    }, [value]);

    const emit = (d: string, m: string, y: string) => {
      onChangeValue(`${d}/${m}/${y}`);
      if (d.length === 2 && m.length === 2 && y.length === 4) {
        const parsed = parseMaskedDate(`${d}/${m}/${y}`);
        if (parsed) onDateParsed(parsed);
      }
    };

    // clamp so e.g. typing "3" then "9" for day can't produce "39"
    const clamp = (digits: string, max: number, upperBound: number) => {
      if (digits.length === max) {
        const n = parseInt(digits, 10);
        if (n > upperBound) return String(upperBound);
        if (n === 0) return String(1).padStart(max, "0");
      }
      return digits;
    };

    const makeHandler =
      (
        setter: (v: string) => void,
        max: number,
        upperBound: number,
        nextRef: React.RefObject<HTMLInputElement | null> | null,
        seg: "d" | "m" | "y",
      ) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        let digits = e.target.value.replace(/\D/g, "").slice(0, max);
        digits = clamp(digits, max, upperBound);
        setter(digits);

        const d = seg === "d" ? digits : dd;
        const m = seg === "m" ? digits : mm;
        const y = seg === "y" ? digits : yyyy;
        emit(d, m, y);

        if (digits.length === max && nextRef?.current) {
          nextRef.current.focus();
          nextRef.current.select();
        }
      };

    const makeKeyDown =
      (
        current: string,
        prevRef: React.RefObject<HTMLInputElement | null> | null,
      ) =>
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && current === "" && prevRef?.current) {
          prevRef.current.focus();
        }
        if (
          e.key === "ArrowLeft" &&
          prevRef?.current &&
          e.currentTarget.selectionStart === 0
        ) {
          prevRef.current.focus();
        }
      };

    const segmentClass =
      "text-center bg-transparent outline-none text-black placeholder-gray-400";

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`flex items-center gap-0.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono text-black shadow-sm focus-within:ring-2 focus-within:ring-orange-500 cursor-text ${className}`}
      >
        <input
          ref={dayRef}
          value={dd}
          onChange={makeHandler(setDd, 2, 31, monthRef, "d")}
          onKeyDown={makeKeyDown(dd, null)}
          onFocus={onClick}
          placeholder="DD"
          inputMode="numeric"
          className={`${segmentClass} w-5`}
        />
        <span className="text-gray-400 select-none">/</span>
        <input
          ref={monthRef}
          value={mm}
          onChange={makeHandler(setMm, 2, 12, yearRef, "m")}
          onKeyDown={makeKeyDown(mm, dayRef)}
          onFocus={onClick}
          placeholder="MM"
          inputMode="numeric"
          className={`${segmentClass} w-5`}
        />
        <span className="text-gray-400 select-none">/</span>
        <input
          ref={yearRef}
          value={yyyy}
          onChange={makeHandler(setYyyy, 4, 9999, null, "y")}
          onKeyDown={makeKeyDown(yyyy, monthRef)}
          onFocus={onClick}
          placeholder="YYYY"
          inputMode="numeric"
          className={`${segmentClass} w-9`}
        />
      </div>
    );
  },
);

SegmentedDateInput.displayName = "SegmentedDateInput";

export default function DateFilter({ selected, onSelect }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false); // still used by the mobile dropdown

  const urlCustomDate = searchParams.get("customDate");
  const urlCustomStart = searchParams.get("customStart");
  const urlCustomEnd = searchParams.get("customEnd");

  const [customDate, setCustomDate] = useState<Date | null>(
    urlCustomDate ? new Date(urlCustomDate) : null,
  );
  const [customStart, setCustomStart] = useState<Date | null>(
    urlCustomStart ? new Date(urlCustomStart) : null,
  );
  const [customEnd, setCustomEnd] = useState<Date | null>(
    urlCustomEnd ? new Date(urlCustomEnd) : null,
  );

  const [dateStr, setDateStr] = useState(
    urlCustomDate ? toSegmentedStr(new Date(urlCustomDate)) : "",
  );
  const [startStr, setStartStr] = useState(
    urlCustomStart ? toSegmentedStr(new Date(urlCustomStart)) : "",
  );
  const [endStr, setEndStr] = useState(
    urlCustomEnd ? toSegmentedStr(new Date(urlCustomEnd)) : "",
  );

  const today = new Date();

  function getPresetRange(option: DateFilterOption): string {
    const currentDate = new Date();

    switch (option) {
      case "Today":
        return formatDisplayDate(currentDate);

      case "Yesterday": {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        return formatDisplayDate(yesterday);
      }

      case "This Week": {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);

        return `${formatShortDate(start)} - ${formatShortDate(currentDate)}`;
      }

      case "Last Week": {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff - 7);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return `${formatShortDate(start)} - ${formatShortDate(end)}`;
      }

      case "This Month": {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        return `${formatShortDate(start)} - ${formatShortDate(currentDate)}`;
      }

      case "Last Month": {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        );
        const end = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
        );
        return `${formatShortDate(start)} - ${formatShortDate(end)}`;
      }

      default:
        return "";
    }
  }

  // Same date math as getPresetRange, but returns real Date objects so we
  // can drop them straight into the fixed custom-range box on the right.
  function getPresetDateRange(
    option: DateFilterOption,
  ): { start: Date; end: Date } | null {
    const currentDate = new Date();

    switch (option) {
      case "Today":
        return { start: currentDate, end: currentDate };

      case "Yesterday": {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        return { start: yesterday, end: yesterday };
      }

      case "This Week": {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);
        return { start, end: currentDate };
      }

      case "Last Week": {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff - 7);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
      }

      case "This Month": {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        return { start, end: currentDate };
      }

      case "Last Month": {
        const start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        );
        const end = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
        );
        return { start, end };
      }

      default:
        return null;
    }
  }

  function updateUrl(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function handleSelectOption(option: DateFilterOption) {
    onSelect(
      option,
      customDate?.toISOString(),
      customStart?.toISOString(),
      customEnd?.toISOString(),
    );

    // Only keep custom-date params in the URL when they're relevant to the
    // option just picked, so switching to a preset clears stale custom dates.
    updateUrl({
      dateFilter: option,
      customDate: option === "Custom Date" ? customDate?.toISOString() : undefined,
      customStart:
        option === "Custom Date Range" ? customStart?.toISOString() : undefined,
      customEnd:
        option === "Custom Date Range" ? customEnd?.toISOString() : undefined,
    });

    // Keep the fixed right-corner range box in sync with whichever preset
    // was just picked (e.g. "Yesterday" -> 04/08/2026 to 04/08/2026).
    const range = getPresetDateRange(option);
    if (range) {
      setCustomStart(range.start);
      setCustomEnd(range.end);
      setStartStr(toSegmentedStr(range.start));
      setEndStr(toSegmentedStr(range.end));
    }

    setOpen(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* ---------------- Desktop Layout (lg and up) ---------------- */}
      <div className="hidden lg:flex items-center gap-3 flex-wrap">
        <label className="font-bold text-black whitespace-nowrap">
          Date Filter
        </label>

        {/* Button Group (replaces the dropdown) */}
        <div className="flex items-center gap-2 flex-wrap">
          {BUTTON_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selected === option
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Inline single-date picker, only shown when "Custom Date" is active */}
        {selected === "Custom Date" && (
          <DatePicker
            selected={customDate}
            onChange={(date: Date | null) => {
              setCustomDate(date);
              if (date) {
                setDateStr(toSegmentedStr(date));
                onSelect("Custom Date", date.toISOString());
                updateUrl({
                  dateFilter: "Custom Date",
                  customDate: date.toISOString(),
                });
              }
            }}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            customInput={
              <SegmentedDateInput
                value={dateStr}
                onChangeValue={setDateStr}
                onDateParsed={(d) => {
                  setCustomDate(d);
                  onSelect("Custom Date", d.toISOString());
                  updateUrl({
                    dateFilter: "Custom Date",
                    customDate: d.toISOString(),
                  });
                }}
              />
            }
          />
        )}

        {/* Selected filter's date / range badge */}
        <span className="bg-orange-50 border border-orange-200 text-orange-700 font-medium px-3 py-2 rounded-lg">
          {selected}
        </span>
        <span className="bg-gray-100 border border-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm">
          {selected === "Custom Date" && customDate
            ? formatDisplayDate(customDate)
            : selected === "Custom Date Range" && customStart && customEnd
              ? `${formatDisplayDate(customStart)} - ${formatDisplayDate(customEnd)}`
              : getPresetRange(selected)}
        </span>

        {/* Custom Date Range — fixed to the right corner, always visible,
            and always refilled to match whichever filter is selected. */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Custom Range
          </span>
          <DatePicker
            selected={customStart}
            onChange={(date: Date | null) => {
              setCustomStart(date);
              if (date) {
                setStartStr(toSegmentedStr(date));
                onSelect(
                  "Custom Date Range",
                  undefined,
                  date.toISOString(),
                  customEnd?.toISOString(),
                );
                updateUrl({
                  dateFilter: "Custom Date Range",
                  customStart: date.toISOString(),
                  customEnd: customEnd?.toISOString(),
                });
              }
            }}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            customInput={
              <SegmentedDateInput
                value={startStr}
                onChangeValue={setStartStr}
                onDateParsed={(d) => {
                  setCustomStart(d);
                  onSelect(
                    "Custom Date Range",
                    undefined,
                    d.toISOString(),
                    customEnd?.toISOString(),
                  );
                  updateUrl({
                    dateFilter: "Custom Date Range",
                    customStart: d.toISOString(),
                    customEnd: customEnd?.toISOString(),
                  });
                }}
              />
            }
          />

          <span className="text-gray-500 font-medium">to</span>

          <DatePicker
            selected={customEnd}
            onChange={(date: Date | null) => {
              setCustomEnd(date);
              if (date) {
                setEndStr(toSegmentedStr(date));
                onSelect(
                  "Custom Date Range",
                  undefined,
                  customStart?.toISOString(),
                  date.toISOString(),
                );
                updateUrl({
                  dateFilter: "Custom Date Range",
                  customStart: customStart?.toISOString(),
                  customEnd: date.toISOString(),
                });
              }
            }}
            minDate={customStart || undefined}
            maxDate={today}
            dateFormat="dd/MM/yyyy"
            customInput={
              <SegmentedDateInput
                value={endStr}
                onChangeValue={setEndStr}
                onDateParsed={(d) => {
                  setCustomEnd(d);
                  onSelect(
                    "Custom Date Range",
                    undefined,
                    customStart?.toISOString(),
                    d.toISOString(),
                  );
                  updateUrl({
                    dateFilter: "Custom Date Range",
                    customStart: customStart?.toISOString(),
                    customEnd: d.toISOString(),
                  });
                }}
              />
            }
          />
        </div>
      </div>

      {/* ---------------- Mobile / Tablet Layout (below lg) ---------------- */}
      <div className="flex lg:hidden items-center gap-4 flex-wrap">
        <label className="font-bold text-black">Date Filter</label>

        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="bg-white border rounded-lg px-4 py-2 font-semibold text-black shadow flex items-center gap-2"
          >
            📅 {selected}
            <span className="text-xs">▼</span>
          </button>

          {open && (
            <div className="absolute z-50 mt-2 w-56 rounded-lg shadow-xl overflow-hidden bg-white border border-gray-200">
              <div className="bg-orange-500 px-4 py-2 font-semibold text-white text-sm">
                Filter by Date
              </div>

              {OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                    selected === option
                      ? "bg-orange-50 text-orange-600 font-semibold"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span>{option}</span>
                  {selected === option && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selected === "Custom Date" && (
            <DatePicker
              selected={customDate}
              onChange={(date: Date | null) => {
                setCustomDate(date);
                if (date) {
                  setDateStr(toSegmentedStr(date));
                  onSelect("Custom Date", date.toISOString());
                  updateUrl({
                    dateFilter: "Custom Date",
                    customDate: date.toISOString(),
                  });
                }
              }}
              maxDate={today}
              dateFormat="dd/MM/yyyy"
              customInput={
                <SegmentedDateInput
                  value={dateStr}
                  onChangeValue={setDateStr}
                  onDateParsed={(d) => {
                    setCustomDate(d);
                    onSelect("Custom Date", d.toISOString());
                    updateUrl({
                      dateFilter: "Custom Date",
                      customDate: d.toISOString(),
                    });
                  }}
                />
              }
            />
          )}

          {selected === "Custom Date Range" && (
            <div className="flex items-center gap-2">
              <DatePicker
                selected={customStart}
                onChange={(date: Date | null) => {
                  setCustomStart(date);
                  if (date) {
                    setStartStr(toSegmentedStr(date));
                    onSelect(
                      "Custom Date Range",
                      undefined,
                      date.toISOString(),
                      customEnd?.toISOString(),
                    );
                    updateUrl({
                      dateFilter: "Custom Date Range",
                      customStart: date.toISOString(),
                      customEnd: customEnd?.toISOString(),
                    });
                  }
                }}
                maxDate={today}
                dateFormat="dd/MM/yyyy"
                customInput={
                  <SegmentedDateInput
                    value={startStr}
                    onChangeValue={setStartStr}
                    onDateParsed={(d) => {
                      setCustomStart(d);
                      onSelect(
                        "Custom Date Range",
                        undefined,
                        d.toISOString(),
                        customEnd?.toISOString(),
                      );
                      updateUrl({
                        dateFilter: "Custom Date Range",
                        customStart: d.toISOString(),
                        customEnd: customEnd?.toISOString(),
                      });
                    }}
                  />
                }
              />

              <span className="text-gray-500 font-medium">to</span>

              <DatePicker
                selected={customEnd}
                onChange={(date: Date | null) => {
                  setCustomEnd(date);
                  if (date) {
                    setEndStr(toSegmentedStr(date));
                    onSelect(
                      "Custom Date Range",
                      undefined,
                      customStart?.toISOString(),
                      date.toISOString(),
                    );
                    updateUrl({
                      dateFilter: "Custom Date Range",
                      customStart: customStart?.toISOString(),
                      customEnd: date.toISOString(),
                    });
                  }
                }}
                minDate={customStart || undefined}
                maxDate={today}
                dateFormat="dd/MM/yyyy"
                customInput={
                  <SegmentedDateInput
                    value={endStr}
                    onChangeValue={setEndStr}
                    onDateParsed={(d) => {
                      setCustomEnd(d);
                      onSelect(
                        "Custom Date Range",
                        undefined,
                        customStart?.toISOString(),
                        d.toISOString(),
                      );
                      updateUrl({
                        dateFilter: "Custom Date Range",
                        customStart: customStart?.toISOString(),
                        customEnd: d.toISOString(),
                      });
                    }}
                  />
                }
              />
            </div>
          )}

          {selected !== "Custom Date" &&
            selected !== "Custom Date Range" &&
            getPresetRange(selected) && (
              <span className="bg-gray-100 border border-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm">
                {getPresetRange(selected)}
              </span>
            )}
        </div>
      </div>
      {/* ???? */}
    </div>
  );
}