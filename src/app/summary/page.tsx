"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react";
import { getAllBaskets } from "../../services/baskets";
import DarkVeil from "../../components/DarkVeil";

interface Product {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    packSize: number;
    price: number;
}

interface Basket {
    id: string;
    name: string;
    products: Product[];
}

interface StockAlert {
    basketId: string;
    basketName: string;
    productId: string;
    productName: string;
    stock: number;
    minStock: number;
    packSize: number;
    alertLevel: 'critical' | 'warning';
}

export default function SummaryPage() {
    const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBaskets();
    }, []);

    const loadBaskets = async () => {
        try {
            const basketsData = await getAllBaskets() as Basket[];
            
            // สร้าง stock alerts
            const alerts: StockAlert[] = [];
            
            basketsData.forEach((basket: Basket) => {
                // หา packSize ที่น้อยที่สุดในตะกร้านี้
                const minPackSizeInBasket = Math.min(...(basket.products?.map(p => Number(p.packSize) || 1) || [1]));
                
                basket.products?.forEach((product: Product) => {
                    const stock = Number(product.stock) !== undefined ? Number(product.stock) : 0;
                    const minStock = Number(product.minStock) || 0;
                    const packSize = Number(product.packSize) || 1;
                    
                    // ตรวจสอบ critical (สีแดง) - stock <= minStock
                    if (stock <= minStock) {
                        alerts.push({
                            basketId: basket.id,
                            basketName: basket.name,
                            productId: product.id,
                            productName: product.name,
                            stock,
                            minStock,
                            packSize,
                            alertLevel: 'critical'
                        });
                    }
                    // ตรวจสอบ warning (สีส้ม) - stock < 2 * minPackSizeInBasket
                    else if (stock < minPackSizeInBasket * 2) {
                        alerts.push({
                            basketId: basket.id,
                            basketName: basket.name,
                            productId: product.id,
                            productName: product.name,
                            stock,
                            minStock,
                            packSize,
                            alertLevel: 'warning'
                        });
                    }
                });
            });
            
            // เรียงลำดับ: critical ก่อน แล้วตาม stock น้อยไปมาก
            alerts.sort((a, b) => {
                if (a.alertLevel === 'critical' && b.alertLevel === 'warning') return -1;
                if (a.alertLevel === 'warning' && b.alertLevel === 'critical') return 1;
                return a.stock - b.stock;
            });
            
            setStockAlerts(alerts);
        } catch (error) {
            console.error('Error loading baskets:', error);
        } finally {
            setLoading(false);
        }
    };

    // จัดกลุ่ม alerts ตาม basket
    const alertsByBasket = stockAlerts.reduce((acc, alert) => {
        if (!acc[alert.basketId]) {
            acc[alert.basketId] = {
                basketName: alert.basketName,
                alerts: []
            };
        }
        acc[alert.basketId].alerts.push(alert);
        return acc;
    }, {} as Record<string, { basketName: string; alerts: StockAlert[] }>);

    // เรียงลำดับ baskets โดยให้ basket ที่มี critical alerts มาก่อน
    const sortedBaskets = Object.entries(alertsByBasket).sort(([, a], [, b]) => {
        const aCriticalCount = a.alerts.filter(alert => alert.alertLevel === 'critical').length;
        const bCriticalCount = b.alerts.filter(alert => alert.alertLevel === 'critical').length;
        
        if (aCriticalCount !== bCriticalCount) {
            return bCriticalCount - aCriticalCount; // มาก -> น้อย
        }
        
        // ถ้า critical เท่ากัน ให้เรียงตาม warning
        const aWarningCount = a.alerts.filter(alert => alert.alertLevel === 'warning').length;
        const bWarningCount = b.alerts.filter(alert => alert.alertLevel === 'warning').length;
        return bWarningCount - aWarningCount;
    });

    const criticalCount = stockAlerts.filter(alert => alert.alertLevel === 'critical').length;
    const warningCount = stockAlerts.filter(alert => alert.alertLevel === 'warning').length;

    if (loading) {
        return (
            <div className="min-h-screen relative">
                <div className="fixed inset-0 z-0">
                    <DarkVeil
                        hueShift={334}
                        speed={1}
                        noiseIntensity={0.02}
                        warpAmount={2.5}
                    />
                </div>
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-gray-400">Loading summary...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 z-0">
                <DarkVeil
                    hueShift={334}
                    speed={1}
                    noiseIntensity={0.02}
                    warpAmount={2.5}
                />
            </div>
            <div className="relative z-10 min-h-screen p-4 pt-20">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-white">Stock Summary</h1>
                    <div className="flex justify-center gap-4">
                        <Chip 
                            color="danger" 
                            variant="shadow"
                            size="lg"
                            className="text-white font-semibold shadow-lg shadow-red-500/50"
                        >
                            Critical: {criticalCount}
                        </Chip>
                        <Chip 
                            color="warning" 
                            variant="shadow"
                            size="lg"
                            className="text-white font-semibold shadow-lg shadow-orange-500/50"
                        >
                            Warning: {warningCount}
                        </Chip>
                    </div>
                </div>

                {/* No Alerts */}
                {stockAlerts.length === 0 && (
                    <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                        <CardBody className="text-center py-12">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-xl font-semibold text-white mb-2">All Stock Levels Look Good!</h2>
                            <p className="text-gray-300">No products are running low on stock.</p>
                        </CardBody>
                    </Card>
                )}

                {/* Alerts by Basket */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBaskets.map(([basketId, { basketName, alerts }]) => {
                        const criticalAlerts = alerts.filter(alert => alert.alertLevel === 'critical');
                        const warningAlerts = alerts.filter(alert => alert.alertLevel === 'warning');
                        
                        return (
                            <Card 
                                key={basketId}
                                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center w-full">
                                        <h3 className="text-lg font-semibold text-white">{basketName}</h3>
                                        <div className="flex gap-2">
                                            {criticalAlerts.length > 0 && (
                                                <Chip color="danger" size="sm" variant="shadow" className="shadow-md shadow-red-500/40">
                                                    {criticalAlerts.length}
                                                </Chip>
                                            )}
                                            {warningAlerts.length > 0 && (
                                                <Chip color="warning" size="sm" variant="shadow" className="shadow-md shadow-orange-500/40">
                                                    {warningAlerts.length}
                                                </Chip>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Divider className="bg-white/20" />
                                <CardBody className="pt-3">
                                    <div className="space-y-3">
                                        {alerts.map((alert) => (
                                            <div 
                                                key={alert.productId}
                                                className={`p-3 rounded-lg border-l-4 ${
                                                    alert.alertLevel === 'critical' 
                                                        ? 'bg-red-900/20 border-red-400' 
                                                        : 'bg-orange-900/20 border-orange-400'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-white text-sm">
                                                            {alert.productName}
                                                        </h4>
                                                        <div className="text-xs text-gray-300 mt-1">
                                                            Min Stock: {alert.minStock} | Pack Size: {alert.packSize}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-lg font-bold ${
                                                            alert.alertLevel === 'critical' 
                                                                ? 'text-red-300' 
                                                                : 'text-orange-300'
                                                        }`}>
                                                            {alert.stock < 0 ? 
                                                                <span className="bg-red-900/50 px-2 py-1 rounded">
                                                                    {alert.stock}
                                                                </span> 
                                                                : alert.stock
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-400">in stock</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        );                                    })}
                </div>
                </div>
            </div>
        </div>
    );
}
