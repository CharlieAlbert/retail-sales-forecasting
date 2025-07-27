import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import { MonthlySales, MonthlyForecast } from "@/lib/api";

interface SalesChartProps {
  data?: MonthlySales[];
  loading?: boolean;
  variant?: "line" | "area";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`Month: ${label}`}</p>
        <p className="text-blue-600">
          {`Sales: $${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart: React.FC<SalesChartProps> = ({
  data = [],
  loading = false,
  variant = "area",
}) => {
  const totalSales = data.reduce((sum, item) => sum + item.Sales, 0);
  const latestMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growth = previousMonth
    ? ((latestMonth?.Sales - previousMonth.Sales) / previousMonth.Sales) * 100
    : 0;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sales Performance
          </CardTitle>
          <CardDescription>Monthly sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading sales data...</div>
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
              <DollarSign className="h-5 w-5 text-green-600" />
              Sales Performance
            </CardTitle>
            <CardDescription>
              Monthly sales trends and performance
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${totalSales.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-sm ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}% vs prev month
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {variant === "area" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="Month"
                  className="text-sm text-gray-600"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-sm text-gray-600"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="Month"
                  className="text-sm text-gray-600"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-sm text-gray-600"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
