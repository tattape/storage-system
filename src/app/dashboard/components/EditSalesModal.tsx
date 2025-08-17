"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { addSale, deleteSale } from "../../../services/sales";

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
        setCustomerName("");
        setTrackingNumber("");
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
            placement="center"
            classNames={{
                base: "max-h-[90vh] max-w-[95vw] sm:max-w-lg",
            }}
        >
            <ModalContent>
                <ModalHeader>Edit Sale (Basket)</ModalHeader>
                <ModalBody className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                    {selectedSale && basket && (
                        <>
                            {/* Customer Information - Fixed at top */}
                            <div className="flex-shrink-0">
                                <div className="space-y-3 mb-4">
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
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm"><strong>Basket:</strong> {basket.name}</p>
                                    </div>
                                </div>
                                <h4 className="font-medium text-gray-700 mb-2">Products</h4>
                            </div>
                            
                            {/* Scrollable Products Area */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-2 pr-2">
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
                                                    onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 10 }))}
                                                    className="px-3 text-xs min-w-unit-12"
                                                >
                                                    10
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 20 }))}
                                                    className="px-3 text-xs min-w-unit-12"
                                                >
                                                    20
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: 30 }))}
                                                    className="px-3 text-xs min-w-unit-12"
                                                >
                                                    30
                                                </Button>
                                            </div>
                                            
                                            <span className="text-xs text-gray-400 text-center">(In stock: {p.stock})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
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
