"use client";
import { useState, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure, Input, Card, Image, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { addSale, getAllSales, deleteSale } from "../../../services/sales";

export default function SalesSection({ baskets, refreshBaskets }: { baskets: any[]; refreshBaskets: () => void }) {
    // State for edit/delete dropdown
    const [rowMenu, setRowMenu] = useState<string | null>(null); // sale id
    const [editModal, setEditModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null); // Sale object (basket)
    const [editProductCounts, setEditProductCounts] = useState<{ [key: string]: number }>({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [step, setStep] = useState(0);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({});
    const [sales, setSales] = useState<any[]>([]);


    useEffect(() => { fetchSales(); }, []);
    const fetchSales = async () => { const data = await getAllSales(); setSales(data); };
    const handleOpen = () => { onOpen(); };
    const products = selectedBasket ? selectedBasket.products || [] : [];
    const nextStep = () => setStep((s) => Math.min(s + 1, 2));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    // บันทึกการขายใหม่ (1 ใบเสร็จ = หลายสินค้า)
    const handleSaveSale = async () => {
        if (!selectedBasket) return;
        const basketId = selectedBasket.id;
        const basketName = selectedBasket.name;
        const products = selectedBasket.products || [];
        const saleProducts = products
            .filter((p: any) => (productCounts[p.id] || 0) > 0)
            .map((p: any) => ({
                productId: p.id,
                productName: p.name,
                qty: productCounts[p.id] || 0,
            }));
        if (saleProducts.length === 0) return;
        await addSale({
            date: new Date(),
            basketId,
            basketName,
            products: saleProducts,
        });
        // Update stock for each product
        for (const p of saleProducts) {
            const prod = products.find((x: any) => x.id === p.productId);
            await updateProductInBasket(basketId, p.productId, { stock: (prod?.stock || 0) - p.qty });
        }
        setStep(0); setSelectedBasket(null); setProductCounts({}); onClose();
        fetchSales();
        refreshBaskets();
    };

    // Edit sale (basket) & sync stock
    const handleEditSale = (sale: any) => {
        setSelectedSale(sale);
        // Map productId -> qty
        const counts: { [key: string]: number } = {};
        (sale.products || []).forEach((p: any) => { counts[p.productId] = p.qty; });
        setEditProductCounts(counts);
        setEditModal(true);
    };
    const handleUpdateSale = async () => {
        if (!selectedSale) return;
        const basket = baskets.find((b: any) => b.id === selectedSale.basketId);
        if (!basket) return;
        const oldProducts = selectedSale.products || [];
        const newProducts = (basket.products || [])
            .filter((p: any) => (editProductCounts[p.id] || 0) > 0)
            .map((p: any) => ({
                productId: p.id,
                productName: p.name,
                qty: editProductCounts[p.id] || 0,
            }));

        // สร้าง map สำหรับ lookup qty เดิม
        const oldQtyMap: { [key: string]: number } = {};
        oldProducts.forEach((p: any) => { oldQtyMap[p.productId] = p.qty; });

        // อัปเดต stock ตามส่วนต่าง
        for (const p of basket.products || []) {
            const oldQty = oldQtyMap[p.id] || 0;
            const newQty = editProductCounts[p.id] || 0;
            const diff = newQty - oldQty;
            if (diff !== 0) {
                await updateProductInBasket(basket.id, p.id, { stock: (p.stock || 0) - diff });
            }
        }

        // ลบ sale เดิม
        await deleteSale(selectedSale.id);
        // เพิ่ม sale ใหม่
        await addSale({
            date: selectedSale.date,
            basketId: selectedSale.basketId,
            basketName: selectedSale.basketName,
            products: newProducts,
        });
        setEditModal(false); setSelectedSale(null); setEditProductCounts({});
        fetchSales(); refreshBaskets();
    };

    // Delete sale (basket) & return stock
    const handleDeleteSale = async (sale: any) => {
        if (!window.confirm('Delete this sale?')) return;
        const basket = baskets.find((b: any) => b.id === sale.basketId);
        if (!basket) return;
        for (const p of sale.products || []) {
            const prod = (basket.products || []).find((x: any) => x.id === p.productId);
            if (prod) {
                await updateProductInBasket(basket.id, p.productId, { stock: (prod.stock || 0) + p.qty });
            }
        }
        await deleteSale(sale.id);
        fetchSales(); refreshBaskets();
    };

    return (
        <div className="mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Sales History</h2>
                <Button color="secondary" onClick={handleOpen} className="w-full sm:w-auto">Sales</Button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow">
                <Table aria-label="Sales Table" className="min-w-[400px]">
                    <TableHeader>
                        <TableColumn>Date</TableColumn>
                        <TableColumn>Basket</TableColumn>
                        <TableColumn>Products</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow><TableCell colSpan={3}>No sales yet</TableCell></TableRow>
                        ) : (
                            sales.map((s: any) => {
                                const isSelected = rowMenu === s.id;
                                return (
                                    <TableRow key={s.id} className={`cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-300' : ''}`} onClick={() => setRowMenu(s.id)}>
                                        <TableCell>{s.date ? (typeof s.date === 'string' ? s.date : (s.date.toLocaleString ? s.date.toLocaleString() : String(s.date))) : '-'}</TableCell>
                                        <TableCell>{s.basketName}</TableCell>
                                        <TableCell className="relative">
                                            <ul className="list-disc ml-4">
                                                {(s.products || []).map((p: any) => (
                                                    <li key={p.productId}>{p.productName} <span className="text-xs text-gray-500">x{p.qty}</span></li>
                                                ))}
                                            </ul>
                                            {isSelected && (
                                                <div className="absolute z-10 right-0 top-6">
                                                    <Dropdown placement="right-start" isOpen onClose={() => setRowMenu(null)}>
                                                        <DropdownTrigger><span /></DropdownTrigger>
                                                        <DropdownMenu aria-label="Sale Actions">
                                                            <DropdownItem key="edit" onClick={() => { setRowMenu(null); handleEditSale(s); }}>Edit</DropdownItem>
                                                            <DropdownItem key="delete" color="danger" onClick={() => { setRowMenu(null); handleDeleteSale(s); }}>Delete</DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Modal: Edit Sale (basket) */}
            <Modal isOpen={editModal} onClose={() => setEditModal(false)} size="lg">
                <ModalContent>
                    <ModalHeader>Edit Sale (Basket)</ModalHeader>
                    <ModalBody>
                        {selectedSale && (
                            <div className="flex flex-col gap-2">
                                {(baskets.find((b: any) => b.id === selectedSale.basketId)?.products || []).map((p: any) => (
                                    <div key={p.id} className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                        <span className="w-24 text-sm sm:text-base">{p.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: Math.max((c[p.id] || 0) - 1, 0) }))}>-</Button>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={(editProductCounts[p.id] || 0).toString()}
                                                onChange={e => setEditProductCounts(c => ({ ...c, [p.id]: Math.max(Number(e.target.value), 0) }))}
                                                className="w-16 text-center"
                                            />
                                            <Button size="sm" onClick={() => setEditProductCounts(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))}>+</Button>
                                        </div>
                                        <span className="text-xs text-gray-400">(In stock: {p.stock})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onClick={() => setEditModal(false)}>Cancel</Button>
                        <Button color="primary" onClick={handleUpdateSale}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* Sales Modal */}
            <Modal isOpen={isOpen} onClose={handleSaveSale} size="xl">
                <ModalContent>
                    <ModalHeader>Sales Process</ModalHeader>
                    <ModalBody>
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {["Select Basket", "Choose Quantity", "Confirm"].map((label, idx) => (
                                <div key={label} className="flex items-center">
                                    <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white transition-all ${step === idx ? 'bg-blue-500 scale-110' : 'bg-gray-300'}`}>{idx + 1}</div>
                                    {idx < 2 && <div className="w-8 h-1 bg-gray-300 mx-1" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            {["Select Basket", "Choose Quantity", "Confirm"].map((label, idx) => (
                                <span key={label} className={`text-xs ${step === idx ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                            ))}
                        </div>
                        {step === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {baskets.map((b: any) => (
                                    <Card key={b.id} isPressable onClick={() => { setSelectedBasket(b); nextStep(); }} className={`transition-all ${selectedBasket?.id === b.id ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                                        <Image src={b.thumbnail || '/public/file.svg'} alt={b.name} width={160} height={100} className="rounded mb-2 object-cover w-full h-24" />
                                        <div className="text-center font-semibold text-sm sm:text-base">{b.name}</div>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {step === 1 && (
                            <div className="flex flex-col gap-2">
                                {products.map((p: any) => (
                                    <div key={p.id} className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                        <span className="w-24 text-sm sm:text-base">{p.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => setProductCounts(c => ({ ...c, [p.id]: Math.max((c[p.id] || 0) - 1, 0) }))}>-</Button>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={(productCounts[p.id] || 0).toString()}
                                                onChange={e => setProductCounts(c => ({ ...c, [p.id]: Math.max(Number(e.target.value), 0) }))}
                                                className="w-16 text-center"
                                            />
                                            <Button size="sm" onClick={() => setProductCounts(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))}>+</Button>
                                        </div>
                                        <span className="text-xs text-gray-400">(In stock: {p.stock})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <div className="mb-2 font-semibold">Summary</div>
                                {products.map((p: any) => (
                                    <div key={p.id} className="flex justify-between mb-1 text-sm sm:text-base">
                                        <span>{p.name}</span>
                                        <span>{productCounts[p.id] || 0} pcs</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {step > 0 && <Button variant="light" onClick={prevStep} className="w-full sm:w-auto">Back</Button>}
                        {step < 2 && <Button color="primary" onClick={nextStep} className="w-full sm:w-auto">Next</Button>}
                        {step === 2 && <Button color="success" onClick={handleSaveSale} className="w-full sm:w-auto">Save</Button>}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}