"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { addSale, deleteSale } from "../../../services/sales";
import MobileOptimizedInput from "../../../components/MobileOptimizedInput";

interface EditSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSale: any;
    baskets: any[];
    onSaleUpdated: () => void;
}

export default function EditSalesModal({ isOpen, onClose, selectedSale, baskets, onSaleUpdated }: EditSalesModalProps) {
    const [editProductCounts, setEditProductCounts] = useState<{ [key: string]: number }>({});
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [trackingNumber, setTrackingNumber] = useState<string>("");

    useEffect(() => {
        if (selectedSale && isOpen) {
            const counts: { [key: string]: number } = {};
            (selectedSale.products || []).forEach((p: any) => { 
                counts[p.productId] = p.qty; 
            });
            setEditProductCounts(counts);
            setCustomerName(selectedSale.customerName || "");
            setTrackingNumber(selectedSale.trackingNumber || "");
        }
    }, [selectedSale, isOpen]);

    const handleQuickSet = (productId: string, value: number) => {
        setEditProductCounts(c => ({ ...c, [productId]: value }));
        setFocusedInput(null);
    };

    const handleUpdateSale = async () => {
        if (!selectedSale) return;
        const basket = baskets.find((b: any) => b.id === selectedSale.basketId);
        if (!basket) return;
        
        const oldProducts = selectedSale.products || [];
        const newProducts = (basket.products || [])
            .filter((p: any) => (editProductCounts[p.id] || 0) > 0)
            .map((p: any) => ({
                productId: p.id,
                productName: p.name,
                qty: editProductCounts[p.id] || 0,
            }));

        // สร้าง map สำหรับ lookup qty เดิม
        const oldQtyMap: { [key: string]: number } = {};
        oldProducts.forEach((p: any) => { oldQtyMap[p.productId] = p.qty; });

        // อัปเดต stock ตามส่วนต่าง
        for (const p of basket.products || []) {
            const oldQty = oldQtyMap[p.id] || 0;
            const newQty = editProductCounts[p.id] || 0;
            const diff = newQty - oldQty;
            if (diff !== 0) {
                await updateProductInBasket(basket.id, p.id, { stock: (p.stock || 0) - diff });
            }
        }

        // ลบ sale เดิม
        await deleteSale(selectedSale.id);
        // เพิ่ม sale ใหม่
        await addSale({
            date: selectedSale.date,
            basketId: selectedSale.basketId,
            products: newProducts,
            customerName: customerName,
            trackingNumber: trackingNumber,
        } as any);
        
        setEditProductCounts({});
        onClose();
        onSaleUpdated();
    };

    const handleClose = () => {
        setEditProductCounts({});
        setFocusedInput(null);
        setCustomerName("");
        setTrackingNumber("");
        onClose();
    };

    const basket = baskets.find((b: any) => b.id === selectedSale?.basketId);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>Edit Sale (Basket)</ModalHeader>
                <ModalBody className="max-h-[500px]">
                    {selectedSale && basket && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <div>
                                    <MobileOptimizedInput
                                        label="Customer Name"
                                        placeholder="Enter customer name"
                                        value={customerName}
                                        onChange={setCustomerName}
                                    />
                                </div>
                                <div>
                                    <MobileOptimizedInput
                                        label="Tracking Number"
                                        placeholder="Enter tracking number"
                                        value={trackingNumber}
                                        onChange={setTrackingNumber}
                                    />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm"><strong>Basket:</strong> {basket.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                <h4 className="font-medium text-gray-700 mb-2 sticky top-0 bg-white z-10">Products</h4>
                                <div className="max-h-[180px] overflow-y-auto space-y-2 pr-2">
                                    {(basket.products || []).map((p: any) => (
                                <div key={p.id} className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                    <span className="w-24 text-sm sm:text-base">{p.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            onClick={() => setEditProductCounts(c => ({ 
                                                ...c, 
                                                [p.id]: Math.max((c[p.id] || 0) - 1, 0) 
                                            }))}
                                        >
                                            -
                                        </Button>
                                        <div className="relative">
                                            <MobileOptimizedInput
                                                type="number"
                                                label="Quantity"
                                                value={(editProductCounts[p.id] || 0).toString()}
                                                onChange={(value) => setEditProductCounts(c => ({ 
                                                    ...c, 
                                                    [p.id]: Math.max(Number(value), 0) 
                                                }))}
                                                className="w-16 text-center"
                                                size="sm"
                                            />
                                            {focusedInput === p.id && (
                                                <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white border rounded-lg shadow-lg p-2 z-50">
                                                    <Button size="sm" onPress={() => handleQuickSet(p.id, 10)} className="text-xs px-2 py-1">10</Button>
                                                    <Button size="sm" onPress={() => handleQuickSet(p.id, 20)} className="text-xs px-2 py-1">20</Button>
                                                    <Button size="sm" onPress={() => handleQuickSet(p.id, 30)} className="text-xs px-2 py-1">30</Button>
                                                </div>
                                            )}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            onClick={() => setEditProductCounts(c => ({ 
                                                ...c, 
                                                [p.id]: (c[p.id] || 0) + 1 
                                            }))}
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <span className="text-xs text-gray-400">(In stock: {p.stock})</span>
                                </div>
                            ))}
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onClick={handleClose}>Cancel</Button>
                    <Button color="primary" onClick={handleUpdateSale}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
