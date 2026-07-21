// "use client";

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Cell,
// } from "recharts";

// type Props = {
//   data: any[];
// };

// const colors = [
//   "#2563eb",
//   "#f59e0b",
//   "#ef4444",
//   "#9333ea",
//   "#22c55e",
// ];

// export default function CashFlowAnalysis({ data }: Props) {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-5">
//       <h2 className="text-xl font-semibold text-black mb-4">
//         Cash Flow Analysis
//       </h2>

//       <ResponsiveContainer width="100%" height={320}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />

//           <XAxis dataKey="metric" />

//           <YAxis />

//           <Tooltip />

//           <Bar dataKey="amount">
//             {data.map((_, index) => (
//               <Cell
//                 key={index}
//                 fill={colors[index % colors.length]}
//               />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }