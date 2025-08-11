"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Accordion, AccordionItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Input } from "@heroui/react";
import { createBasket, addProductToBasket, updateProductInBasket, deleteProductFromBasket, updateBasketName, deleteBasket } from "../../../services/baskets";
import { PencilIcon } from './PencilIcon';
import { getUserRole } from "@/storage/utils/getUserRole";

// Trash icon SVG
function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function StockSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    // All hooks at the top
    const [expanded, setExpanded] = useState<string | null>(null);
    const [modal, setModal] = useState<null | 'basket' | 'product' | 'editProduct' | 'editBasketName'>(null);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [basketName, setBasketName] = useState("");
    const [editBasketName, setEditBasketName] = useState("");
    const [editingBasket, setEditingBasket] = useState<any>(null);
    const [productForm, setProductForm] = useState({ name: "", stock: 0, minStock: 0, price: 0 });
    const [rowMenu, setRowMenu] = useState<{ basketId: string, productId: string } | null>(null);

    // Delete basket
    const handleDeleteBasket = async (basket: any) => {
        if (!window.confirm(`Delete basket "${basket.name}" and all its products?`)) return;
        if (typeof basket.id !== 'undefined') {
            await deleteBasket(basket.id);
            refreshBaskets();
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
    const handleAddBasket = async () => { setBasketName(""); setModal('basket'); };
    const handleSaveBasket = async () => { if (!basketName.trim()) return; await createBasket(basketName.trim()); setModal(null); refreshBaskets(); };
    const handleAddProduct = (basket: any) => { setSelectedBasket(basket); setProductForm({ name: "", stock: 0, minStock: 0, price: 0 }); setModal('product'); };
    const handleSaveProduct = async () => { if (!selectedBasket || !productForm.name.trim()) return; await addProductToBasket(selectedBasket.id, productForm); setModal(null); refreshBaskets(); };
    const handleEditProduct = (basket: any, product: any) => { setSelectedBasket(basket); setSelectedProduct(product); setProductForm({ name: product.name, stock: product.stock, minStock: product.minStock || 0, price: product.price || 0 }); setModal('editProduct'); };
    const handleUpdateProduct = async () => { if (!selectedBasket || !selectedProduct) return; await updateProductInBasket(selectedBasket.id, selectedProduct.id, productForm); setModal(null); refreshBaskets(); };
    const handleDeleteProduct = async (basket: any, product: any) => { if (!window.confirm(`Delete product "${product.name}"?`)) return; await deleteProductFromBasket(basket.id, product.id); refreshBaskets(); };

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Stock Overview</h2>
                <Button color="primary" onClick={handleAddBasket} className="w-full sm:w-auto">New Basket</Button>
            </div>
            <Accordion className="flex flex-col gap-2" selectedKeys={expanded ? [expanded] : []} onSelectionChange={keys => setExpanded(Array.from(keys)[0] as string)}>
                {baskets.map((b: any) => (
                    <AccordionItem
                        variant="splitted"
                        key={b.id}
                        title={
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{b.name}</span>
                                {expanded === b.id && (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-2 p-1 rounded hover:bg-gray-200 cursor-pointer"
                                        onClick={e => { e.stopPropagation(); handleEditBasketName(b); }}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleEditBasketName(b); } }}
                                        aria-label="Edit basket name"
                                    >
                                        <PencilIcon className="w-5 h-5 text-gray-500" />
                                    </span>
                                )}
                            </div>
                        }
                        className="font-bold px-5 py-2"
                    >
                        {/* Modal: Edit Basket Name */}
                        <Modal isOpen={modal === 'editBasketName'} onClose={() => setModal(null)} size="md">
                            <ModalContent>
                                <ModalHeader>Edit Basket Name</ModalHeader>
                                <ModalBody>
                                    <Input label="Basket Name" value={editBasketName} onChange={e => setEditBasketName(e.target.value)} autoFocus />
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onClick={() => setModal(null)}>Cancel</Button>
                                    <Button color="primary" onClick={handleUpdateBasketName}>Save</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                        <div className="overflow-x-auto rounded-lg shadow">
                            <Table aria-label="Stock Table" className="min-w-[300px]">
                                <TableHeader>
                                    <TableColumn>Product</TableColumn>
                                    <TableColumn>Stock</TableColumn>
                                    <TableColumn>Price</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {(b.products || []).map((p: any) => {
                                        const isSelected = rowMenu && rowMenu.basketId === b.id && rowMenu.productId === p.id;
                                        return (
                                            <TableRow
                                                key={p.id}
                                                className={`cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-300' : ''}`}
                                                onClick={() => setRowMenu({ basketId: b.id, productId: p.id })}
                                            >
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell className="relative">
                                                    {p.stock}
                                                    {isSelected && (
                                                        <div className="absolute z-10 right-0 top-6">
                                                            <Dropdown placement="right-start" isOpen onClose={() => setRowMenu(null)}>
                                                                <DropdownTrigger><span /></DropdownTrigger>
                                                                <DropdownMenu aria-label="Product Actions">
                                                                    <DropdownItem key="edit" onClick={() => { setRowMenu(null); handleEditProduct(b, p); }}>Edit</DropdownItem>
                                                                    <DropdownItem key="delete" color="danger" onClick={() => { setRowMenu(null); handleDeleteProduct(b, p); }}>Delete</DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{p.price ? p.price.toLocaleString() : '-'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
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
                        <Button variant="light" onClick={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onClick={handleSaveBasket}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Add Product */}
            <Modal isOpen={modal === 'product'} onClose={() => setModal(null)} size="md">
                <ModalContent>
                    <ModalHeader>Add Product</ModalHeader>
                    <ModalBody>
                        <Input label="Product Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                        <Input label="Stock" type="number" value={String(productForm.stock)} onChange={e => setProductForm(f => ({ ...f, stock: Number(e.target.value) }))} className="mt-2" />
                        <Input label="Min Stock" type="number" value={String(productForm.minStock)} onChange={e => setProductForm(f => ({ ...f, minStock: Number(e.target.value) }))} className="mt-2" />
                        <Input label="Price" type="number" inputMode="decimal" step="any" value={String(productForm.price)} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} className="mt-2" />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onClick={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onClick={handleSaveProduct}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Edit Product */}
            <Modal isOpen={modal === 'editProduct'} onClose={() => setModal(null)} size="md">
                <ModalContent>
                    <ModalHeader>Edit Product</ModalHeader>
                    <ModalBody>
                        <Input label="Product Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                        <Input label="Stock" type="number" value={String(productForm.stock)} onChange={e => setProductForm(f => ({ ...f, stock: Number(e.target.value) }))} className="mt-2" />
                        <Input label="Min Stock" type="number" value={String(productForm.minStock)} onChange={e => setProductForm(f => ({ ...f, minStock: Number(e.target.value) }))} className="mt-2" />
                        <Input label="Price" type="number" inputMode="decimal" step="any" value={String(productForm.price)} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} className="mt-2" />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onClick={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onClick={handleUpdateProduct}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    );
}
