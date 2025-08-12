"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { useKeyboardHeight } from "../../../hooks/useKeyboardHeight";

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

    const keyboardHeight = useKeyboardHeight();
    const isMobileOrTablet = typeof window !== 'undefined' && 
      (window.innerWidth <= 1024 || /iPad|iPhone|iPod|Android/i.test(navigator.userAgent));

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

    const handleCloseModal = () => {
        setProductForm({ name: "", minStock: 0, price: 0, packSize: 1 });
        onClose();
    };

    const handleUpdateProduct = async () => {
        if (!product || !basketId) return;

        try {
            await updateProductInBasket(basketId, product.id, {
                name: String(productForm.name || ""),
                minStock: Number(productForm.minStock) || 0,
                price: Number(productForm.price) || 0,
                packSize: Number(productForm.packSize) || 1
            });
            handleCloseModal();
            onProductUpdated();
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. Please try again.");
        }
    };

    // Calculate modal position and style based on keyboard
    const modalPlacement = isMobileOrTablet && keyboardHeight > 0 ? "top" : "center";
    const modalStyle = isMobileOrTablet && keyboardHeight > 0 ? {
        marginTop: '10px',
        marginBottom: `${keyboardHeight + 10}px`
    } : {};

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            size="md"
            placement={modalPlacement}
            style={modalStyle}
            classNames={{
                base: isMobileOrTablet && keyboardHeight > 0 ? "max-h-screen overflow-y-auto" : ""
            }}
        >
            <ModalContent>
                <ModalHeader>Edit Product</ModalHeader>
                <ModalBody>
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
                        className="mt-2" 
                        classNames={{
                            inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                        }}
                    />
                    <Input 
                        label="Price" 
                        type="number" 
                        value={String(productForm.price || 0)} 
                        onChange={(e) => setProductForm(f => ({ ...f, price: Number(e.target.value) || 0 }))} 
                        className="mt-2" 
                        classNames={{
                            inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                        }}
                    />
                    <Input 
                        label="Pack Size" 
                        type="number" 
                        value={String(productForm.packSize || 1)} 
                        onChange={(e) => setProductForm(f => ({ ...f, packSize: Number(e.target.value) || 1 }))} 
                        className="mt-2" 
                        classNames={{
                            inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onClick={handleCloseModal}>Cancel</Button>
                    <Button color="primary" onClick={handleUpdateProduct}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
