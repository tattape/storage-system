"use client";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import SalesSection from "./components/SalesSection";
import StockSection from "./components/StockSection";
import { getAllBaskets } from "../../services/baskets";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const [baskets, setBaskets] = useState<any[]>([]);
  const { user, userRole, loading, error, isOwner, isEditor, role } = useAuth();

  const fetchBaskets = async () => {
    const data = await getAllBaskets();
    setBaskets(data);
  };

  useEffect(() => { fetchBaskets(); }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="secondary" />
          <span className="text-purple-700 text-xl">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
        <div className="text-purple-700 text-xl">Please log in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 gap-4 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-purple-700 text-center w-full">Welcome to the Dashboard</h1>

        <SalesSection baskets={baskets} refreshBaskets={fetchBaskets} />
        <StockSection baskets={baskets} refreshBaskets={fetchBaskets} />
      </div>
    </div>
  );
}
