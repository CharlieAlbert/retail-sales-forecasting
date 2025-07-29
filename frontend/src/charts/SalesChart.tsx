import type React from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface MonthlySales {
  Month: string;
  Sales: number;
}

interface SalesChartProps {
  data?: MonthlySales[];
  loading?: boolean;
  variant?: "line" | "area";
}

const SalesChart: React.FC<SalesChartProps> = ({
  data = [],
  loading = false,
  variant = "line",
}) => {
  const totalSales = data.reduce((sum, item) => sum + item.Sales, 0);
  const latestMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growth = previousMonth
    ? ((latestMonth?.Sales - previousMonth.Sales) / previousMonth.Sales) * 100
    : 0;

  // Transform data for Nivo
  const nivoData = [
    {
      id: "sales",
      color: "#3B82F6",
      data: data.map((item) => ({
        x: item.Month,
        y: item.Sales,
      })),
    },
  ];

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
          <ResponsiveLine
            data={nivoData}
            margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
            xScale={{
              type: "time",
              format: "%Y-%m",
              useUTC: false,
              precision: "month",
            }}
            xFormat="time:%Y-%m"
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={(value) => `$${Number(value).toLocaleString()}`}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              format: "%b %Y",
              tickValues: "every 2 months",
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
            pointSize={6}
            pointColor="#3B82F6"
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            enableArea={variant === "area"}
            areaOpacity={0.15}
            useMesh={true}
            enableGridX={true}
            enableGridY={true}
            gridXValues="every 1 month"
            curve="monotoneX"
            lineWidth={3}
            colors={["#3B82F6"]}
            tooltip={({ point }) => (
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
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
                <div style={{ color: "#3B82F6", fontWeight: "500" }}>
                  Sales: ${Number(point.data.y).toLocaleString()}
                </div>
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
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
