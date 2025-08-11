"use client";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter } from "@heroui/react";
import { addProductToBasket } from "../../../services/baskets";
import MobileOptimizedInput from "../../../components/MobileOptimizedInput";

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
            
            // Trigger refresh first
            onProductAdded();
            
            // Close modal after a short delay to ensure refresh completes
            setTimeout(() => {
                handleClose();
            }, 100);
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalContent>
                <ModalHeader>Add New Product</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <MobileOptimizedInput
                            label="Product Name"
                            placeholder="Enter product name"
                            value={productName}
                            onChange={setProductName}
                            isRequired
                        />
                        <MobileOptimizedInput
                            label="Price"
                            placeholder="Enter price"
                            type="number"
                            value={price}
                            onChange={setPrice}
                            isRequired
                        />
                        <MobileOptimizedInput
                            label="Stock"
                            placeholder="Enter stock quantity"
                            type="number"
                            value={stock}
                            onChange={setStock}
                            isRequired
                        />
                        <MobileOptimizedInput
                            label="Minimum Stock"
                            placeholder="Enter minimum stock level"
                            type="number"
                            value={minStock}
                            onChange={setMinStock}
                            isRequired
                        />
                        <MobileOptimizedInput
                            label="Pack Size"
                            placeholder="Enter pieces per pack"
                            type="number"
                            value={packSize}
                            onChange={setPackSize}
                            isRequired
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
