import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar } from "lucide-react";
import { MonthlyForecast } from "@/lib/api";

interface ForecastChartProps {
  data?: MonthlyForecast;
  loading?: boolean;
}

const transformForecastData = (forecastData: MonthlyForecast) => {
  if (!forecastData) return [];

  const historicalData = forecastData.last_3_months || {};
  const historicalMonths = Object.keys(historicalData).sort();

  const chartData = [];

  historicalMonths.forEach((month) => {
    chartData.push({
      month: month,
      actualSales: historicalData[month],
      type: "Historical",
    });
  });

  const lastMonth = historicalMonths[historicalMonths.length - 1];
  const nextMonth = getNextMonth(lastMonth);

  chartData.push({
    month: nextMonth,
    forecastSales: forecastData.forecast,
    method: forecastData.method,
    type: "Forecast",
  });

  return chartData;
};

const getNextMonth = (lastMonth: string): string => {
  const [year, month] = lastMonth.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
        <p className="font-medium text-gray-900 mb-2">{`Period: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {entry.dataKey === "actualSales" &&
                `Actual: $${entry.value?.toLocaleString()}`}
              {entry.dataKey === "forecastSales" &&
                `Forecast: $${entry.value?.toLocaleString()}`}
            </span>
          </div>
        ))}
        {payload[0]?.payload?.method && (
          <p className="text-xs text-gray-500 mt-1">
            Method: {payload[0].payload.method}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  loading = false,
}) => {
  const chartData = data ? transformForecastData(data) : [];

  const lastThreeValues = data ? Object.values(data.last_3_months) : [];
  const averageHistorical =
    lastThreeValues.length > 0
      ? lastThreeValues.reduce((sum, val) => sum + val, 0) /
        lastThreeValues.length
      : 0;
  const forecastValue = data?.forecast || 0;
  const growthFromAverage =
    averageHistorical > 0
      ? ((forecastValue - averageHistorical) / averageHistorical) * 100
      : 0;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Forecast
          </CardTitle>
          <CardDescription>Predicted sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading forecast data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Forecast
          </CardTitle>
          <CardDescription>Predicted sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">No forecast data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Sales Forecast
            </CardTitle>
            <CardDescription>
              Historical data vs predicted performance
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${forecastValue.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-sm ${
                growthFromAverage >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {growthFromAverage >= 0 ? "+" : ""}
              {growthFromAverage.toFixed(1)}% vs avg
            </div>
          </div>
        </div>

        {/* Method badge */}
        {data.method && (
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {data.method}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                className="text-sm text-gray-600"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-sm text-gray-600"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Historical sales as bars */}
              <Bar
                dataKey="actualSales"
                name="Historical Sales"
                fill="#3B82F6"
                fillOpacity={0.6}
                radius={[4, 4, 0, 0]}
              />

              {/* Forecast sales as line */}
              <Line
                type="monotone"
                dataKey="forecastSales"
                name="Forecast"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#8B5CF6", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Next Month Forecast:</span>
              <div className="font-semibold text-purple-600">
                ${forecastValue.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">3-Month Average:</span>
              <div className="font-semibold">
                ${averageHistorical.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Method:</span>
              <div className="font-semibold">{data.method}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart