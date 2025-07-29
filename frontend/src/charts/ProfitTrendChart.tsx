import type React from "react";
import { ResponsiveLine } from "@nivo/line";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Transform data for Nivo
  const nivoData = [
    {
      id: "profit",
      color: "#10b981",
      data: data.map((item) => ({
        x: item.Month,
        y: item.Profit,
      })),
    },
  ];

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
          <ResponsiveLine
            data={nivoData}
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={(value) => formatCurrency(Number(value))}
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
              legend: "Profit ($)",
              legendOffset: -50,
              legendPosition: "middle",
              format: (value) => formatCurrency(Number(value)),
            }}
            pointSize={6}
            pointColor="#10b981"
            pointBorderWidth={2}
            pointBorderColor="#10b981"
            pointLabelYOffset={-12}
            useMesh={true}
            enableGridX={true}
            enableGridY={true}
            colors={["#10b981"]}
            lineWidth={3}
            enableArea={false}
            // Add zero reference line using markers
            markers={[
              {
                axis: "y",
                value: 0,
                lineStyle: {
                  stroke: "#dc2626",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                },
                legend: "Break Even",
                legendOrientation: "horizontal",
                legendPosition: "top-right",
              },
            ]}
            tooltip={({ point }) => {
              return (
                <div
                  style={{
                    background: "white",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "300",
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    {formatDate(point.data.x as string)}
                  </div>
                  <div
                    style={{
                      color: Number(point.data.y) >= 0 ? "#10b981" : "#dc2626",
                      fontWeight: "500",
                    }}
                  >
                    Profit: {formatCurrency(Number(point.data.y))}
                  </div>
                  {Number(point.data.y) < 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#dc2626",
                        marginTop: "4px",
                      }}
                    >
                      Loss Period
                    </div>
                  )}
                </div>
              );
            }}
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
                  stroke: "#f0f0f0",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                },
              },
            }}
            // Custom layer to color points based on positive/negative values
            layers={[
              "grid",
              "markers",
              "axes",
              "areas",
              "crosshair",
              "lines",
              ({ series, xScale, yScale }) => {
                return series.map((serie) =>
                  serie.data.map((point, index) => {
                    const isNegative = Number(point.data.y) < 0;
                    return (
                      <circle
                        key={`${serie.id}-${index}`}
                        cx={xScale(point.data.x)}
                        cy={yScale(point.data.y)}
                        r={6}
                        fill={isNegative ? "#dc2626" : "#10b981"}
                        stroke={isNegative ? "#dc2626" : "#10b981"}
                        strokeWidth={2}
                      />
                    );
                  })
                );
              },
              "slices",
              "mesh",
              "legends",
            ]}
          />
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
