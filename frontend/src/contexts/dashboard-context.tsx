"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getSales,
  getForecast,
  checkApiHealth,
  getCategorySales,
  getProfitTrend,
  type MonthlySales,
  type MonthlyForecast,
  type CategorySalesData,
  type ProfitTrendData,
} from "@/lib/api";

interface DashboardState {
  salesData: MonthlySales[];
  forecastData: MonthlyForecast | null;
  categorySalesData: CategorySalesData[];
  profitTrendData: ProfitTrendData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  dataSource: "default" | "uploaded";
}

interface DashboardContextType extends DashboardState {
  fetchData: () => Promise<void>;
  handleDataConfigured: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<DashboardState>({
    salesData: [],
    forecastData: null,
    categorySalesData: [],
    profitTrendData: [],
    loading: true,
    error: null,
    lastUpdated: null,
    dataSource: "default",
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await checkApiHealth();

      const [
        salesResponse,
        forecastResponse,
        categorySalesResponse,
        profitTrendResponse,
      ] = await Promise.allSettled([
        getSales(),
        getForecast(),
        getCategorySales(),
        getProfitTrend(),
      ]);

      const salesData =
        salesResponse.status === "fulfilled" ? salesResponse.value : [];
      const forecastData =
        forecastResponse.status === "fulfilled"
          ? Array.isArray(forecastResponse.value)
            ? forecastResponse.value[0]
            : forecastResponse.value
          : null;
      const categorySalesData =
        categorySalesResponse.status === "fulfilled"
          ? categorySalesResponse.value
          : [];
      const profitTrendData =
        profitTrendResponse.status === "fulfilled"
          ? profitTrendResponse.value
          : [];

      const errors = [
        salesResponse,
        forecastResponse,
        categorySalesResponse,
        profitTrendResponse,
      ]
        .filter((response) => response.status === "rejected")
        .map((response) => (response as PromiseRejectedResult).reason.message);

      if (errors.length > 0 && salesData.length === 0) {
        throw new Error(errors[0]);
      }

      const dataSource =
        forecastData?.data_source === "uploaded" ? "uploaded" : "default";

      setState((prev) => ({
        ...prev,
        salesData,
        forecastData,
        categorySalesData,
        profitTrendData,
        loading: false,
        lastUpdated: new Date(),
        error:
          errors.length > 0
            ? `Some data unavailable: ${errors.join(", ")}`
            : null,
        dataSource,
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

  const handleDataConfigured = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value: DashboardContextType = {
    ...state,
    fetchData,
    handleDataConfigured,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
