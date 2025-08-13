"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Accordion, AccordionItem, Input } from "@heroui/react";
import { createBasket, deleteProductFromBasket, updateBasketName, deleteBasket } from "../../../../services/baskets";
import { Timestamp } from "firebase/firestore";
import { PencilIcon, TrashIcon, PlusIcon } from "../../../../components/icons";
import StockTable from "./StockTable";
import EditProductModal from "../shared/EditProductModal";
import { useAuth } from "../../../../hooks/useAuth";
import { useKeyboardHeight } from "../../../../hooks/useKeyboardHeight";

export default function StockSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    const [loadingSaveBasket, setLoadingSaveBasket] = useState(false);
    const [loadingUpdateBasketName, setLoadingUpdateBasketName] = useState(false);
    // Authentication hook
    const { isOwner, isEditor, loading: authLoading } = useAuth();

    // Keyboard height detection
    const { keyboardHeight, isMobileOrTablet } = useKeyboardHeight();

    // All hooks at the top
    const [expanded, setExpanded] = useState<string | null>(null);
    const [modal, setModal] = useState<null | 'basket' | 'editBasketName'>(null);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [basketName, setBasketName] = useState("");
    const [editBasketName, setEditBasketName] = useState("");
    const [editingBasket, setEditingBasket] = useState<any>(null);
    const [editProductModalOpen, setEditProductModalOpen] = useState(false);
    const [basketSearch, setBasketSearch] = useState("");
    const [debouncedBasketSearch, setDebouncedBasketSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedBasketSearch(basketSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [basketSearch]);

    // Sort baskets by createdAt (newest first)
    const sortedBaskets = Array.isArray(baskets)
        ? [...baskets].sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            // Firestore Timestamp: use .toMillis() for comparison
            const aTime = typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const bTime = typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return bTime - aTime;
        })
        : [];

    // Filter baskets by search
    const filteredBaskets = sortedBaskets.filter(b =>
        b.name?.toLowerCase().includes(debouncedBasketSearch.toLowerCase())
    );

    // Body scroll lock when modal is open on mobile/tablet
    useEffect(() => {
        if (modal && isMobileOrTablet) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [modal, isMobileOrTablet]);

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
        } catch {
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
        setLoadingUpdateBasketName(true);
        await updateBasketName(editingBasket.id, editBasketName.trim());
        setModal(null);
        setEditingBasket(null);
        setEditBasketName("");
        refreshBaskets();
        setLoadingUpdateBasketName(false);
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
        setLoadingSaveBasket(true);
        try {
            await createBasket({
                name: basketName.trim(),
                createdAt: Timestamp.now()
            });
            setModal(null);
            refreshBaskets();
        } catch {
            alert("Failed to create basket. Please try again.");
        } finally {
            setLoadingSaveBasket(false);
        }
    };
    const handleEditProduct = (basket: any, product: any) => {
        setSelectedBasket(basket);
        setSelectedProduct(product);
        setEditProductModalOpen(true);
    };
    const handleDeleteProduct = async (basket: any, product: any) => { if (!window.confirm(`Delete product "${product.name}"?`)) return; await deleteProductFromBasket(basket.id, product.id); refreshBaskets(); };

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
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Stock Overview</h2>
            <div className="flex gap-2 items-center justify-end md:justify-between my-2">
                <div className="flex gap-2 items-center">
                    <Input
                        isClearable
                        placeholder="Search basket..."
                        value={basketSearch}
                        onChange={e => setBasketSearch(e.target.value)}
                        onClear={() => setBasketSearch("")}
                        className="max-w-xs"
                        classNames={{
                            input: "placeholder:text-gray-700 group-hover:placeholder:text-gray-800",
                            inputWrapper: "group bg-white/30 backdrop-blur-md border border-white/20"
                        }}
                    />
                </div>
                {(isOwner || isEditor) && (
                    <Button
                        color="primary"
                        onPress={handleAddBasket}
                        className="w-xs sm:w-auto bg-purple-500/80 backdrop-blur-md border border-white/20 text-gray-100 hover:bg-purple-600/80"
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
                    content: "backdrop-blur-md border-t border-black/20"
                }}
            >
                {filteredBaskets.map((b: any) => (
                    <AccordionItem
                        key={b.id}
                        title={
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">{b.name}</span>
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
                        <Modal
                            isOpen={modal === 'editBasketName'}
                            onClose={() => setModal(null)}
                            size="md"
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
                                <ModalHeader>Edit Basket Name</ModalHeader>
                                <ModalBody className="modal-body-scrollable">
                                    <div className="pb-4">
                                        <Input
                                            label="Basket Name"
                                            value={editBasketName}
                                            onChange={e => setEditBasketName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={() => setModal(null)}>Cancel</Button>
                                    <Button color="primary" onPress={handleUpdateBasketName} isLoading={loadingUpdateBasketName} disabled={loadingUpdateBasketName}>Save</Button>
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
            <Modal
                isOpen={modal === 'basket'}
                onClose={() => setModal(null)}
                size="md"
                isDismissable={false}
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
                    <ModalHeader>Add New Basket</ModalHeader>
                    <ModalBody className="modal-body-scrollable">
                        <div className="pb-4">
                            <Input
                                label="Basket Name"
                                value={basketName}
                                onChange={e => setBasketName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveBasket} isLoading={loadingSaveBasket} disabled={loadingSaveBasket}>Save</Button>
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
