"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Pagination, Input, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { updateProductInBasket } from "../../../../services/baskets";
import { deleteSale } from "../../../../services/sales";
import SalesModal from "./SalesModal";
import EditSalesModal from "./EditSalesModal";
import { EditIcon, DeleteIcon, PlusIcon } from "../../../../components/icons";
import { useAuth } from "../../../../hooks/useAuth";

interface SalesTableProps {
    sales: any[];
    baskets: any[];
    onSaleComplete: () => void;
}

export default function SalesTable({ sales, baskets, onSaleComplete }: SalesTableProps) {
    // Authentication hook
    const { isOwner } = useAuth();

    const [page, setPage] = useState(1);
    const [rowMenu, setRowMenu] = useState<string | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterValue, setFilterValue] = useState("");
    const [searchInput, setSearchInput] = useState("");
    // QR Scan modal state for search input
    const [qrScanOpen, setQrScanOpen] = useState(false);
    const [qrScanError, setQrScanError] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterValue(searchInput);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredSales = [...sales];

        if (hasSearchFilter) {
            const filter = filterValue.toLowerCase();
            filteredSales = filteredSales.filter((sale) => {
                const tracking = sale.trackingNumber?.toLowerCase() || "";
                const basket = sale.basketName?.toLowerCase() || "";
                const products = sale.products || [];
                return (
                    tracking.includes(filter) ||
                    filter.includes(tracking) ||
                    basket.includes(filter) ||
                    products.some((p: any) => p.productName?.toLowerCase().includes(filter))
                );
            });
        }

        // Sort by date - newest first
        filteredSales.sort((a, b) => {
            const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : a.date) : new Date(0);
            const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : b.date) : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });

        return filteredSales;
    }, [sales, filterValue, hasSearchFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);
    const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const onRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value));
        setPage(1);
    };

    const onSearchChange = useCallback((value?: string) => {
        if (value !== undefined) {
            setSearchInput(value);
        } else {
            setSearchInput("");
        }
    }, []);

    const onClear = () => {
        setSearchInput("");
        setFilterValue("");
        setPage(1);
    };

    const handleEditSale = (sale: any) => {
        setSelectedSale(sale);
        setEditModalOpen(true);
        setRowMenu(null);
    };

    const handleDeleteSale = async (sale: any) => {
        if (!window.confirm('Delete this sale?')) return;

        try {
            const basket = baskets.find((b: any) => b.id === sale.basketId);

            // ถ้าหาตะกร้าเจอ ให้คืน stock ก่อน
            if (basket) {
                // Return stock
                for (const p of sale.products || []) {
                    const prod = (basket.products || []).find((x: any) => x.id === p.productId);
                    if (prod) {
                        const currentStock = prod.stock !== undefined ? prod.stock : 0;
                        await updateProductInBasket(basket.id, p.productId, { stock: currentStock + p.qty });
                    }
                }
            } else {
                // ถ้าหาตะกร้าไม่เจอ แสดง warning แต่ยังสามารถลบ sale ได้
                console.warn(`Basket ${sale.basketId} not found, but will proceed to delete sale`);
                window.alert('Warning: Associated basket not found. Stock cannot be returned, but sale will be deleted.');
            }

            // ลบ sale ในทุกกรณี (ไม่ว่าจะหาตะกร้าเจอหรือไม่)
            await deleteSale(sale.id);

            setRowMenu(null);
            onSaleComplete();
        } catch (error) {
            console.error('Error deleting sale:', error);
            window.alert('Error occurred while deleting sale. Please try again.');
        }
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <div className="flex w-full sm:max-w-[44%] items-center relative">
                        <Input
                            isClearable
                            className="w-full"
                            placeholder="Search by tracking, basket, or products..."
                            value={searchInput}
                            onClear={() => onClear()}
                            onValueChange={onSearchChange}
                            classNames={{
                                input: "placeholder:text-gray-700 group-hover:placeholder:text-gray-800",
                                inputWrapper: "group bg-white/10 backdrop-blur-md border border-white/20"
                            }}
                        />
                        {/* Move scan button outside input for better layout */}
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Scan QR"
                            className="ml-2 cursor-pointer flex items-center justify-center rounded-full p-1 text-gray-700/80 hover:text-gray-800/80"
                            onClick={() => setQrScanOpen(true)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setQrScanOpen(true); }}
                            style={{ zIndex: 2 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" /></svg>
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button color="primary" onPress={onOpen} startContent={<PlusIcon className="w-4 h-4" />}
                            className="bg-purple-500/80 backdrop-blur-md border border-white/20 text-white hover:bg-purple-600/80">
                            Sales
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-800 text-small font-semibold">Total {filteredItems.length} sales</span>
                    <label className="flex items-center text-gray-800 text-small">
                        Rows per page:
                        <select
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md outline-none text-gray-900 text-small ml-2 px-2 py-1"
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(e.target.value)}
                        >
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [rowsPerPage, filteredItems.length, onSearchChange, onOpen, searchInput]);

    // QR Scan modal effect (should be at top-level, not inside useMemo)
    useEffect(() => {
        let html5QrCode: any = null;
        if (qrScanOpen) {
            setQrScanError("");
            const qrRegionId = "qr-reader-search";
            setTimeout(() => {
                const qrElem = document.getElementById(qrRegionId);
                if (!qrElem) return;
                qrElem.style.minHeight = "220px";
                qrElem.style.width = "100%";
                html5QrCode = new Html5Qrcode(qrRegionId);
                const cameraConfig = { facingMode: "environment" };
                const config = { fps: 10, qrbox: { width: 320, height: 200 }, aspectRatio: 1.6 };
                html5QrCode.start(
                    cameraConfig,
                    config,
                    function (decodedText: string) {
                        // Flash green corners only when QR found
                        const frameElem = document.querySelector('.qr-corner-frame-search');
                        if (frameElem) {
                            frameElem.classList.add('qr-corner-flash');
                            setTimeout(() => {
                                frameElem.classList.remove('qr-corner-flash');
                                setSearchInput(decodedText);
                                setQrScanOpen(false);
                            }, 700);
                        } else {
                            setSearchInput(decodedText);
                            setQrScanOpen(false);
                        }
                    },
                    function (errorMessage: string) {
                        setQrScanError(errorMessage);
                    }
                ).catch(function (err: any) {
                    setQrScanError("Camera error: " + err);
                });
            }, 300);
        }
        return () => {
            if (typeof html5QrCode !== 'undefined' && html5QrCode != null) {
                const isScanning = (html5QrCode as any).isScanning;
                if (isScanning && typeof html5QrCode.stop === 'function') {
                    html5QrCode.stop()
                        .then(() => {
                            if (html5QrCode && typeof html5QrCode.clear === 'function') html5QrCode.clear();
                        })
                        .catch(() => {
                            if (html5QrCode && typeof html5QrCode.clear === 'function') html5QrCode.clear();
                        });
                } else if (html5QrCode && typeof html5QrCode.clear === 'function') {
                    html5QrCode.clear();
                }
            }
        };
    }, [qrScanOpen]);

    return (
        <div className="space-y-4">
            {/* QR Scan Modal for search input */}
            <Modal isOpen={qrScanOpen} onClose={() => setQrScanOpen(false)} size="md" hideCloseButton placement="center" classNames={{ base: "max-w-md z-[9999]" }}>
                <ModalContent>
                    <ModalHeader className="text-center">Scan QR / Barcode</ModalHeader>
                    <ModalBody className="flex flex-col items-center justify-center py-4" style={{ position: "relative" }}>
                        <div style={{ position: "relative", width: "100%", minHeight: 220, zIndex: 20 }}>
                            <div
                                id="qr-reader-search"
                                style={{ width: "100%", minHeight: 220, position: "relative", borderRadius: 12, overflow: "hidden", zIndex: 20 }}
                                className={qrScanError ? "qr-error" : ""}
                            />
                            {/* Green flash overlay for corners */}
                            <div className="qr-corner-frame-search" style={{ zIndex: 21, pointerEvents: "none" }}>
                                <div className="corner-bl" />
                                <div className="corner-tr" />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setQrScanOpen(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Table
                isHeaderSticky
                aria-label="Sales Table"
                topContent={topContent}
                topContentPlacement="outside"
                bottomContent={
                    pages > 1 ? (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="secondary"
                                page={page}
                                total={pages}
                                onChange={(page) => setPage(page)}
                                classNames={{
                                    prev: "bg-white/50 backdrop-blur-md hover:bg-secondary-400 text-secondary-700",
                                    next: "bg-white/50 backdrop-blur-md hover:bg-secondary-400 text-secondary-700",
                                    item: "bg-white/50 backdrop-blur-md text-secondary-700",
                                }}
                            />
                        </div>
                    ) : null
                }
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[350px] overflow-auto bg-white/10 backdrop-blur-md rounded-lg border border-white/20",
                    table: "min-h-[200px]",
                    th: "bg-white/20 backdrop-blur-md text-gray-900 font-semibold border-b border-white/20",
                    td: "text-gray-900 border-b border-white/10"
                }}
            >
                <TableHeader>
                    <TableColumn className="hidden sm:table-cell">Date</TableColumn>
                    <TableColumn className="hidden md:table-cell">Tracking</TableColumn>
                    <TableColumn className="hidden lg:table-cell">Basket</TableColumn>
                    <TableColumn className="min-w-[200px] sm:w-full">Products</TableColumn>
                    <TableColumn>Qty</TableColumn>
                    <TableColumn>Orders</TableColumn>
                    <TableColumn>Cost</TableColumn>
                    <TableColumn>Revenue</TableColumn>
                    <TableColumn>Profit</TableColumn>
                </TableHeader>
                <TableBody emptyContent={<span className="text-gray-500">No sales found</span>}>
                    {items.map((s: any) => {
                        const isSelected = rowMenu === s.id;
                        const currentBasket = baskets.find((b: any) => b.id === s.basketId);
                        const basketName = currentBasket?.name || s.basketName || 'Unknown Basket';

                        return (
                            <TableRow
                                key={s.id}
                                className={`cursor-pointer hover:bg-white/20 ${isSelected ? 'bg-white/30' : ''}`}
                                onClick={() => setRowMenu(s.id)}
                            >
                                <TableCell className="hidden sm:table-cell">
                                    {s.date ?
                                        (typeof s.date === 'string' ?
                                            s.date :
                                            (s.date.toLocaleString ? s.date.toLocaleString() : String(s.date))
                                        ) : '-'
                                    }
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{s.trackingNumber || '-'}</TableCell>
                                <TableCell className="hidden lg:table-cell">{basketName}</TableCell>
                                <TableCell className="relative w-full min-w-[250px] sm:w-full">
                                    <div className="flex flex-col">
                                        <ul className="list-disc ml-4 mb-2">
                                            {(s.products || []).map((p: any) => (
                                                <li key={p.productId} className="text-sm">
                                                    {p.productName} <span className="text-base font-bold text-secondary-700">x{p.qty}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {/* Mobile info */}
                                        <div className="text-xs text-gray-700 space-y-1 md:hidden">
                                            <div>Tracking: {s.trackingNumber || '-'}</div>
                                            <div className="lg:hidden">Basket: {basketName}</div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute z-10 right-0 top-6">
                                            <Dropdown placement="right-start" isOpen onClose={() => setRowMenu(null)}>
                                                <DropdownTrigger><span /></DropdownTrigger>
                                                <DropdownMenu aria-label="Sale Actions">
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => handleEditSale(s)}
                                                        startContent={<EditIcon className="w-4 h-4 text-warning" />}
                                                    >
                                                        Edit
                                                    </DropdownItem>
                                                    {isOwner ? (
                                                        <DropdownItem
                                                            key="delete"
                                                            color="danger"
                                                            onClick={() => handleDeleteSale(s)}
                                                            startContent={<DeleteIcon className="w-4 h-4 text-danger" />}
                                                        >
                                                            Delete
                                                        </DropdownItem>
                                                    ) : null}
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-secondary-700 text-sm">
                                        {(s.products || []).reduce((total: number, p: any) => total + (p.qty || 0), 0)}
                                        <span className="hidden sm:inline"> pcs</span>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-blue-600 text-sm">
                                        {s.orderCount || 1}
                                        <span className="hidden sm:inline"> order{(s.orderCount || 1) > 1 ? 's' : ''}</span>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-secondary-700 text-sm">
                                        ฿{(s.totalCost || (s.products || []).reduce((total: number, p: any) => {
                                            // Fallback สำหรับ sale เก่าที่ไม่มี priceAtSale
                                            const price = p.priceAtSale || currentBasket?.products?.find((bp: any) => bp.id === p.productId)?.price || 0;
                                            return total + ((p.qty || 0) * price);
                                        }, 0)).toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        // ใช้ totalRevenue ที่บันทึกไว้ ถ้าไม่มีให้คำนวณแบบเก่า
                                        let revenue = s.totalRevenue;

                                        if (revenue === undefined || revenue === null) {
                                            // Fallback สำหรับ sale เก่า
                                            const basketSellPrice = s.basketSellPrice || currentBasket?.sellPrice || 0;
                                            const orderCount = s.orderCount || 1;
                                            revenue = basketSellPrice * orderCount * (1 - 0.0856);
                                        }

                                        return (
                                            <span className="font-semibold text-secondary-700 text-sm">
                                                ฿{revenue.toLocaleString()}
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        // ใช้ profit ที่บันทึกไว้ ถ้าไม่มีให้คำนวณแบบเก่า (สำหรับ sale เก่า)
                                        let profit = s.profit;

                                        if (profit === undefined || profit === null) {
                                            // Fallback สำหรับ sale เก่า
                                            const totalCost = (s.products || []).reduce((total: number, p: any) => {
                                                const price = p.priceAtSale || currentBasket?.products?.find((bp: any) => bp.id === p.productId)?.price || 0;
                                                return total + ((p.qty || 0) * price);
                                            }, 0);

                                            const basketSellPrice = s.basketSellPrice || currentBasket?.sellPrice || 0;
                                            const orderCount = s.orderCount || 1;
                                            const adjustedSellPrice = basketSellPrice * orderCount * (1 - 0.0856);
                                            profit = adjustedSellPrice - totalCost;
                                        }

                                        return (
                                            <span className={`font-semibold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ฿{profit.toLocaleString()}
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Sales Modal */}
            <SalesModal
                isOpen={isOpen}
                onClose={onClose}
                baskets={baskets}
                onSaleComplete={onSaleComplete}
            />

            {/* Edit Sales Modal */}
            <EditSalesModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                selectedSale={selectedSale}
                baskets={baskets}
                onSaleUpdated={onSaleComplete}
            />
        </div >
    );
}
