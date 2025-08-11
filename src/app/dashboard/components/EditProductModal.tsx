"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Input } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";

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

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="md">
            <ModalContent>
                <ModalHeader>Edit Product</ModalHeader>
                <ModalBody>
                    <Input 
                        label="Product Name" 
                        value={productForm.name || ""} 
                        onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} 
                        autoFocus 
                    />
                    <Input 
                        label="Min Stock" 
                        type="number" 
                        value={String(productForm.minStock || 0)} 
                        onChange={e => setProductForm(f => ({ ...f, minStock: Number(e.target.value) || 0 }))} 
                        className="mt-2" 
                    />
                    <Input 
                        label="Price" 
                        type="number" 
                        inputMode="decimal" 
                        step="any" 
                        value={String(productForm.price || 0)} 
                        onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) || 0 }))} 
                        className="mt-2" 
                    />
                    <Input 
                        label="Pack Size" 
                        type="number" 
                        min="1" 
                        value={String(productForm.packSize || 1)} 
                        onChange={e => setProductForm(f => ({ ...f, packSize: Number(e.target.value) || 1 }))} 
                        className="mt-2" 
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
