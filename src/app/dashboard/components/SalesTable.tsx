"use client";
import { useState, useMemo, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Pagination, Select, SelectItem, Input, Button, useDisclosure } from "@heroui/react";
import { updateProductInBasket } from "../../../services/baskets";
import { deleteSale } from "../../../services/sales";
import SalesModal from "./SalesModal";
import EditSalesModal from "./EditSalesModal";
import { EditIcon, DeleteIcon, PlusIcon } from "../../../components/icons";

interface SalesTableProps {
    sales: any[];
    baskets: any[];
    onSaleComplete: () => void;
}

export default function SalesTable({ sales, baskets, onSaleComplete }: SalesTableProps) {
    const [page, setPage] = useState(1);
    const [rowMenu, setRowMenu] = useState<string | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterValue, setFilterValue] = useState("");
    const [searchInput, setSearchInput] = useState("");
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
            filteredSales = filteredSales.filter((sale) =>
                sale.customerName?.toLowerCase().includes(filterValue.toLowerCase()) ||
                sale.trackingNumber?.toLowerCase().includes(filterValue.toLowerCase()) ||
                sale.basketName?.toLowerCase().includes(filterValue.toLowerCase()) ||
                sale.products?.some((p: any) =>
                    p.productName?.toLowerCase().includes(filterValue.toLowerCase())
                )
            );
        }

        return filteredSales;
    }, [sales, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);
    const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const onRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value));
        setPage(1);
    };

    const onSearchChange = (value?: string) => {
        if (value !== undefined) {
            setSearchInput(value);
        } else {
            setSearchInput("");
        }
    };

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
        const basket = baskets.find((b: any) => b.id === sale.basketId);
        if (!basket) return;

        // Return stock
        for (const p of sale.products || []) {
            const prod = (basket.products || []).find((x: any) => x.id === p.productId);
            if (prod) {
                await updateProductInBasket(basket.id, p.productId, { stock: (prod.stock || 0) + p.qty });
            }
        }
        await deleteSale(sale.id);
        setRowMenu(null);
        onSaleComplete();
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by customer, tracking, basket, or products..."
                        value={searchInput}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Button color="primary" onPress={onOpen} startContent={<PlusIcon className="w-4 h-4" />}>
                            Sales
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {filteredItems.length} sales</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small ml-2"
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
    }, [filterValue, rowsPerPage, filteredItems.length, onSearchChange]);

    return (
        <div className="space-y-4">
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
                                color="primary"
                                page={page}
                                total={pages}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                    ) : null
                }
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[350px] overflow-auto",
                    table: "min-h-[200px]"
                }}
            >
                <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Customer</TableColumn>
                    <TableColumn>Tracking</TableColumn>
                    <TableColumn>Basket</TableColumn>
                    <TableColumn>Products</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No sales found"}>
                    {items.map((s: any) => {
                        const isSelected = rowMenu === s.id;
                        const currentBasket = baskets.find((b: any) => b.id === s.basketId);
                        const basketName = currentBasket?.name || s.basketName || 'Unknown Basket';

                        return (
                            <TableRow
                                key={s.id}
                                className={`cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-300' : ''}`}
                                onClick={() => setRowMenu(s.id)}
                            >
                                <TableCell>
                                    {s.date ?
                                        (typeof s.date === 'string' ?
                                            s.date :
                                            (s.date.toLocaleString ? s.date.toLocaleString() : String(s.date))
                                        ) : '-'
                                    }
                                </TableCell>
                                <TableCell>{s.customerName || '-'}</TableCell>
                                <TableCell>{s.trackingNumber || '-'}</TableCell>
                                <TableCell>{basketName}</TableCell>
                                <TableCell className="relative">
                                    <ul className="list-disc ml-4">
                                        {(s.products || []).map((p: any) => (
                                            <li key={p.productId}>
                                                {p.productName} <span className="text-xs text-gray-500">x{p.qty}</span>
                                            </li>
                                        ))}
                                    </ul>
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
                                                    <DropdownItem
                                                        key="delete"
                                                        color="danger"
                                                        onClick={() => handleDeleteSale(s)}
                                                        startContent={<DeleteIcon className="w-4 h-4 text-danger" />}
                                                    >
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    )}
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
        </div>
    );
}
