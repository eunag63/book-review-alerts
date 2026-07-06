"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: {
    hour: string;
    clicks: number;
  }[];
}

export default function AnalyticsChart({ data }: Props) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />

          <XAxis dataKey="hour" tick={{ fill: "#a1a1aa", fontSize: 12 }} />

          <YAxis
            allowDecimals={false}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#80FD8F"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
