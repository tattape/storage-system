"use client";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure, Input, Card, Image, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { getAllBaskets } from "../../../services/baskets";

export default function SalesSection() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [step, setStep] = useState(0);
    const [baskets, setBaskets] = useState<any[]>([]);
    const [selectedBasket, setSelectedBasket] = useState<any>(null);
    const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({});
    // TODO: fetch sales from firebase
    const sales: any[] = [];

    // Fetch baskets on open
    const handleOpen = async () => {
        const data = await getAllBaskets();
        setBaskets(data);
        onOpen();
    };

    // Step 2 mock products (replace with real data)
    const products = selectedBasket ? selectedBasket.products || [] : [];

    const nextStep = () => setStep((s) => Math.min(s + 1, 2));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));
    const resetSale = () => { setStep(0); setSelectedBasket(null); setProductCounts({}); onClose(); };

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
                        <TableColumn>Product</TableColumn>
                        <TableColumn>Qty</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow><TableCell colSpan={4}>No sales yet</TableCell></TableRow>
                        ) : (
                            sales.map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.date}</TableCell>
                                    <TableCell>{s.basket}</TableCell>
                                    <TableCell>{s.product}</TableCell>
                                    <TableCell>{s.qty}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Sales Modal */}
            <Modal isOpen={isOpen} onClose={resetSale} size="xl">
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
                                {baskets.map(b => (
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
                        {step === 2 && <Button color="success" onClick={resetSale} className="w-full sm:w-auto">Save</Button>}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
