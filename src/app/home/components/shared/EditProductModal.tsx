"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { useKeyboardAwareModal } from "../../../../hooks/useKeyboardAwareModal";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    basketId: string;
    product: any;
    onProductUpdated: () => void;
}

export default function EditProductModal({ isOpen, onClose, basketId, product, onProductUpdated }: EditProductModalProps) {
    const [productForm, setProductForm] = useState({ 
        name: "", 
        minStock: 0, 
        price: 0, 
        packSize: 1 
    });

    // Detect mobile/tablet
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    
    // Keyboard aware modal
    const { modalStyles } = useKeyboardAwareModal({ 
        isOpen, 
        isMobile 
    });

    useEffect(() => {
        if (product && isOpen) {
            setProductForm({
                name: String(product.name || ""),
                minStock: Number(product.minStock) || 0,
                price: Number(product.price) || 0,
                packSize: Number(product.packSize) || 1
            });
        }
    }, [product, isOpen]);

    const handleCloseModal = () => {
        setProductForm({ name: "", minStock: 0, price: 0, packSize: 1 });
        onClose();
    };

    const [loading, setLoading] = useState(false);

    const handleUpdateProduct = async () => {
        if (!product || !basketId) return;
        setLoading(true);
        try {
            await updateProductInBasket(basketId, product.id, {
                name: String(productForm.name || ""),
                minStock: Number(productForm.minStock) || 0,
                price: Number(productForm.price) || 0,
                packSize: Number(productForm.packSize) || 1
            });
            handleCloseModal();
            
            // Small delay to let modal close animation complete before refreshing
            setTimeout(() => {
                onProductUpdated();
            }, 300);
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            size="md"
            isDismissable={false}
            placement={modalStyles.position}
            scrollBehavior="inside"
            classNames={{
                base: `max-h-[90vh] max-w-[95vw] sm:max-w-md ${modalStyles.className}`,
            }}
            style={modalStyles.styles}
        >
            <ModalContent className="modal-content-wrapper">
                <ModalHeader>Edit Product</ModalHeader>
                <ModalBody className="modal-body-scrollable">
                    <div className="flex flex-col gap-4 pb-4">
                        <Input 
                            label="Product Name" 
                            value={productForm.name || ""} 
                            onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))} 
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input 
                            label="Min Stock" 
                            type="number" 
                            value={String(productForm.minStock || 0)} 
                            onChange={(e) => setProductForm(f => ({ ...f, minStock: Number(e.target.value) || 0 }))} 
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input 
                            label="Price" 
                            type="number" 
                            value={String(productForm.price || 0)} 
                            onChange={(e) => setProductForm(f => ({ ...f, price: Number(e.target.value) || 0 }))} 
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                        <Input 
                            label="Pack Size" 
                            type="number" 
                            value={String(productForm.packSize || 1)} 
                            onChange={(e) => setProductForm(f => ({ ...f, packSize: Number(e.target.value) || 1 }))} 
                            classNames={{
                                inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                            }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onClick={handleCloseModal}>Cancel</Button>
                    <Button color="primary" onClick={handleUpdateProduct} isLoading={loading} disabled={loading}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
