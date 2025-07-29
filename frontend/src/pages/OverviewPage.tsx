"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";
import SalesChart from "@/charts/SalesChart";
import ForecastChart from "@/charts/ForecastChart";
import { useDashboard } from "@/contexts/dashboard-context";

const OverviewPage: React.FC = () => {
  const {
    salesData,
    forecastData,
    loading,
    error,
    lastUpdated,
    dataSource,
    fetchData,
  } = useDashboard();

  // Calculate key metrics
  const totalSales = salesData.reduce((sum, item) => sum + item.Sales, 0);
  const latestMonth = salesData[salesData.length - 1];
  const previousMonth = salesData[salesData.length - 2];
  const monthlyGrowth = previousMonth
    ? ((latestMonth?.Sales - previousMonth.Sales) / previousMonth.Sales) * 100
    : 0;

  const forecastValue = forecastData?.forecast || 0;
  const historicalAverage = forecastData
    ? Object.values(forecastData.last_3_months).reduce(
        (sum, val) => sum + val,
        0
      ) / 3
    : 0;
  const forecastGrowth =
    historicalAverage > 0
      ? ((forecastValue - historicalAverage) / historicalAverage) * 100
      : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Key metrics and performance indicators
          </p>
          {dataSource === "uploaded" && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Using uploaded data
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            onClick={fetchData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="ml-3 bg-transparent"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No Data Alert */}
      {!loading && salesData.length === 0 && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>No data available.</strong> Please upload a CSV or Excel
            file to get started with your sales analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      {salesData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all recorded periods
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {monthlyGrowth >= 0 ? "+" : ""}
                {monthlyGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Month Forecast
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${forecastValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                3-month moving average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Forecast Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  forecastGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {forecastGrowth >= 0 ? "+" : ""}
                {forecastGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs 3-month average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Charts */}
      {salesData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SalesChart data={salesData} loading={loading} variant="area" />
          <ForecastChart data={forecastData ?? undefined} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
