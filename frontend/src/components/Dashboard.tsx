import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";
import SalesChart from "./SalesChart";
import ForecastChart from "./ForecastChart";
import {
  getSales,
  getForecast,
  checkApiHealth,
  MonthlySales,
  MonthlyForecast,
} from "@/lib/api";

interface DashboardState {
  salesData: MonthlySales[];
  forecastData: MonthlyForecast | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const Dashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    salesData: [],
    forecastData: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Check API health first
      await checkApiHealth();

      // Fetch both sales and forecast data
      const [salesResponse, forecastResponse] = await Promise.all([
        getSales(),
        getForecast(),
      ]);

      setState((prev) => ({
        ...prev,
        salesData: salesResponse,
        forecastData: Array.isArray(forecastResponse)
          ? forecastResponse[0]
          : forecastResponse,
        loading: false,
        lastUpdated: new Date(),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate key metrics
  const totalSales = state.salesData.reduce((sum, item) => sum + item.Sales, 0);
  const latestMonth = state.salesData[state.salesData.length - 1];
  const previousMonth = state.salesData[state.salesData.length - 2];
  const monthlyGrowth = previousMonth
    ? ((latestMonth?.Sales - previousMonth.Sales) / previousMonth.Sales) * 100
    : 0;

  const forecastValue = state.forecastData?.forecast || 0;
  const historicalAverage = state.forecastData
    ? Object.values(state.forecastData.last_3_months).reduce(
        (sum, val) => sum + val,
        0
      ) / 3
    : 0;
  const forecastGrowth =
    historicalAverage > 0
      ? ((forecastValue - historicalAverage) / historicalAverage) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sales Forecasting Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time sales analytics and predictive insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {state.lastUpdated && (
                <p className="text-sm text-gray-500">
                  Last updated: {state.lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <Button
                onClick={fetchData}
                disabled={state.loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    state.loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {state.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {state.error}
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                className="ml-3"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SalesChart
            data={state.salesData}
            loading={state.loading}
            variant="area"
          />
          <ForecastChart
            data={state.forecastData ?? undefined}
            loading={state.loading}
          />
        </div>

        {/* Data Insights */}
        {!state.loading && state.salesData.length > 0 && state.forecastData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Automated analysis based on sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Sales Performance</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • Total data points: {state.salesData.length} months
                    </li>
                    <li>
                      • Latest month: {latestMonth?.Month} ($
                      {latestMonth?.Sales.toLocaleString()})
                    </li>
                    <li>
                      • Average monthly sales: $
                      {(totalSales / state.salesData.length).toLocaleString()}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Forecast Analysis</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Method: {state.forecastData.method}</li>
                    <li>• Based on last 3 months of data</li>
                    <li>
                      • Predicted trend:{" "}
                      {forecastGrowth >= 0 ? "Growing" : "Declining"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
