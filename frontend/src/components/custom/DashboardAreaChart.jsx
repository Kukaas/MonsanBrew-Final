import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const DAYS_31 = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

function getWeekTicks(data) {
  // Return all week labels in order from the data
  return data && data.length > 0 ? data.map(item => item.week) : [];
}

export default function DashboardAreaChart({
  data = [],
  config = {},
  title = "Area Chart",
  description = "",
  dateKey = "date",
  areaKeys = [],
}) {
  // Generate gradients for each area
  const gradients = areaKeys.map((key) => (
    <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
      <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
    </linearGradient>
  ));

  // X axis formatter: show short month if dateKey is 'month', day number if 'day', week label if 'week', else show date
  const xAxisTickFormatter = (value) => {
    if (dateKey === 'month') {
      const idx = MONTHS.indexOf(value);
      return idx !== -1 ? MONTHS_SHORT[idx] : value;
    }
    if (dateKey === 'day') return value;
    if (dateKey === 'week') return value;
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Tooltip formatter: show short month if dateKey is 'month', day number if 'day', week label if 'week', else show date
  const tooltipLabelFormatter = (value) => {
    if (dateKey === 'month') {
      const idx = MONTHS.indexOf(value);
      return idx !== -1 ? MONTHS_SHORT[idx] : value;
    }
    if (dateKey === 'day') return `Day ${value}`;
    if (dateKey === 'week') return value;
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // For month view, force all months to show as ticks
  // For day view, force all days (1-31) to show as ticks
  // For week view, force all week labels to show as ticks
  const xAxisProps = dateKey === 'month'
    ? { interval: 0, ticks: MONTHS, dataKey: 'month' }
    : dateKey === 'day'
      ? { interval: 0, ticks: DAYS_31, dataKey: 'day' }
      : dateKey === 'week'
        ? { interval: 0, ticks: getWeekTicks(data), dataKey: 'week' }
        : { dataKey: dateKey };

  return (
    <Card className="pt-0 bg-[#232323] border-[#292929] text-white">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-[#292929] py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-white">{title}</CardTitle>
          {description && <CardDescription className="text-[#BDBDBD]">{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={config} className="aspect-auto h-[400px] w-full">
          <AreaChart data={data}>
            <defs>{gradients}</defs>
            <CartesianGrid vertical={false} stroke="#333" />
            <XAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="#BDBDBD"
              tick={{ fill: '#BDBDBD' }}
              tickFormatter={xAxisTickFormatter}
              {...xAxisProps}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={tooltipLabelFormatter}
                  indicator="dot"
                  className="bg-[#232323] border border-[#444] text-white" style={{ color: '#fff' }}
                />
              }
            />
            {areaKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={`url(#fill${key})`}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
