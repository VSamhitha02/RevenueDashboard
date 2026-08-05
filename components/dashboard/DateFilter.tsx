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
  cutoffHour: string;
  onCutoffChange: (hour: string) => void;
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
  "Custom",
];

const BUTTON_OPTIONS = OPTIONS;

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
  value?: string;
  onClick?: () => void;
  onChangeValue: (val: string) => void;
  onDateParsed: (d: Date) => void;
  disabled?: boolean;
  className?: string;
};

const SegmentedDateInput = forwardRef<HTMLDivElement, InputProps>(
  ({ value = "", onClick, onChangeValue, onDateParsed, disabled = false, className = "" }, ref) => {
    const [dd, setDd] = useState("");
    const [mm, setMm] = useState("");
    const [yyyy, setYyyy] = useState("");

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

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
        if (disabled) return;
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
        if (disabled) return;
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
      "text-center bg-transparent outline-none text-black placeholder:text-gray-400 disabled:cursor-not-allowed";

    return (
      <div
        ref={ref}
        onClick={disabled ? undefined : onClick}
        className={`flex items-center gap-0.5 border border-gray-300 rounded-lg px-2 py-1 text-xs font-mono text-black shadow-sm ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-80"
            : "focus-within:ring-2 focus-within:ring-orange-500 cursor-text"
        } ${className}`}
      >
        <input
          ref={dayRef}
          value={dd}
          disabled={disabled}
          onChange={makeHandler(setDd, 2, 31, monthRef, "d")}
          onKeyDown={makeKeyDown(dd, null)}
          onFocus={disabled ? undefined : onClick}
          placeholder="DD"
          inputMode="numeric"
          className={`${segmentClass} w-4`}
        />
        <span className="text-black select-none">/</span>
        <input
          ref={monthRef}
          value={mm}
          disabled={disabled}
          onChange={makeHandler(setMm, 2, 12, yearRef, "m")}
          onKeyDown={makeKeyDown(mm, dayRef)}
          onFocus={disabled ? undefined : onClick}
          placeholder="MM"
          inputMode="numeric"
          className={`${segmentClass} w-4`}
        />
        <span className="text-black select-none">/</span>
        <input
          ref={yearRef}
          value={yyyy}
          disabled={disabled}
          onChange={makeHandler(setYyyy, 4, 9999, null, "y")}
          onKeyDown={makeKeyDown(yyyy, monthRef)}
          onFocus={disabled ? undefined : onClick}
          placeholder="YYYY"
          inputMode="numeric"
          className={`${segmentClass} w-8`}
        />
      </div>
    );
  },
);

SegmentedDateInput.displayName = "SegmentedDateInput";

