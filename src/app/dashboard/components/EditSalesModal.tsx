"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { addSale, deleteSale } from "../../../services/sales";
import { useKeyboardHeight } from "../../../hooks/useKeyboardHeight";

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
    
    const keyboardHeight = useKeyboardHeight();
    const isMobileOrTablet = typeof window !== 'undefined' && 
      (window.innerWidth <= 1024 || /iPad|iPhone|iPod|Android/i.test(navigator.userAgent));

    // Body scroll lock when modal is open on mobile/tablet
    useEffect(() => {
        if (isOpen && isMobileOrTablet) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, isMobileOrTablet]);

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

    // Calculate modal position and style based on keyboard
    const modalPlacement = isMobileOrTablet && keyboardHeight > 0 ? "top" : "center";
    const modalStyle = isMobileOrTablet && keyboardHeight > 0 ? {
        marginTop: '10px',
        marginBottom: `${keyboardHeight + 10}px`
    } : {};

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            size="lg" 
            scrollBehavior="inside"
            placement={modalPlacement}
            style={modalStyle}
            classNames={{
                base: isMobileOrTablet && keyboardHeight > 0 ? "max-h-screen overflow-y-auto" : ""
            }}
        >
            <ModalContent>
                <ModalHeader>Edit Sale (Basket)</ModalHeader>
                <ModalBody className="max-h-[500px]">
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
                                            <Input
                                                type="number"
                                                label="Quantity"
                                                value={(editProductCounts[p.id] || 0).toString()}
                                                onChange={(e) => setEditProductCounts(c => ({ 
                                                    ...c, 
                                                    [p.id]: Math.max(Number(e.target.value), 0) 
                                                }))}
                                                className="w-16 text-center"
                                                size="sm"
                                            />
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
