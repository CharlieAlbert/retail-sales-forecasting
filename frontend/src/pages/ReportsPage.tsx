/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";

const ReportsPage: React.FC = () => {
  const {
    salesData,
    forecastData,
    categorySalesData,
    profitTrendData,
    loading,
    dataSource,
  } = useDashboard();

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => row[header]).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, item) => sum + item.Sales, 0);
  const avgSales = salesData.length > 0 ? totalSales / salesData.length : 0;
  const maxSales =
    salesData.length > 0 ? Math.max(...salesData.map((item) => item.Sales)) : 0;
  const minSales =
    salesData.length > 0 ? Math.min(...salesData.map((item) => item.Sales)) : 0;

  const totalProfit = profitTrendData.reduce(
    (sum, item) => sum + item.Profit,
    0
  );
  const profitableMonths = profitTrendData.filter(
    (item) => item.Profit > 0
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive data analysis and export options
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportToCSV(salesData, "sales-data")}
            disabled={salesData.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button
            onClick={() => exportToCSV(profitTrendData, "profit-data")}
            disabled={profitTrendData.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Profits
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.length}</div>
            <p className="text-xs text-muted-foreground">Months of data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${maxSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Highest month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitableMonths}/{profitTrendData.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitTrendData.length > 0
                ? ((profitableMonths / profitTrendData.length) * 100).toFixed(1)
                : 0}
              % success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sales Summary Report
            </CardTitle>
            <CardDescription>
              Comprehensive sales performance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalSales.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data Source</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {dataSource}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Highest Month</p>
                  <p className="text-sm text-gray-600">
                    ${maxSales.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Lowest Month</p>
                  <p className="text-sm text-gray-600">
                    ${minSales.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit Analysis Report
            </CardTitle>
            <CardDescription>Profitability trends and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Profit</p>
                  <p
                    className={`text-2xl font-bold ${
                      totalProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${totalProfit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Monthly Profit</p>
                  <p className="text-sm text-gray-600">
                    $
                    {profitTrendData.length > 0
                      ? (totalProfit / profitTrendData.length).toLocaleString()
                      : "0"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Profitable Months</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {profitableMonths}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Loss Months</p>
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {profitTrendData.length - profitableMonths}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      {salesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Data</CardTitle>
            <CardDescription>
              Latest 10 months of sales performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Sales</th>
                    <th className="text-right py-2">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.slice(-10).map((item, index, arr) => {
                    const prevItem = arr[index - 1];
                    const growth = prevItem
                      ? ((item.Sales - prevItem.Sales) / prevItem.Sales) * 100
                      : 0;
                    return (
                      <tr key={item.Month} className="border-b">
                        <td className="py-2">{item.Month}</td>
                        <td className="text-right py-2">
                          ${item.Sales.toLocaleString()}
                        </td>
                        <td
                          className={`text-right py-2 ${
                            growth >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {index > 0
                            ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
