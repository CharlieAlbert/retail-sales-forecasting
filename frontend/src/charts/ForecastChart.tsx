import type React from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MonthlyForecast {
  data_source: string;
  forecast: number;
  forecast_period: string;
  last_3_months: Record<string, number>;
  method: string;
}

interface ForecastChartProps {
  data?: MonthlyForecast;
  loading?: boolean;
}

const transformForecastData = (forecastData: MonthlyForecast) => {
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

  return [
    {
      id: "Historical Sales",
      color: "#3B82F6",
      data: historicalSeries,
    },
    {
      id: "Forecast",
      color: "#8B5CF6",
      data: forecastSeries,
    },
  ];
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
            colors={["#3B82F6", "#8B5CF6"]}
            lineWidth={3}
            enableArea={false}
            tooltip={({ point }) => (
              <div
                style={{
                  background: "white",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    color: "#111827",
                    marginBottom: "8px",
                  }}
                >
                  Period: {formatDate(point.data.x as string)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: point.seriesColor,
                    }}
                  />
                  <span style={{ fontSize: "14px" }}>
                    {point.seriesId === "Historical Sales"
                      ? "Actual"
                      : "Forecast"}
                    : ${Number(point.data.y).toLocaleString()}
                  </span>
                </div>
                {point.seriesId === "Forecast" && data.method && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
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
            // Custom line styles for different series
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

                  return (
                    <path
                      key={serie.id}
                      d={lineGenerator(lineData) || ""}
                      fill="none"
                      stroke={serie.color}
                      strokeWidth={3}
                      strokeDasharray={serie.id === "Forecast" ? "8 4" : "none"}
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

export default ForecastChart;
