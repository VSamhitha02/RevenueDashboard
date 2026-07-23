// "use client";

// import { useState } from "react";
// import { DateFilterOption } from "@/utils/dateRanges";

// function formatDisplayDate(date: Date): string {
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// // function getButtonLabel(
// //   option: DateFilterOption,
// //   customDate: string,
// //   customStart: string,
// //   customEnd: string,
// // ): string {
// //   if (option === "Today") {
// //     return formatDisplayDate(new Date());
// //   }

// //   if (option === "Yesterday") {
// //     const yesterday = new Date();
// //     yesterday.setDate(yesterday.getDate() - 1);
// //     return formatDisplayDate(yesterday);
// //   }

// //   if (option === "Custom Date") {
// //     return customDate ? formatDisplayDate(new Date(customDate)) : option;
// //   }

// //   if (option === "Custom Date Range") {
// //     if (customStart && customEnd) {
// //       return `${formatDisplayDate(new Date(customStart))} - ${formatDisplayDate(
// //         new Date(customEnd),
// //       )}`;
// //     }
// //     return option;
// //   }

// //   // "This Week", "Last Week", "This Month", "Last Month" — keep as-is
// //   return option;
// // }

// type Props = {
//   selected: DateFilterOption;
//   onSelect: (
//     option: DateFilterOption,
//     customDate?: string,
//     customStart?: string,
//     customEnd?: string,
//   ) => void;
// };

// const OPTIONS: DateFilterOption[] = [
//   "Today",
//   "Yesterday",
//   "This Week",
//   "Last Week",
//   "This Month",
//   "Last Month",
//   "Custom Date",
//   "Custom Date Range",
// ];

// export default function DateFilter({ selected, onSelect }: Props) {
//   function formatShortDate(date: Date): string {
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//     });
//   }
// function getOptionRange(option: DateFilterOption): string {
//     const today = new Date();

//     switch (option) {
//       case "Today":
//         return formatDisplayDate(today);

//       case "Yesterday": {
//         const yesterday = new Date(today);
//         yesterday.setDate(today.getDate() - 1);
//         return formatDisplayDate(yesterday);
//       }

//    case "This Week": {
//   const today = new Date();

//   const start = new Date(today);
//   const day = start.getDay();
//   const diff = day === 0 ? -6 : 1 - day; // Monday as first day
//   start.setDate(start.getDate() + diff);

//   return `${formatShortDate(start)} - ${formatShortDate(today)}`;
// }

//       case "Last Week": {
//         const start = new Date(today);
//         const day = start.getDay();
//         const diff = day === 0 ? -6 : 1 - day;
//         start.setDate(start.getDate() + diff - 7);

//         const end = new Date(start);
//         end.setDate(start.getDate() + 6);

//         return `${formatShortDate(start)} - ${formatShortDate(end)}`;
//       }

//       default:
//         return "";
//     }
//   }
//   function getButtonLabel(
//   option: DateFilterOption,
//   customDate: string,
//   customStart: string,
//   customEnd: string,
// ): string {
//   if (option === "Today") {
//     return `Today (${formatDisplayDate(new Date())})`;
//   }

//   if (option === "Yesterday") {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     return `Yesterday (${formatDisplayDate(yesterday)})`;
//   }

//   if (option === "Custom Date") {
//     return customDate
//       ? `Custom Date (${formatDisplayDate(new Date(customDate))})`
//       : option;
//   }

//   if (option === "Custom Date Range") {
//     if (customStart && customEnd) {
//       return `Custom Date Range (${formatDisplayDate(
//         new Date(customStart),
//       )} - ${formatDisplayDate(new Date(customEnd))})`;
//     }
//     return option;
//   }

//   if (option === "This Week") {
//     return `This Week (${getOptionRange("This Week")})`;
//   }

//   if (option === "Last Week") {
//     return `Last Week (${getOptionRange("Last Week")})`;
//   }

//   if (option === "This Month") {
//     return `This Month (${getOptionRange("This Month")})`;
//   }

//   if (option === "Last Month") {
//     return `Last Month (${getOptionRange("Last Month")})`;
//   }

//   return option;
// }
//   const [open, setOpen] = useState(false);
//   const [customDate, setCustomDate] = useState("");
//   const [customStart, setCustomStart] = useState("");
//   const [customEnd, setCustomEnd] = useState("");

//   function handleSelect(option: DateFilterOption) {
//     if (option === "Custom Date" || option === "Custom Date Range") {
//       // keep panel open to let user pick date(s)
//       onSelect(option, customDate, customStart, customEnd);
//       return;
//     }
//     onSelect(option);
//     setOpen(false);
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//       <div className="flex items-center gap-4">
//         <label className="font-bold text-black">Date Filter</label>
//         <div className="relative inline-block">
//           <button
//             onClick={() => setOpen((o) => !o)}
//             className="bg-white border rounded-lg px-4 py-2 font-semibold text-black shadow\"
//           >
//             📅 {getButtonLabel(selected, customDate, customStart, customEnd)}
//           </button>

