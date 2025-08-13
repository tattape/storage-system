"use client";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import SalesSection from "./components/sales/SalesSection";
import StockSection from "./components/stock/StockSection";
import { getAllBaskets } from "../../services/baskets";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
    const [baskets, setBaskets] = useState<any[]>([]);
    const { user, loading, error } = useAuth();

    const fetchBaskets = async () => {
        const data = await getAllBaskets();
        setBaskets(data);
    };

    useEffect(() => { fetchBaskets(); }, []);
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" color="secondary" />
                    <span className="text-white text-xl font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 text-red-100 px-6 py-4 rounded-lg shadow-lg">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl font-medium">Please log in to access the dashboard.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 gap-4 w-full max-w-6xl mx-auto pt-20">
                <SalesSection baskets={baskets} refreshBaskets={fetchBaskets} />
                <StockSection baskets={baskets} refreshBaskets={fetchBaskets} />
            </div>
        </div>
    );
}
