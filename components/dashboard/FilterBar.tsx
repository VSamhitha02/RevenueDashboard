"use client";

type FilterBarProps = {
  orderType: string;
  setOrderType: React.Dispatch<React.SetStateAction<string>>;
};

export default function FilterBar({
  orderType,
  setOrderType,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4">

        <label className="font-bold text-black">
          Order Type
        </label>

        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="rounded-lg border px-4 py-2 text-black"
        >
          <option value="All">All</option>
          <option value="dineIn">Dine In</option>
          <option value="takeAway">Take Away</option>
          <option value="swiggy">Swiggy</option>
          <option value="zomato">Zomato</option>
        </select>

      </div>
    </div>
  );
}