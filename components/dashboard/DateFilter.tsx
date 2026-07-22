"use client";

import { useState } from "react";
import { DateFilterOption } from "@/utils/dateRanges";

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getButtonLabel(
  option: DateFilterOption,
  customDate: string,
  customStart: string,
  customEnd: string
): string {
  if (option === "Today") {
    return formatDisplayDate(new Date());
  }

  if (option === "Yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDisplayDate(yesterday);
  }

  if (option === "Custom Date") {
    return customDate ? formatDisplayDate(new Date(customDate)) : option;
  }

  if (option === "Custom Date Range") {
    if (customStart && customEnd) {
      return `${formatDisplayDate(new Date(customStart))} - ${formatDisplayDate(
        new Date(customEnd)
      )}`;
    }
    return option;
  }

  // "This Week", "Last Week", "This Month", "Last Month" — keep as-is
  return option;
}

type Props = {
  selected: DateFilterOption;
  onSelect: (
    option: DateFilterOption,
    customDate?: string,
    customStart?: string,
    customEnd?: string
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

export default function DateFilter({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function handleSelect(option: DateFilterOption) {
    if (option === "Custom Date" || option === "Custom Date Range") {
      // keep panel open to let user pick date(s)
      onSelect(option, customDate, customStart, customEnd);
      return;
    }
    onSelect(option);
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-white border rounded-lg px-4 py-2 font-semibold text-black shadow\"
      >
        📅 {getButtonLabel(selected, customDate, customStart, customEnd)}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-lg shadow-xl overflow-hidden bg-[#1e1e2d] text-white">
          <div className="bg-orange-500 px-4 py-3 font-semibold">
            Filter by Date
          </div>

          {OPTIONS.map((option) => (
            <div key={option}>
              <div
                onClick={() => handleSelect(option)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black hover:text-white bg-white text-black"
              >
                <span>{option}</span>
                {selected === option && <span>✓</span>}
              </div>

              {option === "Custom Date" && selected === "Custom Date" && (
                <div className="px-4 pb-3">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      onSelect("Custom Date", e.target.value);
                    }}
                    className="w-full rounded px-2 py-1 text-black"
                  />
                </div>
              )}

              {option === "Custom Date Range" &&
                selected === "Custom Date Range" && (
                  <div className="px-4 pb-3 flex gap-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => {
                        setCustomStart(e.target.value);
                        onSelect(
                          "Custom Date Range",
                          undefined,
                          e.target.value,
                          customEnd
                        );
                      }}
                      className="w-1/2 rounded px-2 py-1 text-black"
                    />
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => {
                        setCustomEnd(e.target.value);
                        onSelect(
                          "Custom Date Range",
                          undefined,
                          customStart,
                          e.target.value
                        );
                      }}
                      className="w-1/2 rounded px-2 py-1 text-black"
                    />
                  </div>
                )}
            </div>
          ))}

          <div className="p-3 flex justify-end bg-white">
            <button
              onClick={() => setOpen(false)}
              className="text-orange-400 font-semibold  bg-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}