//           {open && (
//             <div className="absolute z-50 mt-2 w-72 rounded-lg shadow-xl overflow-hidden bg-[#1e1e2d] text-white">
//               <div className="bg-orange-500 px-4 py-3 font-semibold">
//                 Filter by Date
//               </div>

//               {OPTIONS.map((option) => (
//                 <div key={option}>
//                   <div
//                     onClick={() => handleSelect(option)}
//                     className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black hover:text-white bg-white text-black"
//                   >
//                     <span>
//                       {option}
//                       {getOptionRange(option)
//                         ? ` (${getOptionRange(option)})`
//                         : ""}
//                     </span>
//                     {selected === option && <span>✓</span>}
//                   </div>

//                   {option === "Custom Date" && selected === "Custom Date" && (
//                     <div className="px-4 pb-3 bg-white">
//                       <input
//                         type="date"
//                         value={customDate}
//                         onChange={(e) => {
//                           setCustomDate(e.target.value);
//                           onSelect("Custom Date", e.target.value);
//                         }}
//                         className="w-full rounded px-2 py-1 text-black"
//                       />
//                     </div>
//                   )}

//                   {option === "Custom Date Range" &&
//                     selected === "Custom Date Range" && (
//                       <div className="px-4 pb-3 flex gap-2 bg-white">
//                         <input
//                           type="date"
//                           value={customStart}
//                           onChange={(e) => {
//                             setCustomStart(e.target.value);
//                             onSelect(
//                               "Custom Date Range",
//                               undefined,
//                               e.target.value,
//                               customEnd,
//                             );
//                           }}
//                           className="w-1/2 rounded px-2 py-1 text-black bg-white"
//                         />
//                         <input
//                           type="date"
//                           value={customEnd}
//                           onChange={(e) => {
//                             setCustomEnd(e.target.value);
//                             onSelect(
//                               "Custom Date Range",
//                               undefined,
//                               customStart,
//                               e.target.value,
//                             );
//                           }}
//                           className="w-1/2 rounded px-2 py-1 text-black bg-white"
//                         />
//                       </div>
//                     )}
//                 </div>
//               ))}

//               <div className="p-3 flex justify-end bg-white">
//                 <button
//                   onClick={() => setOpen(false)}
//                   className="text-orange-400 font-semibold  bg-white"
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
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

export default function DateFilter({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const today = new Date();

  // Returns formatted dates for read-only presets
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
function getButtonLabel(): string {
  return selected;
}
  function handleSelect(option: DateFilterOption) {
    onSelect(
      option,
      customDate?.toISOString(),
      customStart?.toISOString(),
      customEnd?.toISOString(),
    );
    setOpen(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="font-bold text-black">Date Filter</label>

        {/* Dropdown Container */}
        <div className="relative inline-block">
        <button
  type="button"
  onClick={() => setOpen((o) => !o)}
  className="bg-white border rounded-lg px-4 py-2 font-semibold text-black shadow flex items-center gap-2"
>
  📅 {getButtonLabel()}
  <span className="text-xs">▼</span>
</button>
          {/* Dropdown Options List */}
          {open && (
            <div className="absolute z-50 mt-2 w-56 rounded-lg shadow-xl overflow-hidden bg-white border border-gray-200">
              <div className="bg-orange-500 px-4 py-2 font-semibold text-white text-sm">
                Filter by Date
              </div>

              {OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
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

        {/* Datepicker Inputs displaying selected date beside dropdown */}
        <div className="flex items-center gap-3">
          {/* Custom Date Input (Shows selected date inside input) */}
          {selected === "Custom Date" && (
            <DatePicker
              selected={customDate}
              onChange={(date: Date | null) => {
                setCustomDate(date);
                if (date) onSelect("Custom Date", date.toISOString());
              }}
              maxDate={today}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-36 shadow-sm"
            />
          )}

          {/* Custom Date Range Inputs (Shows selected dates inside inputs) */}
          {selected === "Custom Date Range" && (
            <div className="flex items-center gap-2">
              <DatePicker
                selected={customStart}
                onChange={(date: Date | null) => {
                  setCustomStart(date);
                  if (date)
                    onSelect(
                      "Custom Date Range",
                      undefined,
                      date.toISOString(),
                      customEnd?.toISOString(),
                    );
                }}
                maxDate={today}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
                placeholderText="Start date"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-32 shadow-sm"
              />
              <span className="text-gray-500 font-medium">to</span>
              <DatePicker
                selected={customEnd}
                onChange={(date: Date | null) => {
                  setCustomEnd(date);
                  if (date)
                    onSelect(
                      "Custom Date Range",
                      undefined,
                      customStart?.toISOString(),
                      date.toISOString(),
                    );
                }}
                minDate={customStart || undefined}
                maxDate={today}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
                placeholderText="End date"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-32 shadow-sm"
              />
            </div>
          )}

          {/* Preset Display Badge (For Today, This Week, etc.) */}
          {selected !== "Custom Date" &&
            selected !== "Custom Date Range" &&
            getPresetRange(selected) && (
              <span className="bg-gray-100 border border-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm">
                {getPresetRange(selected)}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
