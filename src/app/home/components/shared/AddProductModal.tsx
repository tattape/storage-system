"use client";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { addProductToBasket } from "../../../../services/baskets";
import { useKeyboardAwareModal } from "../../../../hooks/useKeyboardAwareModal";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    basketId: string;
    onProductAdded: () => void;
}

export default function AddProductModal({ isOpen, onClose, basketId, onProductAdded }: AddProductModalProps) {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [minStock, setMinStock] = useState("");
    const [packSize, setPackSize] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Keyboard aware modal
    const { modalStyles } = useKeyboardAwareModal({ 
        isOpen
    });

    const handleClose = () => {
        setProductName("");
        setPrice("");
        setStock("");
        setMinStock("");
        setPackSize("");
        onClose();
    };

    const handleSubmit = async () => {
        if (!productName.trim() || !price || !stock || !minStock || !packSize) {
            alert("Please fill all fields");
            return;
        }

        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock);
        const minStockNum = parseInt(minStock);
        const packSizeNum = parseInt(packSize);

        if (isNaN(priceNum) || isNaN(stockNum) || isNaN(minStockNum) || isNaN(packSizeNum)) {
            alert("Please enter valid numbers");
            return;
        }

        if (packSizeNum <= 0) {
            alert("Pack size must be greater than 0");
            return;
        }

        setIsLoading(true);
        try {
            await addProductToBasket(basketId, {
                name: productName.trim(),
                price: priceNum,
                stock: stockNum,
                minStock: minStockNum,
                packSize: packSizeNum
            });
            
            // Close modal first
            handleClose();
            
            // Small delay to let modal close animation complete before refreshing
            setTimeout(() => {
                onProductAdded();
            }, 300);
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            size="md"
            isDismissable={false}
            placement={modalStyles.position}
            scrollBehavior="inside"
            style={modalStyles.styles}
            classNames={{
                base: `max-h-[90vh] max-w-[95vw] sm:max-w-md ${modalStyles.className}`,
            }}
        >
            <ModalContent className="modal-content-wrapper">
                <ModalHeader>Add New Product</ModalHeader>
                <ModalBody className="modal-body-scrollable">
                    <div className="flex flex-col gap-4 pb-4">
                        <Input
                            label="Product Name"
                            placeholder="Enter product name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input
                            label="Price"
                            placeholder="Enter price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input
                            label="Stock"
                            placeholder="Enter stock quantity"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input
                            label="Minimum Stock"
                            placeholder="Enter minimum stock level"
                            type="number"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input
                            label="Pack Size"
                            placeholder="Enter pieces per pack"
                            type="number"
                            value={packSize}
                            onChange={(e) => setPackSize(e.target.value)}
                            isRequired
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSubmit} 
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Add Product
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
