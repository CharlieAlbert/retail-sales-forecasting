import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategorySalesChart from "@/charts/CategorySalesChart";
import ProfitTrendChart from "@/charts/ProfitTrendChart";
import { useDashboard } from "@/contexts/dashboard-context";

const InsightsPage: React.FC = () => {
  const {
    salesData,
    forecastData,
    categorySalesData,
    profitTrendData,
    loading,
    dataSource,
  } = useDashboard();

  const latestMonth = salesData[salesData.length - 1];
  const totalSales = salesData.reduce((sum, item) => sum + item.Sales, 0);
  const forecastGrowth = forecastData
    ? ((forecastData.forecast -
        Object.values(forecastData.last_3_months).reduce(
          (sum, val) => sum + val,
          0
        ) /
          3) /
        (Object.values(forecastData.last_3_months).reduce(
          (sum, val) => sum + val,
          0
        ) /
          3)) *
      100
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Insights
        </h1>
        <p className="text-gray-600 mt-1">
          Detailed analysis and performance breakdowns
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <CategorySalesChart data={categorySalesData} loading={loading} />
        <ProfitTrendChart data={profitTrendData} loading={loading} />
      </div>

      {/* Detailed Insights */}
      {!loading && salesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Analysis</CardTitle>
              <CardDescription>
                Key insights from your sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Total Data Points</span>
                  <span className="text-sm text-gray-600">
                    {salesData.length} months
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Latest Month</span>
                  <span className="text-sm text-gray-600">
                    {latestMonth?.Month} (${latestMonth?.Sales.toLocaleString()}
                    )
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">
                    Average Monthly Sales
                  </span>
                  <span className="text-sm text-gray-600">
                    ${(totalSales / salesData.length).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Data Source</span>
                  <span className="text-sm text-gray-600">
                    {dataSource === "uploaded"
                      ? "Uploaded file"
                      : "Default dataset"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Analysis</CardTitle>
              <CardDescription>Predictive insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {forecastData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">
                      Forecasting Method
                    </span>
                    <span className="text-sm text-gray-600">
                      {forecastData.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Based on</span>
                    <span className="text-sm text-gray-600">
                      Last 3 months of data
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Predicted Trend</span>
                    <span
                      className={`text-sm font-medium ${
                        forecastGrowth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {forecastGrowth >= 0 ? "Growing" : "Declining"} (
                      {forecastGrowth.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">
                      Next Month Prediction
                    </span>
                    <span className="text-sm text-gray-600">
                      ${forecastData.forecast.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No forecast data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;
