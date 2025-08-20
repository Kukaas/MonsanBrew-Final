import PropTypes from "prop-types";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Reusable DashboardBarChart component matching the reference design, now with dark mode
export default function DashboardBarChart({
  data = [],
  config = {},
  title = "Bar Chart",
  description = "January - June 2024",
  barKey = "desktop",
  dateKey = "month",
  footer = null,
  xAxisTickFormatter,
}) {
  // X axis formatter: show month if dateKey is 'month', else show date
  const xTickFormatter = xAxisTickFormatter || ((value) => {
    if (dateKey === 'month') return value;
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  // Tooltip formatter: show month if dateKey is 'month', else show date
  const tooltipLabelFormatter = (value) => {
    if (dateKey === 'month') return value;
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-[#232323] border-[#292929] text-white">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-[#BDBDBD]">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} stroke="#333" />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="#BDBDBD"
              tick={{ fill: '#BDBDBD' }}
              tickFormatter={xTickFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#BDBDBD"
              tick={{ fill: '#BDBDBD' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-[#232323] border border-[#444] text-white" labelFormatter={tooltipLabelFormatter} />}
            />
            <Bar dataKey={barKey} fill={config[barKey]?.color} radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer !== undefined ? (
        <CardFooter>{footer}</CardFooter>
      ) : (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

DashboardBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  config: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  barKey: PropTypes.string,
  dateKey: PropTypes.string,
  footer: PropTypes.node,
  xAxisTickFormatter: PropTypes.func,
};
