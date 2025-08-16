"use client";
import { useState, useEffect } from "react";
import SalesSection from "./components/sales/SalesSection";
import StockSection from "./components/stock/StockSection";
import { getAllBaskets } from "../../services/baskets";

export default function HomePage() {
    const [baskets, setBaskets] = useState<any[]>([]);

    const fetchBaskets = async () => {
        const data = await getAllBaskets();
        setBaskets(data);
    };

    useEffect(() => { fetchBaskets(); }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 gap-4 w-full max-w-6xl mx-auto pt-20">
                <SalesSection baskets={baskets} refreshBaskets={fetchBaskets} />
                <StockSection baskets={baskets} refreshBaskets={fetchBaskets} />
            </div>
        </div>
    );
}
