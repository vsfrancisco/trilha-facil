"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartItem {
  track: string;
  count: number;
}

interface TrackBarChartProps {
  data: ChartItem[];
}

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#ea580c", "#dc2626", "#0891b2"];

export default function TrackBarChart({ data }: TrackBarChartProps) {
  return (
    <div className="w-full min-w-0 h-[320px]">
      <ResponsiveContainer width="100%" height={320} minWidth={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="track"
            tick={{ fontSize: 12, fill: "#4b5563" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#4b5563" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
            formatter={(value) => [`${value}`, "Quantidade"]}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}