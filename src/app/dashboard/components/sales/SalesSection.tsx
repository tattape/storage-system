"use client";
import { useState, useEffect } from "react";
import { getAllSales } from "../../../../services/sales";
import SalesTable from "./SalesTable";

export default function SalesSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    const [sales, setSales] = useState<any[]>([]);

    useEffect(() => { fetchSales(); }, []);

    const fetchSales = async () => {
        const data = await getAllSales();
        setSales(data);
    };

    const handleSaleComplete = () => {
        fetchSales();
        refreshBaskets();
    };

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-100">Sales History</h2>
            </div>

            <SalesTable
                sales={sales}
                baskets={baskets}
                onSaleComplete={handleSaleComplete}
            />
        </div>
    );
}
