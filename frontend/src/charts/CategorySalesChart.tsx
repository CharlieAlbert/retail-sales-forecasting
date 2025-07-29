import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { Package, TrendingUp } from "lucide-react";

interface CategorySalesData {
  Category: string;
  Sales: number;
}

interface CategorySalesChartProps {
  data: CategorySalesData[];
  loading: boolean;
}

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({
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

  const topCategory = data.length > 0 ? data[0] : null;
  const totalSales = data.reduce((sum, item) => sum + item.Sales, 0);

  // Transform data for nivo pie chart
  const pieData = data.map((item, index) => ({
    id: item.Category,
    label: item.Category,
    value: item.Sales,
    color: `hsl(${(index * 360) / data.length}, 70%, 50%)`,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sales by Category
          </CardTitle>
          <CardDescription>Loading category sales data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <Package className="h-5 w-5" />
            Sales by Category
          </CardTitle>
          <CardDescription>No category data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No category sales data to display</p>
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
          <Package className="h-5 w-5" />
          Sales by Category
        </CardTitle>
        <CardDescription>
          Revenue breakdown by product category
          {topCategory && (
            <span className="block mt-1 text-sm">
              Top performer: <strong>{topCategory.Category}</strong> (
              {formatCurrency(topCategory.Sales)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </p>
          </div>
        </div>
        <div className="h-80">
          <ResponsivePie
            data={pieData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            valueFormat={(value) => formatCurrency(value)}
            tooltip={({ datum }) => (
              <div
                style={{
                  background: "white",
                  padding: "9px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <strong>{datum.label}</strong>
                <br />
                Sales: {formatCurrency(datum.value)}
                <br />
                {((datum.value / totalSales) * 100).toFixed(1)}% of total
              </div>
            )}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        </div>
        {(() => {
          const top3Sales = data
            .slice(0, 3)
            .reduce((sum, item) => sum + item.Sales, 0);
          const percentageTop3 = (top3Sales / totalSales) * 100;

          // Check how evenly sales are distributed
          const average = totalSales / data.length;
          const variance =
            data.reduce(
              (sum, item) => sum + Math.pow(item.Sales - average, 2),
              0
            ) / data.length;
          const stdDev = Math.sqrt(variance);

          const isEven = stdDev / average < 0.15; // less than 15% deviation = even

          if (isEven) {
            return (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Sales are evenly distributed across the {data.length}{" "}
                    categories, indicating a balanced product portfolio.
                  </span>
                </div>
              </div>
            );
          } else {
            return (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Top 3 categories contribute {percentageTop3.toFixed(1)}% of
                    total sales, showing concentration in a few product lines.
                  </span>
                </div>
              </div>
            );
          }
        })()}
      </CardContent>
    </Card>
  );
};

export default CategorySalesChart;
