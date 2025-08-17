"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { addSale, deleteSale } from "../../../../services/sales";
import { useKeyboardAwareModal } from "../../../../hooks/useKeyboardAwareModal";

interface EditSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSale: any;
    baskets: any[];
    onSaleUpdated: () => void;
}

export default function EditSalesModal({ isOpen, onClose, selectedSale, baskets, onSaleUpdated }: EditSalesModalProps) {
    const [editProductCounts, setEditProductCounts] = useState<{ [key: string]: number }>({});
    const [customerName, setCustomerName] = useState<string>("");
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [orderCount, setOrderCount] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    // Detect mobile/tablet
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    
    // Keyboard aware modal
    const { modalStyles } = useKeyboardAwareModal({ 
        isOpen, 
        isMobile 
    });

    useEffect(() => {
        if (selectedSale && isOpen) {
            const counts: { [key: string]: number } = {};
            (selectedSale.products || []).forEach((p: any) => { 
                counts[p.productId] = p.qty; 
            });
            setEditProductCounts(counts);
            setCustomerName(selectedSale.customerName || "");
            setTrackingNumber(selectedSale.trackingNumber || "");
            setOrderCount(selectedSale.orderCount || 1);
        }
    }, [selectedSale, isOpen]);

    const handleUpdateSale = async () => {
        setLoading(true);
        try {
            if (!selectedSale) return;
            
            const basket = baskets.find((b: any) => b.id === selectedSale.basketId);
            
            // ถ้าหาตะกร้าไม่เจอ ให้แสดง error และไม่ดำเนินการต่อ
            if (!basket) {
                window.alert(`Error: Basket ${selectedSale.basketId} not found. Cannot edit this sale.`);
                return;
            }

            // สร้าง map สำหรับ lookup qty เดิม
            const oldQtyMap: { [key: string]: number } = {};
            (selectedSale.products || []).forEach((p: any) => { oldQtyMap[p.productId] = p.qty; });

            // สร้าง products ใหม่ โดยใช้ priceAtSale จาก sale เดิม
            const newProducts = (basket.products || [])
                .filter((p: any) => (editProductCounts[p.id] || 0) > 0)
                .map((p: any) => {
                    // หาราคาจาก sale เดิม
                    const originalProduct = selectedSale.products?.find((sp: any) => sp.productId === p.id);
                    const priceAtSale = originalProduct?.priceAtSale || p.price || 0;
                    
                    return {
                        productId: p.id,
                        productName: p.name,
                        qty: editProductCounts[p.id] || 0,
                        priceAtSale: priceAtSale, // ใช้ราคาจาก sale เดิม
                    };
                });

            // คำนวณข้อมูลใหม่
            const totalCost = newProducts.reduce((sum: number, p: any) => sum + (p.qty * p.priceAtSale), 0);
            const basketSellPrice = selectedSale.basketSellPrice || basket.sellPrice || 0;
            const totalRevenue = basketSellPrice * orderCount * (1 - 0.0856);
            const profit = totalRevenue - totalCost;

            // อัปเดต stock ตามส่วนต่าง
            for (const p of basket.products || []) {
                const oldQty = oldQtyMap[p.id] || 0;
                const newQty = editProductCounts[p.id] || 0;
                const diff = newQty - oldQty;
                if (diff !== 0) {
                    const currentStock = p.stock !== undefined ? p.stock : 0;
                    await updateProductInBasket(basket.id, p.id, { stock: currentStock - diff }, 'sales');
                }
            }

            // ลบ sale เดิม
            await deleteSale(selectedSale.id);
            // เพิ่ม sale ใหม่
            await addSale({
                date: selectedSale.date,
                basketId: selectedSale.basketId,
                basketName: selectedSale.basketName || basket.name,
                basketSellPrice,
                orderCount,
                products: newProducts,
                customerName: customerName,
                trackingNumber: trackingNumber,
                totalCost,
                totalRevenue,
                profit,
            } as any);

            setEditProductCounts({});
            onClose();
            
            // Small delay to let modal close animation complete before refreshing
            setTimeout(() => {
                onSaleUpdated();
            }, 300);
        } catch (error) {
            console.error('Error updating sale:', error);
            window.alert('Error occurred while updating sale. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEditProductCounts({});
        setCustomerName("");
        setTrackingNumber("");
        setOrderCount(1);
        onClose();
    };

    const basket = baskets.find((b: any) => b.id === selectedSale?.basketId);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            size="lg" 
            scrollBehavior="inside"
            isDismissable={false}
            placement={modalStyles.position}
            classNames={{
                base: `max-h-[90vh] max-w-[95vw] sm:max-w-lg ${modalStyles.className}`,
            }}
            style={modalStyles.styles}
        >
            <ModalContent>
                <ModalHeader>Edit Sale (Basket)</ModalHeader>
                <ModalBody className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                    {selectedSale && basket && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <div>
                                    <Input
                                        label="Customer Name"
                                        placeholder="Enter customer name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Tracking Number"
                                        placeholder="Enter tracking number"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                    />
                                </div>
                                
                                {/* Number of Orders with +/- buttons */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600 font-medium">Number of Orders</label>
                                    <div className="flex items-center justify-center gap-4">
                                        <Button 
                                            size="lg" 
                                            onPress={() => setOrderCount(Math.max(1, orderCount - 1))}
                                            isDisabled={orderCount <= 1}
                                            className="min-w-unit-12 h-12 text-xl font-bold"
                                            color="default"
                                            variant="bordered"
                                        >
                                            -
                                        </Button>
                                        <div className="bg-gray-100 rounded-lg px-6 py-3 min-w-[80px] text-center">
                                            <span className="text-2xl font-bold text-gray-800">{orderCount}</span>
                                        </div>
                                        <Button 
                                            size="lg" 
                                            onPress={() => setOrderCount(orderCount + 1)}
                                            className="min-w-unit-12 h-12 text-xl font-bold"
                                            color="primary"
                                            variant="bordered"
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">How many orders of this basket were sold?</p>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm"><strong>Basket:</strong> {basket.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                <h4 className="font-medium text-gray-700 mb-2 sticky top-0 bg-white z-10">Products</h4>
                                <div className="max-h-[180px] overflow-y-auto space-y-2 pr-2">
                                    {(basket.products || []).map((p: any) => (
                                <div key={p.id} className="flex flex-col items-center gap-3 mb-4 bg-gray-50 rounded-lg p-4">
                                    <span className="font-medium text-sm sm:text-base text-center">{p.name}</span>
                                    
                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            size="md" 
                                            onClick={() => setEditProductCounts(c => ({ 
                                                ...c, 
                                                [p.id]: Math.max((c[p.id] || 0) - 1, 0) 
                                            }))}
                                            className="min-w-unit-12 h-12 text-lg font-bold"
                                        >
                                            -
                                        </Button>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                label="Quantity"
                                                value={(editProductCounts[p.id] || 0).toString()}
                                                onChange={(e) => setEditProductCounts(c => ({ 
                                                    ...c, 
                                                    [p.id]: Math.max(Number(e.target.value), 0) 
                                                }))}
                                                className="w-20 text-center"
                                                size="md"
                                                classNames={{
                                                    input: "text-lg font-semibold text-center",
                                                    inputWrapper: "h-12"
                                                }}
                                            />
                                        </div>
                                        <Button 
                                            size="md" 
                                            onClick={() => setEditProductCounts(c => ({ 
                                                ...c, 
                                                [p.id]: (c[p.id] || 0) + 1 
                                            }))}
                                            className="min-w-unit-12 h-12 text-lg font-bold"
                                        >
                                            +
                                        </Button>
                                    </div>
                                    
                                    {/* Quick set buttons - below */}
                                    <div className="flex gap-2 justify-center">
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 5 }))}
                                            className="px-3 text-xs min-w-unit-12"
                                        >
                                            5
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 10 }))}
                                            className="px-3 text-xs min-w-unit-12"
                                        >
                                            10
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 15 }))}
                                            className="px-3 text-xs min-w-unit-12"
                                        >
                                            15
                                        </Button>
                                    </div>
                                    
                                    <span className="text-xs text-gray-400 text-center">
                                        (In stock: <span className={`${(p.stock || 0) < 0 ? 'text-red-400 font-semibold' : ''}`}>
                                            {p.stock !== undefined ? p.stock : 0}
                                        </span>)
                                    </span>
                                </div>
                            ))}
                                </div>
                                
                                {/* Total Summary */}
                                {Object.values(editProductCounts).some(count => (count || 0) > 0) && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-blue-800">Total Quantity:</span>
                                            <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                                {Object.values(editProductCounts).reduce((sum, count) => sum + (count || 0), 0)} pcs
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onClick={handleClose}>Cancel</Button>
                    <Button color="primary" onClick={handleUpdateSale} isLoading={loading} disabled={loading}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