export default function DateFilter({ selected, onSelect, cutoffHour, onCutoffChange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const urlCustomStart = searchParams.get("customStart");
  const urlCustomEnd = searchParams.get("customEnd");

  const [customStart, setCustomStart] = useState<Date | null>(
    urlCustomStart ? new Date(urlCustomStart) : new Date(),
  );
  const [customEnd, setCustomEnd] = useState<Date | null>(
    urlCustomEnd ? new Date(urlCustomEnd) : new Date(),
  );

  const initial24 = Number(cutoffHour || "0");

  const to12Hour = (hour24: number) => {
    const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const period = hour24 >= 12 ? "PM" : "AM";
    return `${hour} ${period}`;
  };

  const [cutoffValue, setCutoffValue] = useState(to12Hour(initial24));

  const [startStr, setStartStr] = useState(
    urlCustomStart ? toSegmentedStr(new Date(urlCustomStart)) : toSegmentedStr(new Date()),
  );
  const [endStr, setEndStr] = useState(
    urlCustomEnd ? toSegmentedStr(new Date(urlCustomEnd)) : toSegmentedStr(new Date()),
  );

  const today = new Date();

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

  useEffect(() => {
    if (selected !== "Custom") {
      const range = getPresetDateRange(selected);
      if (range) {
        setCustomStart(range.start);
        setCustomEnd(range.end);
        setStartStr(toSegmentedStr(range.start));
        setEndStr(toSegmentedStr(range.end));
      }
    }
  }, [selected]);

  function handleSelectOption(option: DateFilterOption) {
    const isCustomOption = option === "Custom";

    if (!isCustomOption) {
      const range = getPresetDateRange(option);
      if (range) {
        setCustomStart(range.start);
        setCustomEnd(range.end);
        setStartStr(toSegmentedStr(range.start));
        setEndStr(toSegmentedStr(range.end));
      }
    }

    onSelect(
      option,
      undefined,
      isCustomOption ? customStart?.toISOString() : undefined,
      isCustomOption ? customEnd?.toISOString() : undefined,
    );

    updateUrl({
      dateFilter: option,
      customStart: isCustomOption ? customStart?.toISOString() : undefined,
      customEnd: isCustomOption ? customEnd?.toISOString() : undefined,
    });

    setOpen(false);
  }

  const updateCutoffHour = (value: string) => {
    const [hourStr, period] = value.split(" ");
    let hour24 = Number(hourStr);

    if (period === "AM") {
      if (hour24 === 12) hour24 = 0;
    } else {
      if (hour24 !== 12) hour24 += 12;
    }

    onCutoffChange(String(hour24));

    updateUrl({
      cutoffHour: String(hour24),
    });
  };

  const isEditable = selected === "Custom";

  const renderDateInputs = () => (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-xs font-semibold text-gray-500">From</span>
      <DatePicker
        selected={customStart}
        disabled={!isEditable}
        popperPlacement="bottom-start"
       

        onChange={(date: Date | null) => {
          if (!isEditable) return;
          setCustomStart(date);
          if (date) {
            setStartStr(toSegmentedStr(date));
            onSelect(
              "Custom",
              undefined,
              date.toISOString(),
              customEnd?.toISOString(),
            );
            updateUrl({
              dateFilter: "Custom",
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
            disabled={!isEditable}
            onChangeValue={setStartStr}
            onDateParsed={(d) => {
              if (!isEditable) return;
              setCustomStart(d);
              onSelect(
                "Custom",
                undefined,
                d.toISOString(),
                customEnd?.toISOString(),
              );
              updateUrl({
                dateFilter: "Custom",
                customStart: d.toISOString(),
                customEnd: customEnd?.toISOString(),
              });
            }}
          />
        }
      />

      <span className="text-xs font-semibold text-gray-500">to</span>

      <DatePicker
        selected={customEnd}
        disabled={!isEditable}
        popperPlacement="bottom-start"

        onChange={(date: Date | null) => {
          if (!isEditable) return;
          setCustomEnd(date);
          if (date) {
            setEndStr(toSegmentedStr(date));
            onSelect(
              "Custom",
              undefined,
              customStart?.toISOString(),
              date.toISOString(),
            );
            updateUrl({
              dateFilter: "Custom",
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
            disabled={!isEditable}
            onChangeValue={setEndStr}
            onDateParsed={(d) => {
              if (!isEditable) return;
              setCustomEnd(d);
              onSelect(
                "Custom",
                undefined,
                customStart?.toISOString(),
                d.toISOString(),
              );
              updateUrl({
                dateFilter: "Custom",
                customStart: customStart?.toISOString(),
                customEnd: d.toISOString(),
              });
            }}
          />
        }
      />
    </div>
  );

  const renderCutoffHour = () => (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-xs font-semibold text-black">Cutoff</span>
      <select
        value={cutoffValue}
        onChange={(e) => {
          setCutoffValue(e.target.value);
          updateCutoffHour(e.target.value);
        }}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-medium text-black bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
      >
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i % 12 === 0 ? 12 : i % 12;
          const period = i < 12 ? "AM" : "PM";

          return (
            <option key={i} value={`${hour} ${period}`}>
              {hour} {period}
            </option>
          );
        })}
      </select>
    </div>
  );

  return (
    <div className="sticky top-0 z-50 bg-white rounded-lg shadow-md px-4 py-3 mb-6">
      {/* ---------------- Unified Single Line Container ---------------- */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        {/* Left: Desktop Buttons / Mobile Dropdown */}
        <div className="flex items-center gap-2">
          {/* Desktop Filter Options */}
          <div className="hidden lg:flex items-center gap-2">
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

          {/* Mobile Filter Dropdown */}
          <div className="relative inline-block lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-black shadow-sm flex items-center gap-1.5"
            >
              📅 {selected}
              <span className="text-[10px]">▼</span>
            </button>

            {open && (
              <div className="absolute left-0 z-50 mt-2 w-48 rounded-lg shadow-xl overflow-hidden bg-white border border-gray-200">
                <div className="bg-orange-500 px-3 py-1.5 font-semibold text-white text-xs">
                  Filter by Date
                </div>

                {OPTIONS.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-xs transition-colors ${
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
        </div>

        {/* Right Side: Date Range Inputs + Cutoff Hour */}
        <div className="flex items-center gap-3">
          {renderDateInputs()}
          <div className="h-5 w-px bg-gray-300" />
          {renderCutoffHour()}
        </div>
      </div>
    </div>
  );
}