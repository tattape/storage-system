"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Card, Image, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { addSale } from "../../../../services/sales";
import { useKeyboardAwareModal } from "../../../../hooks/useKeyboardAwareModal";

interface SalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    baskets: any[];
    onSaleComplete: () => void;
}

export default function SalesModal({ isOpen, onClose, baskets, onSaleComplete }: SalesModalProps) {
    const [step, setStep] = useState(0);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [orderCount, setOrderCount] = useState(1);
    const [loading, setLoading] = useState(false);

    // Detect mobile/tablet
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    
    // Keyboard aware modal
    const { modalStyles } = useKeyboardAwareModal({ 
        isOpen, 
        isMobile 
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleCloseModal = () => {
        setStep(0);
        setSelectedBasket(null);
        setProductCounts({});
        setSearchTerm("");
        setSearchInput("");
        setCustomerName("");
        setTrackingNumber("");
        setOrderCount(1);
        onClose();
    };

    const products = selectedBasket ? selectedBasket.products || [] : [];
    const nextStep = () => setStep((s) => Math.min(s + 1, 2));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    // ...existing code...

    const handleSaveSale = async () => {
        setLoading(true);
        try {
            if (!selectedBasket) return;
            const basketId = selectedBasket.id;
            const products = selectedBasket.products || [];
            
            // คำนวณราคาและกำไรขณะที่ขาย
            const saleProducts = products
                .filter((p: any) => (productCounts[p.id] || 0) > 0)
                .map((p: any) => ({
                    productId: p.id,
                    productName: p.name,
                    qty: productCounts[p.id] || 0,
                    priceAtSale: p.price || 0, // บันทึกราคาต้นทุนขณะขาย
                }));

            if (saleProducts.length === 0) return;

            if (!customerName.trim() || !trackingNumber.trim()) {
                alert("Please enter customer name and tracking number");
                return;
            }

            // คำนวณต้นทุนรวม
            const totalCost = saleProducts.reduce((sum: number, p: any) => sum + (p.qty * p.priceAtSale), 0);
            
            // ราคาขายตะกร้า
            const basketSellPrice = selectedBasket.sellPrice || 0;
            
            // รายได้หลังหัก 8.56% * จำนวนออเดอร์
            const totalRevenue = basketSellPrice * orderCount * (1 - 0.0856);
            
            // กำไร
            const profit = totalRevenue - totalCost;

            await addSale({
                date: new Date(),
                basketId,
                basketName: selectedBasket.name,
                basketSellPrice,
                orderCount,
                products: saleProducts,
                customerName: customerName.trim(),
                trackingNumber: trackingNumber.trim(),
                totalCost,
                totalRevenue,
                profit,
            } as any);

            // Update stock for each product
            for (const p of saleProducts) {
                const prod = products.find((x: any) => x.id === p.productId);
                const currentStock = prod?.stock !== undefined ? prod.stock : 0;
                await updateProductInBasket(basketId, p.productId, { stock: currentStock - p.qty }, 'sales');
            }

            handleCloseModal();
            
            // Small delay to let modal close animation complete before refreshing
            setTimeout(() => {
                onSaleComplete();
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            size="xl" 
            isDismissable={step === 0} 
            hideCloseButton={false}
            placement={modalStyles.position}
            scrollBehavior="inside"
            classNames={{
                base: `max-h-[90vh] max-w-[95vw] sm:max-w-xl ${modalStyles.className}`,
                wrapper: "overflow-hidden",
                backdrop: "bg-black/50",
            }}
            style={modalStyles.styles}
        >
            <ModalContent className="modal-content-wrapper">
                <ModalHeader className="flex-shrink-0 flex flex-col items-center justify-center text-center px-4 py-3">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Sales Process</h3>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center">
                        {["Select Basket", "Choose Quantity", "Confirm"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <div className={`rounded-full w-16 h-6 sm:w-20 sm:h-8 flex items-center justify-center font-bold text-white transition-all text-xs sm:text-sm ${step === idx ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}>{idx + 1}</div>
                                {idx < 2 && <div className="w-4 sm:w-8 h-1 bg-gray-300 mx-1 sm:mx-2" />}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center mt-1 sm:mt-2">
                        {["Basket", "Quantity", "Confirm"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <span className={`text-xs text-center w-16 sm:w-20 ${step === idx ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                                {idx < 2 && <div className="w-4 sm:w-8 mx-1 sm:mx-2" />}
                            </div>
                        ))}
                    </div>
                </ModalHeader>
                <ModalBody className="modal-body-scrollable px-3 sm:px-6 py-2 sm:py-4 flex-1 min-h-0">
                    {step === 0 && (
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="sticky top-0 bg-white z-10 pb-4">
                                <Input
                                    placeholder="Search baskets..."
                                    label="Search Baskets"
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                        setSearchTerm(e.target.value);
                                    }}
                                    className="w-full"
                                />
                            </div>
                            {/* Scrollable Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {baskets
                                    .filter((b: any) =>
                                        b.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((b: any) => (
                                        <Card key={b.id} isPressable onClick={() => { setSelectedBasket(b); nextStep(); }} className={`transition-all overflow-hidden ${selectedBasket?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                                            <Image
                                                src="https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?_gl=1*i2vpd6*_ga*Mjc4NDk0MTguMTc1NDkyMDgwOA..*_ga_8JE65Q40S6*czE3NTQ5MjA4MDgkbzEkZzEkdDE3NTQ5MjA4MjckajQxJGwwJGgw"
                                                alt={b.name}
                                                className="hidden md:block w-full h-32 object-cover"
                                            />
                                            <div className="p-3 text-center font-semibold">{b.name}</div>
                                        </Card>
                                    ))}
                            </div>
                            {baskets.filter((b: any) => b.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="text-center text-gray-500 py-8">No baskets found</div>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-3">
                            {products.map((p: any) => (
                                <div key={p.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="font-medium text-sm sm:text-base text-center">{p.name}</span>
                                        
                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-3">
                                                <Button 
                                                    size="md" 
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: Math.max((c[p.id] || 0) - 1, 0) }))}
                                                    className="min-w-unit-10 sm:min-w-unit-12 h-10 sm:h-12 text-lg font-bold"
                                                >
                                                    -
                                                </Button>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        label="Quantity"
                                                        value={(productCounts[p.id] || 0).toString()}
                                                        onChange={(e) => setProductCounts(c => ({ ...c, [p.id]: Math.max(Number(e.target.value), 0) }))}
                                                        className="w-16 sm:w-20 text-center flex justify-center"
                                                        size="sm"
                                                        classNames={{
                                                            input: "text-base sm:text-lg font-semibold text-center",
                                                            inputWrapper: "h-10 sm:h-12"
                                                        }}
                                                    />
                                                </div>
                                                <Button 
                                                    size="md" 
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))}
                                                    className="min-w-unit-10 sm:min-w-unit-12 h-10 sm:h-12 text-lg font-bold"
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            
                                            {/* Quick set buttons - below */}
                                            <div className="flex gap-2 justify-center">
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 5 }))}
                                                    className="px-2 sm:px-3 text-xs min-w-unit-8 sm:min-w-unit-12"
                                                >
                                                    5
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 10 }))}
                                                    className="px-2 sm:px-3 text-xs min-w-unit-8 sm:min-w-unit-12"
                                                >
                                                    10
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 15 }))}
                                                    className="px-2 sm:px-3 text-xs min-w-unit-8 sm:min-w-unit-12"
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
                                    </div>
                                ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 h-full">
                            {/* Customer Information Section */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-semibold text-base mb-3 text-center">Customer Information</h4>
                                <div className="space-y-3">
                                    <Input
                                        label="Customer Name"
                                        placeholder="Enter customer name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        isRequired
                                        size="sm"
                                    />
                                    <Input
                                        label="Tracking Number"
                                        placeholder="Enter tracking number"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        isRequired
                                        size="sm"
                                    />
                                    
                                    {/* Number of Orders - Compact */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600 font-medium">Number of Orders</label>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button 
                                                size="sm" 
                                                onPress={() => setOrderCount(Math.max(1, orderCount - 1))}
                                                isDisabled={orderCount <= 1}
                                                className="min-w-unit-8 h-8 text-base font-bold"
                                                color="default"
                                                variant="bordered"
                                            >
                                                -
                                            </Button>
                                            <div className="bg-gray-100 rounded-lg px-3 py-1 min-w-[50px] text-center">
                                                <span className="text-lg font-bold text-gray-800">{orderCount}</span>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onPress={() => setOrderCount(orderCount + 1)}
                                                className="min-w-unit-8 h-8 text-base font-bold"
                                                color="primary"
                                                variant="bordered"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Order Summary Section - Scrollable */}
                            <div className="bg-white border rounded-lg p-4 flex-1 min-h-0">
                                <h4 className="font-semibold text-base mb-3 text-center">Order Summary</h4>
                                <div className="max-h-40 sm:max-h-48 md:max-h-32 overflow-y-auto border rounded-lg p-2">
                                    {products.filter((p: any) => (productCounts[p.id] || 0) > 0).map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded mb-1 last:mb-0">
                                            <span className="font-medium text-xs sm:text-sm truncate flex-1 mr-2">{p.name}</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">{productCounts[p.id] || 0} pcs</span>
                                        </div>
                                    ))}
                                    {/* Total Summary */}
                                    {products.filter((p: any) => (productCounts[p.id] || 0) > 0).length > 0 && (
                                        <div className="flex justify-between items-center py-2 px-2 bg-blue-50 rounded border-t-2 border-blue-200 mt-2 sticky bottom-0">
                                            <span className="font-bold text-blue-800 text-sm">Total:</span>
                                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                                {Object.values(productCounts).reduce((sum, count) => sum + (count || 0), 0)} pcs
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 p-3 sm:p-4">
                    {step > 0 && <Button variant="light" onPress={prevStep} className="w-full sm:w-auto text-base" size="sm">Back</Button>}
                    {step > 0 && step < 2 && <Button color="primary" onPress={nextStep} className="w-full sm:w-auto text-base" size="sm">Next</Button>}
                    {step === 2 && (
                        <Button
                            color="success"
                            onPress={handleSaveSale}
                            className="w-full sm:w-auto text-base"
                            size="sm"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Sale'}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
