"use client";
import { useState, useEffect } from "react";
import SalesSection from "./components/SalesSection";
import StockSection from "./components/StockSection";
import { getAllBaskets } from "../../services/baskets";

export default function DashboardPage() {
  const [baskets, setBaskets] = useState<any[]>([]);
  const fetchBaskets = async () => {
    const data = await getAllBaskets();
    setBaskets(data);
  };
  useEffect(() => { fetchBaskets(); }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 gap-4 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-green-700 text-center w-full">Welcome to the Dashboard</h1>
        <SalesSection baskets={baskets} refreshBaskets={fetchBaskets} />
        <StockSection baskets={baskets} refreshBaskets={fetchBaskets} />
      </div>
    </div>
  );
}
