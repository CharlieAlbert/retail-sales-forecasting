import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

  const formatTooltip = (value: number, name: string) => {
    if (name === "Sales") {
      return [formatCurrency(value), "Sales"];
    }
    return [value, name];
  };

  const topCategory = data.length > 0 ? data[0] : null;
  const totalSales = data.reduce((sum, item) => sum + item.Sales, 0);

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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="Category"
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={formatTooltip}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                dataKey="Sales"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {data.length > 5 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>
                Showing top {data.length} categories. Top 3 represent{" "}
                {(
                  (data.slice(0, 3).reduce((sum, item) => sum + item.Sales, 0) /
                    totalSales) *
                  100
                ).toFixed(1)}
                % of total sales.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategorySalesChart;
