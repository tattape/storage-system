"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Accordion, AccordionItem, Input } from "@heroui/react";
import { createBasket, addProductToBasket, updateProductInBasket, deleteProductFromBasket, updateBasketName, deleteBasket } from "../../../services/baskets";
import { PencilIcon, TrashIcon, PlusIcon } from "../../../components/icons";
import StockTable from "./StockTable";
import EditProductModal from "./EditProductModal";
import { useAuth } from "../../../hooks/useAuth";



export default function StockSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    // Authentication hook
    const { isOwner, isEditor, loading: authLoading, userRole, role, error } = useAuth();

    // All hooks at the top
    const [expanded, setExpanded] = useState<string | null>(null);
    const [modal, setModal] = useState<null | 'basket' | 'editBasketName'>(null);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [basketName, setBasketName] = useState("");
    const [editBasketName, setEditBasketName] = useState("");
    const [editingBasket, setEditingBasket] = useState<any>(null);
    const [editProductModalOpen, setEditProductModalOpen] = useState(false);

    // Delete basket - only for owners
    const handleDeleteBasket = async (basket: any) => {
        if (!isOwner) {
            alert("Only owners can delete baskets");
            return;
        }

        if (!window.confirm(`Delete basket "${basket.name}" and all its products?`)) return;

        try {
            if (typeof basket.id !== 'undefined') {
                await deleteBasket(basket.id);
                refreshBaskets();
            }
        } catch (error) {
            console.error("Error deleting basket:", error);
            alert("Failed to delete basket. Please try again.");
        }
    };

    // Edit basket name
    const handleEditBasketName = (basket: any) => {
        setEditingBasket(basket);
        setEditBasketName(basket.name);
        setModal('editBasketName');
    };
    const handleUpdateBasketName = async () => {
        if (!editingBasket || !editBasketName.trim()) return;
        await updateBasketName(editingBasket.id, editBasketName.trim());
        setModal(null);
        setEditingBasket(null);
        setEditBasketName("");
        refreshBaskets();
    };
    const handleAddBasket = async () => {
        if (!isOwner && !isEditor) {
            alert("Only owners and editors can create new baskets");
            return;
        }
        setBasketName("");
        setModal('basket');
    };

    const handleSaveBasket = async () => {
        if (!basketName.trim()) return;
        try {
            await createBasket(basketName.trim());
            setModal(null);
            refreshBaskets();
        } catch (error) {
            console.error("Error creating basket:", error);
            alert("Failed to create basket. Please try again.");
        }
    };
    const handleEditProduct = (basket: any, product: any) => {
        console.log("Edit product:", product);
        setSelectedBasket(basket);
        setSelectedProduct(product);
        setEditProductModalOpen(true);
    };
    const handleDeleteProduct = async (basket: any, product: any) => { if (!window.confirm(`Delete product "${product.name}"?`)) return; await deleteProductFromBasket(basket.id, product.id); refreshBaskets(); };

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">Stock Overview</h2>
            <div className="flex gap-2 items-center justify-end my-2">
                {(isOwner || isEditor) && (
                    <Button
                        color="primary"
                        onPress={handleAddBasket}
                        className="w-full sm:w-auto bg-purple-500/80 backdrop-blur-md border border-white/20 text-gray-100 hover:bg-purple-600/80"
                        startContent={<PlusIcon className="w-4 h-4" />}
                        disabled={authLoading}
                    >
                        New Basket
                    </Button>
                )}
            </div>
            <Accordion
                className="flex flex-col gap-2 px-0!"
                selectedKeys={expanded ? [expanded] : []}
                onSelectionChange={keys => setExpanded(Array.from(keys)[0] as string)}
                itemClasses={{
                    base: "backdrop-blur-md border border-white/20 rounded-lg px-4",
                    title: "text-gray-100 font-semibold",
                    trigger: "backdrop-blur-md hover:bg-white/10",
                    content: "backdrop-blur-md border-t border-white/20"
                }}
            >
                {baskets.map((b: any) => (
                    <AccordionItem
                        key={b.id}
                        title={
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-100">{b.name}</span>
                                {expanded === b.id && (
                                    <div className="flex items-center gap-1">
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="ml-2 p-1 rounded hover:bg-white/20 cursor-pointer"
                                            onClick={e => { e.stopPropagation(); handleEditBasketName(b); }}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleEditBasketName(b); } }}
                                            aria-label="Edit basket name"
                                        >
                                            <PencilIcon className="w-5 h-5 text-yellow-300" />
                                        </span>
                                        {isOwner && (
                                            <>
                                                <span className="text-xs text-gray-100 bg-green-500/80 backdrop-blur-md px-2 py-1 rounded-full mx-1">
                                                    {isOwner ? 'OWNER' : 'NOT_OWNER'}
                                                </span>
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    className="group p-1 rounded hover:bg-red-500/20 cursor-pointer"
                                                    onClick={e => { e.stopPropagation(); handleDeleteBasket(b); }}
                                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleDeleteBasket(b); } }}
                                                    aria-label="Delete basket"
                                                >
                                                    <TrashIcon className="w-5 h-5 text-red-200 group-hover:text-red-300 transition-all" />
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        }
                    >
                        {/* Modal: Edit Basket Name */}
                        <Modal isOpen={modal === 'editBasketName'} onClose={() => setModal(null)} size="md">
                            <ModalContent>
                                <ModalHeader>Edit Basket Name</ModalHeader>
                                <ModalBody>
                                    <Input label="Basket Name" value={editBasketName} onChange={e => setEditBasketName(e.target.value)} autoFocus />
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={() => setModal(null)}>Cancel</Button>
                                    <Button color="primary" onPress={handleUpdateBasketName}>Save</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                        <StockTable
                            products={b.products || []}
                            basketId={b.id}
                            basket={b}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onRefresh={refreshBaskets}
                        />
                    </AccordionItem>
                ))}
            </Accordion>

            {/* Modal: Add Basket */}
            <Modal isOpen={modal === 'basket'} onClose={() => setModal(null)} size="md">
                <ModalContent>
                    <ModalHeader>Add New Basket</ModalHeader>
                    <ModalBody>
                        <Input label="Basket Name" value={basketName} onChange={e => setBasketName(e.target.value)} autoFocus />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveBasket}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={editProductModalOpen}
                onClose={() => setEditProductModalOpen(false)}
                basketId={selectedBasket?.id || ""}
                product={selectedProduct}
                onProductUpdated={refreshBaskets}
            />
        </div >
    );
}
