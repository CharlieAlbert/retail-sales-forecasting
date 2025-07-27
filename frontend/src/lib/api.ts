export type MonthlySales = {
  Month: string;
  Sales: number;
};

export type MonthlyForecast = {
  forecast: number;
  method: string;
  last_3_months: Record<string, number>;
};

const BASE_URL = "http://localhost:5000";

export async function getSales(): Promise<MonthlySales[]> {
  const res = await fetch(`${BASE_URL}/sales`);
  return res.json();
}

export async function getForecast(): Promise<MonthlyForecast[]> {
  const res = await fetch(`${BASE_URL}/forecast`);
  return res.json();
}
