"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Image, Accordion, AccordionItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { getAllBaskets, createBasket, addProductToBasket, updateProductInBasket, deleteProductFromBasket } from "../../../services/baskets";

export default function StockSection() {
    // State
    const [baskets, setBaskets] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [modal, setModal] = useState<null | 'basket' | 'product' | 'editProduct'>(null);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [basketName, setBasketName] = useState("");
    const [productForm, setProductForm] = useState({ name: "", stock: 0, minStock: 0 });

    // Fetch baskets on mount
    useEffect(() => {
        fetchBaskets();
    }, []);

    const fetchBaskets = async () => {
        const data = await getAllBaskets();
        setBaskets(data);
    };

    // Add new basket
    const handleAddBasket = async () => {
        setBasketName("");
        setModal('basket');
    };
    const handleSaveBasket = async () => {
        if (!basketName.trim()) return;
        await createBasket(basketName.trim());
        setModal(null);
        fetchBaskets();
    };

    // Add product
    const handleAddProduct = (basket: any) => {
        setSelectedBasket(basket);
        setProductForm({ name: "", stock: 0, minStock: 0 });
        setModal('product');
    };
    const handleSaveProduct = async () => {
        if (!selectedBasket || !productForm.name.trim()) return;
        await addProductToBasket(selectedBasket.id, productForm);
        setModal(null);
        fetchBaskets();
    };

    // Edit product
    const handleEditProduct = (basket: any, product: any) => {
        setSelectedBasket(basket);
        setSelectedProduct(product);
        setProductForm({ name: product.name, stock: product.stock, minStock: product.minStock || 0 });
        setModal('editProduct');
    };
    const handleUpdateProduct = async () => {
        if (!selectedBasket || !selectedProduct) return;
        await updateProductInBasket(selectedBasket.id, selectedProduct.id, productForm);
        setModal(null);
        fetchBaskets();
    };

    // Delete product
    const handleDeleteProduct = async (basket: any, product: any) => {
        if (!window.confirm(`Delete product "${product.name}"?`)) return;
        await deleteProductFromBasket(basket.id, product.id);
        fetchBaskets();
    };

    // Row click: show dropdown for edit/delete
    const [rowMenu, setRowMenu] = useState<{ basketId: string, productId: string } | null>(null);

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Stock Overview</h2>
                <Button color="primary" onClick={handleAddBasket} className="w-full sm:w-auto">New Basket</Button>
            </div>
            <Accordion selectedKeys={expanded ? [expanded] : []} onSelectionChange={keys => setExpanded(Array.from(keys)[0] as string)}>
                {baskets.map((b: any) => (
                    <AccordionItem key={b.id} title={b.name}>
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <Image src={b.thumbnail || '/public/file.svg'} alt={b.name} width={160} height={100} className="rounded object-cover w-full md:w-40 h-24" />
                            <Button color="success" onClick={() => handleAddProduct(b)} className="w-full md:w-auto">Add Product</Button>
                        </div>
                        <div className="overflow-x-auto rounded-lg shadow">
                            <Table aria-label="Stock Table" className="min-w-[300px]">
                                <TableHeader>
                                    <TableColumn>Product</TableColumn>
                                    <TableColumn>Stock</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {(b.products || []).map((p: any) => (
                                        <TableRow key={p.id} className="cursor-pointer hover:bg-gray-100" onClick={() => setRowMenu({ basketId: b.id, productId: p.id })}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell className="relative">
                                                {p.stock}
                                                {rowMenu && rowMenu.basketId === b.id && rowMenu.productId === p.id && (
                                                    <div className="absolute z-10 right-0 top-6">
                                                        <Dropdown placement="right-start" onClose={() => setRowMenu(null)}>
                                                            <DropdownTrigger />
                                                            <DropdownMenu aria-label="Product Actions">
                                                                <DropdownItem key="edit" onClick={() => { setRowMenu(null); handleEditProduct(b, p); }}>Edit</DropdownItem>
                                                                <DropdownItem key="delete" color="danger" onClick={() => { setRowMenu(null); handleDeleteProduct(b, p); }}>Delete</DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onClick={() => setModal(null)}>Cancel</Button>
                        <Button color="primary" onClick={handleUpdateProduct}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
