"use client";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Card, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { useKeyboardAwareModal } from "../../../../hooks/useKeyboardAwareModal";

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    basketId: string;
    product: any;
    onStockUpdated: () => void;
}

export default function StockModal({ isOpen, onClose, basketId, product, onStockUpdated }: StockModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [action, setAction] = useState<'add' | 'remove' | null>(null);
    const [quantity, setQuantity] = useState(0);

    // Keyboard aware modal
    const { modalStyles } = useKeyboardAwareModal({ 
        isOpen
    });

    const handleCloseModal = () => {
        setStep(0);
        setAction(null);
        setQuantity(0);
        onClose();
    };

    const handleActionSelect = (selectedAction: 'add' | 'remove') => {
        setAction(selectedAction);
        setStep(1);
    };

    const handleSaveStock = async () => {
        if (!product || !action || quantity <= 0) return;
        setLoading(true);
        try {
            const currentStock = Number(product.stock) || 0;
            let newStock = currentStock;

            if (action === 'add') {
                newStock = currentStock + quantity;
            } else if (action === 'remove') {
                newStock = currentStock - quantity; // Allow negative stock
            }

            await updateProductInBasket(basketId, product.id, { stock: newStock }, 'stock_modal');
            handleCloseModal();
            
            // Small delay to let modal close animation complete before refreshing
            setTimeout(() => {
                onStockUpdated();
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => setStep(0);

    // Simplified modal configuration - no keyboard adjustments
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            size="md" 
            isDismissable={step === 0}
            placement={modalStyles.position}
            scrollBehavior="inside"
            style={{
                ...modalStyles.styles,
                maxHeight: 'maxHeight' in modalStyles.styles ? modalStyles.styles.maxHeight : undefined
            }}
            classNames={{
                base: `h-auto ${'maxHeight' in modalStyles.styles ? '' : 'max-h-[95vh]'} max-w-[95vw] sm:max-w-md ${modalStyles.className}`, // h-auto ให้สูงตามเนื้อหา แต่ไม่เกิน 95vh หรือตาม maxHeight จาก hook
            }}
        >
            <ModalContent className="modal-content-wrapper">
                <ModalHeader className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold mb-4">Stock Management</h3>
                    {product && (
                        <div className="text-sm text-gray-600">
                            Product: <span className="font-medium">{product.name}</span> | 
                            Current Stock: <span className={`font-medium ${(product.stock || 0) < 0 ? 'text-red-600' : ''}`}>
                                {product.stock !== undefined ? product.stock : 0}
                            </span>
                        </div>
                    )}
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mt-4">
                        {["Select Action", "Enter Quantity"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <div className={`rounded-full w-20 h-8 flex items-center justify-center font-bold text-white transition-all ${step === idx ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}>{idx + 1}</div>
                                {idx < 1 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                        {["Action", "Quantity"].map((label, idx) => (
                            <div key={label} className="flex items-center">
                                <span className={`text-xs text-center w-20 ${step === idx ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                                {idx < 1 && <div className="w-8 mx-2" />}
                            </div>
                        ))}
                    </div>
                </ModalHeader>
                <ModalBody className="modal-body-scrollable px-6 py-4">
                    {step === 0 && (
                        <div className="space-y-4">
                            <h4 className="text-center font-medium text-lg mb-6">Choose Action</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card 
                                    isPressable 
                                    onClick={() => handleActionSelect('add')}
                                    className="p-6 border-2 border-transparent hover:border-green-500 transition-all min-h-[120px] flex items-center justify-center"
                                >
                                    <div className="text-center flex flex-col items-center justify-center">
                                        <div className="text-4xl mb-3">➕</div>
                                        <div className="font-semibold text-green-600 text-lg mb-1">Add Stock</div>
                                        <div className="text-sm text-gray-500">Increase inventory</div>
                                    </div>
                                </Card>
                                <Card 
                                    isPressable 
                                    onClick={() => handleActionSelect('remove')}
                                    className="p-6 border-2 border-transparent hover:border-red-500 transition-all min-h-[120px] flex items-center justify-center"
                                >
                                    <div className="text-center flex flex-col items-center justify-center">
                                        <div className="text-4xl mb-3">➖</div>
                                        <div className="font-semibold text-red-600 text-lg mb-1">Remove Stock</div>
                                        <div className="text-sm text-gray-500">Decrease inventory</div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h4 className="font-medium text-lg mb-2">
                                    {action === 'add' ? 'Add Stock' : 'Remove Stock'}
                                </h4>
                                <div className="text-sm text-gray-600 mb-4">
                                    Current Stock: <span className={`font-medium ${(product?.stock || 0) < 0 ? 'text-red-600' : ''}`}>
                                        {product?.stock !== undefined ? product?.stock : 0}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-3">
                                    {/* Quick set buttons */}
                                    <div className="flex justify-center gap-2 mb-2">
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onPress={() => setQuantity(10)}
                                            className="px-3"
                                        >
                                            10
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onPress={() => setQuantity(20)}
                                            className="px-3"
                                        >
                                            20
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="bordered"
                                            onPress={() => setQuantity(30)}
                                            className="px-3"
                                        >
                                            30
                                        </Button>
                                    </div>
                                    
                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            size="md" 
                                            onPress={() => setQuantity(Math.max(0, quantity - 1))}
                                            isDisabled={quantity <= 0}
                                            className="min-w-unit-12 h-12 text-lg font-bold"
                                        >
                                            -
                                        </Button>
                                        <Input
                                            type="number"
                                            label="Quantity"
                                            value={quantity.toString()}
                                            onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                                            className="w-20 text-center"
                                            placeholder="0"
                                            size="md"
                                            classNames={{
                                                input: "text-lg font-semibold text-center",
                                                inputWrapper: "h-12"
                                            }}
                                        />
                                        <Button 
                                            size="md" 
                                            onPress={() => setQuantity(quantity + 1)}
                                            className="min-w-unit-12 h-12 text-lg font-bold"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {action && quantity > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-sm text-gray-600">Preview:</div>
                                    <div className="font-medium">
                                        {product?.stock || 0} {action === 'add' ? '+' : '-'} {quantity} = {' '}
                                        <span className={action === 'add' ? 'text-green-600' : 'text-red-600'}>
                                            {action === 'add' 
                                                ? (Number(product?.stock) || 0) + quantity
                                                : (Number(product?.stock) || 0) - quantity
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {step === 0 && (
                        <Button 
                            variant="light" 
                            onPress={handleCloseModal} 
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                    )}
                    {step > 0 && (
                        <Button 
                            variant="light" 
                            onPress={prevStep} 
                            className="w-full sm:w-auto"
                            isDisabled={loading}
                        >
                            Back
                        </Button>
                    )}
                    {step === 1 && (
                        <Button 
                            color={action === 'add' ? 'success' : 'danger'} 
                            onPress={handleSaveStock}
                            isDisabled={quantity <= 0 || loading}
                            isLoading={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading 
                                ? 'Processing...' 
                                : action === 'add' ? 'Add Stock' : 'Remove Stock'
                            }
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
