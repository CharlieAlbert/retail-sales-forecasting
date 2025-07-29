export type MonthlySales = {
  Month: string;
  Sales: number;
};

export type MonthlyForecast = {
  forecast: number;
  method: string;
  last_3_months: Record<string, number>;
  data_source?: "uploaded" | "default";
};

const BASE_URL = "http://localhost:5000";

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response;
};

export async function getSales(): Promise<MonthlySales[]> {
  try {
    const response = await fetch(`${BASE_URL}/sales`);
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    throw error;
  }
}

export async function getForecast(): Promise<MonthlyForecast[]> {
  try {
    const response = await fetch(`${BASE_URL}/forecast`);
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error("Failed to fetch forecast data:", error);
    throw error;
  }
}

export async function checkApiHealth(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${BASE_URL}/`);
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error("API health check failed:", error);
    throw error;
  }
}
