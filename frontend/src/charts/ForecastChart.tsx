import React from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";

// Mock interfaces for the enhanced forecast data
interface ForecastComponents {
  linear_regression: number;
  moving_avg_3: number;
  moving_avg_6: number;
  weighted_avg: number;
}

interface TrendAnalysis {
  slope: number;
  direction: string;
  r_squared: number;
}

interface ConfidenceMetrics {
  level: string;
  volatility: number;
}

interface EnhancedMonthlyForecast {
  data_source: string;
  forecast: number;
  forecast_period: string;
  last_3_months: Record<string, number>;
  method: string;
  forecast_components?: ForecastComponents;
  trend_analysis?: TrendAnalysis;
  confidence_metrics?: ConfidenceMetrics;
}

interface ForecastChartProps {
  data?: EnhancedMonthlyForecast;
  loading?: boolean;
}

const formatDate = (dateStr: string): string => {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const transformForecastData = (forecastData: EnhancedMonthlyForecast) => {
  if (!forecastData) return [];

  const historicalData = forecastData.last_3_months || {};
  const historicalMonths = Object.keys(historicalData).sort();

  // Create historical data series
  const historicalSeries = historicalMonths.map((month) => ({
    x: month,
    y: historicalData[month],
  }));

  // Get next month for forecast
  const lastMonth = historicalMonths[historicalMonths.length - 1];
  const nextMonth = getNextMonth(lastMonth);

  // Create forecast series (includes last historical point for smooth connection)
  const lastHistoricalPoint = {
    x: lastMonth,
    y: historicalData[lastMonth],
  };

  const forecastSeries = [
    lastHistoricalPoint,
    {
      x: nextMonth,
      y: forecastData.forecast,
    },
  ];

  // Add individual forecast method series if available
  const series = [
    {
      id: "Historical Sales",
      color: "#3B82F6",
      data: historicalSeries,
    },
    {
      id: "Ensemble Forecast",
      color: "#8B5CF6",
      data: forecastSeries,
    },
  ];

  // Add regression line if trend analysis is available
  if (forecastData.trend_analysis) {
    const { slope } = forecastData.trend_analysis;
    const regressionSeries = historicalMonths.map((month, index) => {
      const baseValue = historicalData[historicalMonths[0]];
      return {
        x: month,
        y: baseValue + slope * index,
      };
    });
    // Add next month regression point
    regressionSeries.push({
      x: nextMonth,
      y: regressionSeries[regressionSeries.length - 1].y + slope,
    });

    series.push({
      id: "Regression Trend",
      color: "#F59E0B",
      data: regressionSeries,
    });
  }

  return series;
};

const getNextMonth = (lastMonth: string): string => {
  const [year, month] = lastMonth.split("-");
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const getConfidenceColor = (level: string) => {
  switch (level) {
    case "high":
      return "text-green-600 bg-green-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
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
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Sales Forecast</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Predicted sales performance using regression and moving averages
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading forecast data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Sales Forecast</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Predicted sales performance using regression and moving averages
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">No forecast data available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Sales Forecast</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Ensemble prediction using regression and moving averages
            </p>
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

        {/* Method and confidence badges */}
        <div className="flex gap-2 mt-3">
          {data.method && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <BarChart3 className="h-3 w-3 mr-1" />
              {data.method}
            </div>
          )}
          {data.confidence_metrics && (
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                data.confidence_metrics.level
              )}`}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {data.confidence_metrics.level} confidence
            </div>
          )}
          {data.trend_analysis && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              {data.trend_analysis.direction} trend
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={(value) => `$${Number(value).toLocaleString()}`}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Month",
              legendOffset: 46,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Sales ($)",
              legendOffset: -50,
              legendPosition: "middle",
              format: (value) => `$${(Number(value) / 1000).toFixed(0)}k`,
            }}
            pointSize={8}
            pointColor={{ from: "serieColor" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            enableGridX={true}
            enableGridY={true}
            colors={["#3B82F6", "#8B5CF6", "#F59E0B"]}
            lineWidth={3}
            enableArea={false}
            tooltip={({ point }) => (
              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg forecast-tooltip">
                <div className="font-medium text-gray-900 mb-2">
                  Period: {formatDate(point.data.x as string)}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: point.serieColor }}
                  />
                  <span className="text-sm">
                    {point.seriesId}: ${Number(point.data.y).toLocaleString()}
                  </span>
                </div>
                {point.seriesId === "Ensemble Forecast" && data.method && (
                  <div className="text-xs text-gray-600 mt-1">
                    Method: {data.method}
                  </div>
                )}
              </div>
            )}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 12,
                    fill: "#6B7280",
                  },
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: "#374151",
                    fontWeight: 500,
                  },
                },
              },
              grid: {
                line: {
                  stroke: "#E5E7EB",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                },
              },
            }}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            layers={[
              "grid",
              "markers",
              "axes",
              "areas",
              ({ series, lineGenerator, xScale, yScale }) => {
                return series.map((serie) => {
                  const lineData = serie.data.map((d) => ({
                    x: xScale(d.data.x),
                    y: yScale(d.data.y),
                  }));

                  let strokeDasharray = "none";
                  if (serie.id === "Ensemble Forecast") {
                    strokeDasharray = "8 4";
                  } else if (serie.id === "Regression Trend") {
                    strokeDasharray = "4 2";
                  }

                  return (
                    <path
                      key={serie.id}
                      d={lineGenerator(lineData) || ""}
                      fill="none"
                      stroke={serie.color}
                      strokeWidth={serie.id === "Regression Trend" ? 2 : 3}
                      strokeDasharray={strokeDasharray}
                    />
                  );
                });
              },
              "points",
              "slices",
              "mesh",
              "legends",
            ]}
          />
        </div>

        {/* Enhanced forecast summary */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Forecast Summary</h4>
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

          {/* Forecast Components */}
          {data.forecast_components && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">
                Forecast Components
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Linear Regression:</span>
                  <div className="font-semibold">
                    $
                    {data.forecast_components.linear_regression.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">3-Month MA:</span>
                  <div className="font-semibold">
                    ${data.forecast_components.moving_avg_3.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">6-Month MA:</span>
                  <div className="font-semibold">
                    ${data.forecast_components.moving_avg_6.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Weighted MA:</span>
                  <div className="font-semibold">
                    ${data.forecast_components.weighted_avg.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trend Analysis */}
          {data.trend_analysis && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Trend Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Trend Direction:</span>
                  <div className="font-semibold capitalize">
                    {data.trend_analysis.direction}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Change:</span>
                  <div className="font-semibold">
                    ${data.trend_analysis.slope.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">R-squared:</span>
                  <div className="font-semibold">
                    {(data.trend_analysis.r_squared * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;
