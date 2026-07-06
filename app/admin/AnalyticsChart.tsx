"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartRow {
  hour: string;
  [key: string]: string | number;
}

interface Props {
  data: ChartRow[];
  books: {
    id: number;
    title: string;
  }[];
}

const COLORS = [
  "#80FD8F",
  "#60A5FA",
  "#F472B6",
  "#FBBF24",
  "#A78BFA",
  "#FB7185",
  "#34D399",
  "#22D3EE",
  "#F97316",
  "#818CF8",
];

export default function AnalyticsChart({ data, books }: Props) {
  const [hidden, setHidden] = useState<Record<number, boolean>>({});

  const colors = useMemo(() => {
    const map: Record<number, string> = {};

    books.forEach((book, index) => {
      map[book.id] = COLORS[index % COLORS.length];
    });

    return map;
  }, [books]);

  const toggle = (id: number) => {
    setHidden((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-5">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />

            <XAxis
              dataKey="hour"
              tick={{
                fill: "#a1a1aa",
                fontSize: 12,
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#a1a1aa",
                fontSize: 12,
              }}
            />

            <Tooltip />

            <Legend />

            {books.map((book) => (
              <Line
                key={book.id}
                type="monotone"
                dataKey={String(book.id)}
                name={book.title}
                stroke={colors[book.id]}
                strokeWidth={3}
                dot={false}
                hide={hidden[book.id]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => toggle(book.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
              hidden[book.id]
                ? "border-zinc-700 text-zinc-500"
                : "border-zinc-600 text-white"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: colors[book.id],
              }}
            />
            {book.title}
          </button>
        ))}
      </div>
    </div>
  );
}
