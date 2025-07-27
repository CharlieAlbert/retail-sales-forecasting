import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { getSales, MonthlySales } from "@/lib/api";

export function SalesChart() {
    const [data, setData] = useState<MonthlySales>([])

    useEffect(() => {
        getSales().then(setData)
    }, [])
}