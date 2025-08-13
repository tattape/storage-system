"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Card, Image, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { addSale } from "../../../../services/sales";
import { useKeyboardHeight } from "../../../../hooks/useKeyboardHeight";

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
    const [loading, setLoading] = useState(false);

    const { keyboardHeight, isMobileOrTablet } = useKeyboardHeight();

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
            const saleProducts = products
                .filter((p: any) => (productCounts[p.id] || 0) > 0)
                .map((p: any) => ({
                    productId: p.id,
                    productName: p.name,
                    qty: productCounts[p.id] || 0,
                }));

            if (saleProducts.length === 0) return;

            if (!customerName.trim() || !trackingNumber.trim()) {
                alert("Please enter customer name and tracking number");
                return;
            }

            await addSale({
                date: new Date(),
                basketId,
                products: saleProducts,
                customerName: customerName.trim(),
                trackingNumber: trackingNumber.trim(),
            } as any);

            // Update stock for each product
            for (const p of saleProducts) {
                const prod = products.find((x: any) => x.id === p.productId);
                const currentStock = prod?.stock !== undefined ? prod.stock : 0;
                await updateProductInBasket(basketId, p.productId, { stock: currentStock - p.qty }, 'sales');
            }

            handleCloseModal();
            onSaleComplete();
        } finally {
            setLoading(false);
        }
    };

    // Calculate modal position and style based on keyboard
    const isKeyboardOpen = keyboardHeight > 0;
    const modalPlacement = isMobileOrTablet && isKeyboardOpen ? "top" : "center";
    
    // Calculate available space for modal
    const availableHeight = typeof window !== 'undefined' 
      ? (isKeyboardOpen ? window.innerHeight - keyboardHeight - 20 : window.innerHeight - 40)
      : 'auto';
    
    const modalClassName = isMobileOrTablet && isKeyboardOpen 
      ? "modal-keyboard-avoid modal-scrollable" 
      : (isMobileOrTablet ? "modal-scrollable" : "");

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            size="xl" 
            isDismissable={step === 0} 
            hideCloseButton={false}
            placement={modalPlacement}
            classNames={{
                base: modalClassName,
                wrapper: isMobileOrTablet ? "overflow-hidden" : "",
            }}
            style={isMobileOrTablet && isKeyboardOpen ? {
                maxHeight: `${availableHeight}px`,
                marginTop: '10px',
            } : {}}
        >
            <ModalContent className="modal-content-wrapper">
                <ModalHeader className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold mb-4">Sales Process</h3>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center">
                        {["Select Basket", "Choose Quantity", "Confirm"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <div className={`rounded-full w-20 h-8 flex items-center justify-center font-bold text-white transition-all ${step === idx ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}>{idx + 1}</div>
                                {idx < 2 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                        {["Basket", "Quantity", "Confirm"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <span className={`text-xs text-center w-20 ${step === idx ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                                {idx < 2 && <div className="w-8 mx-2" />}
                            </div>
                        ))}
                    </div>
                </ModalHeader>
                <ModalBody className={`modal-body-scrollable px-6 py-4 ${step === 0 ? 'flex flex-col' : ''}`}>
                    {step === 0 && (
                        <>
                            {/* Search Input - Fixed at top */}
                            <div className="mb-4 flex-shrink-0">
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
                            {/* Scrollable Grid Area */}
                            <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 content-start auto-rows-fr">
                                    {baskets
                                        .filter((b: any) =>
                                            b.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((b: any) => (
                                            <Card key={b.id} isPressable onClick={() => { setSelectedBasket(b); nextStep(); }} className={`transition-all overflow-hidden h-full flex flex-col ${selectedBasket?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                                                <Image
                                                    src="https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?_gl=1*i2vpd6*_ga*Mjc4NDk0MTguMTc1NDkyMDgwOA..*_ga_8JE65Q40S6*czE3NTQ5MjA4MDgkbzEkZzEkdDE3NTQ5MjA4MjckajQxJGwwJGgw"
                                                    alt={b.name}
                                                    className="hidden md:block w-full flex-1 min-h-[120px] object-cover rounded-b-none"
                                                />
                                                <div className="flex items-center justify-center text-center font-semibold text-xl md:text-lg lg:text-sm p-3 h-full">{b.name}</div>
                                            </Card>
                                        ))}
                                </div>
                                {baskets.filter((b: any) => b.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                    <div className="text-center text-gray-500 py-4">No baskets found</div>
                                )}
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <div className="w-full">
                            <div className="w-full space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {products.map((p: any) => (
                                    <div key={p.id} className="bg-gray-50 rounded-lg p-4 relative">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="font-medium text-sm sm:text-base text-center">{p.name}</span>
                                            
                                            {/* Quantity controls */}
                                            <div className="flex items-center gap-3">
                                                <Button 
                                                    size="md" 
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: Math.max((c[p.id] || 0) - 1, 0) }))}
                                                    className="min-w-unit-12 h-12 text-lg font-bold"
                                                >
                                                    -
                                                </Button>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        label="Quantity"
                                                        value={(productCounts[p.id] || 0).toString()}
                                                        onChange={(e) => setProductCounts(c => ({ ...c, [p.id]: Math.max(Number(e.target.value), 0) }))}
                                                        className="w-20 text-center flex justify-center"
                                                        size="md"
                                                        classNames={{
                                                            input: "text-lg font-semibold text-center",
                                                            inputWrapper: "h-12"
                                                        }}
                                                    />
                                                </div>
                                                <Button 
                                                    size="md" 
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))}
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
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 5 }))}
                                                    className="px-3 text-xs min-w-unit-12"
                                                >
                                                    5
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 10 }))}
                                                    className="px-3 text-xs min-w-unit-12"
                                                >
                                                    10
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="bordered"
                                                    onPress={() => setProductCounts(c => ({ ...c, [p.id]: 15 }))}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="w-full">
                            <div className="mb-4 font-semibold text-lg text-center">Customer Information</div>
                            <div className="w-full max-w-md mx-auto space-y-4 mb-6">
                                <Input
                                    label="Customer Name"
                                    placeholder="Enter customer name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    isRequired
                                />
                                <Input
                                    label="Tracking Number"
                                    placeholder="Enter tracking number"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    isRequired
                                />
                            </div>
                            <div className="mb-4 font-semibold text-lg text-center">Order Summary</div>
                            <div className="w-full max-w-md mx-auto space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {products.filter((p: any) => (productCounts[p.id] || 0) > 0).map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{productCounts[p.id] || 0} pcs</span>
                                    </div>
                                ))}
                                {/* Total Summary */}
                                {products.filter((p: any) => (productCounts[p.id] || 0) > 0).length > 0 && (
                                    <div className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg border-t-2 border-blue-200 mt-4">
                                        <span className="font-bold text-blue-800">Total Quantity:</span>
                                        <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                            {Object.values(productCounts).reduce((sum, count) => sum + (count || 0), 0)} pcs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {step > 0 && <Button variant="light" onPress={prevStep} className="w-full sm:w-auto text-xl md:text-base">Back</Button>}
                    {step > 0 && step < 2 && <Button color="primary" onPress={nextStep} className="w-full sm:w-auto text-xl md:text-base">Next</Button>}
                    {step === 2 && (
                        <Button
                            color="success"
                            onPress={handleSaveSale}
                            className="w-full sm:w-auto text-xl md:text-base"
                            isLoading={loading}
                            disabled={loading}
                        >
                            Save
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
