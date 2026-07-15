"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayCount {
  date: string;
  count: number;
}

interface Props {
  data: DayCount[];
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-") as [string, string, string];
  return `${parseInt(m)}/${parseInt(d)}`;
}

export function OverviewChart({ data }: Props) {
  const isEmpty = data.every((d) => d.count === 0);

  if (isEmpty) {
    return (
      <div className="flex h-48 items-center justify-center rounded-card border border-dashed border-zinc-800 bg-zinc-900/10 text-zinc-500">
        <p className="text-sm font-semibold">No events in the last 14 days</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="errorFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #27272a",
            backgroundColor: "#18181b",
            color: "#f4f4f5",
            fontSize: "12px",
          }}
          formatter={(value: number) => [value.toLocaleString(), "Events"]}
          labelFormatter={(label: string) => `Date: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#a5b4fc"
          strokeWidth={2}
          fill="url(#errorFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          isAnimationActive={true}
          animationDuration={400}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
