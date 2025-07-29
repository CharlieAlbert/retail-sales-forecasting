import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface ProfitTrendData {
  Month: string;
  Profit: number;
}

interface ProfitTrendChartProps {
  data: ProfitTrendData[];
  loading: boolean;
}

const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  data,
  loading,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === "Profit") {
      return [formatCurrency(value), "Profit"];
    }
    return [value, name];
  };

  // Calculate metrics
  const totalProfit = data.reduce((sum, item) => sum + item.Profit, 0);
  const averageProfit = data.length > 0 ? totalProfit / data.length : 0;

  // Calculate trend (comparing first half to second half)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);

  const firstHalfAvg =
    firstHalf.length > 0
      ? firstHalf.reduce((sum, item) => sum + item.Profit, 0) / firstHalf.length
      : 0;
  const secondHalfAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, item) => sum + item.Profit, 0) /
        secondHalf.length
      : 0;

  const trendPercentage =
    firstHalfAvg !== 0
      ? ((secondHalfAvg - firstHalfAvg) / Math.abs(firstHalfAvg)) * 100
      : 0;
  const isPositiveTrend = trendPercentage > 0;

  // Find months with negative profit
  const negativeMonths = data.filter((item) => item.Profit < 0).length;
  const profitableMonths = data.length - negativeMonths;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profit Trend
          </CardTitle>
          <CardDescription>Loading profit trend data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profit Trend
          </CardTitle>
          <CardDescription>No profit data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No profit trend data to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Profit Trend
        </CardTitle>
        <CardDescription>
          Monthly profit performance over time
          <span className="block mt-1 text-sm">
            {isPositiveTrend ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Trending up {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Trending down {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Profit</p>
            <p
              className={`text-2xl font-bold ${
                totalProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalProfit)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Average Monthly</p>
            <p
              className={`text-2xl font-bold ${
                averageProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(averageProfit)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Profitable Months</p>
            <p className="text-2xl font-bold text-gray-900">
              {profitableMonths}/{data.length}
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="Month"
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={formatTooltip}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              {/* Zero line reference */}
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="Profit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {negativeMonths > 0 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>
                  {negativeMonths} month{negativeMonths > 1 ? "s" : ""} with
                  losses detected
                </span>
              </div>
            </div>
          )}

          {profitableMonths === data.length && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>All months profitable! Great performance.</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitTrendChart;
