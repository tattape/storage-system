"use client";
import { useState, useEffect, useCallback } from "react";
import SalesTable from "./SalesTable";
import { DateRangePicker } from "@heroui/react";
import { parseDate, DateValue } from "@internationalized/date";
import { getSalesByDateRange } from "../../../../services/sales";


export default function SalesSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    const [sales, setSales] = useState<any[]>([]);
    const today = parseDate(new Date().toISOString().slice(0, 10));
    const [dateRange, setDateRange] = useState<{ start: DateValue; end: DateValue }>({ start: today, end: today });

    const calendarDateToJSDate = useCallback((value: DateValue | null | undefined, isEnd: boolean = false) => {
        if (!value) return new Date();
        const d = new Date(value.year, value.month - 1, value.day);
        if (isEnd) {
            d.setHours(23, 59, 59, 999);
        } else {
            d.setHours(0, 0, 0, 0);
        }
        return d;
    }, []);

    const fetchSales = useCallback(async () => {
        const jsStartDate = calendarDateToJSDate(dateRange.start, false);
        const jsEndDate = calendarDateToJSDate(dateRange.end, true);
        const data = await getSalesByDateRange(jsStartDate, jsEndDate);
        setSales(data);
    }, [dateRange.start, dateRange.end, calendarDateToJSDate]);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    const handleSaleComplete = () => {
        fetchSales();
        refreshBaskets();
    };

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sales History</h2>
                <div className="flex gap-2 items-center">
                    <DateRangePicker
                        label="Date Range"
                        value={dateRange}
                        onChange={val => {
                            setDateRange({
                                start: val?.start ?? today,
                                end: val?.end ?? today
                            });
                        }}
                        classNames={{
                            inputWrapper: 'bg-white/50 backdrop-blur-md border border-white/20 px-2 py-1 text-gray-900 hover:bg-white/60'
                        }}
                    />
                    <button
                        type="button"
                        className="px-3 py-1 rounded bg-secondary-500 text-white font-semibold hover:bg-secondary-600 transition"
                        onClick={() => setDateRange({ start: today, end: today })}
                    >
                        Today
                    </button>
                </div>
            </div>
            <SalesTable
                sales={sales}
                baskets={baskets}
                onSaleComplete={handleSaleComplete}
            />
        </div>
    );
}
