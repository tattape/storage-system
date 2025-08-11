"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Pagination, Input, Button, useDisclosure } from "@heroui/react";
import AddProductModal from "./AddProductModal";
import StockModal from "./StockModal";
import { StockIcon, EditIcon, DeleteIcon, PlusIcon } from "../../../components/icons";

interface StockTableProps {
    products: any[];
    basketId: string;
    basket: any;
    onEdit: (basket: any, product: any) => void;
    onDelete: (basket: any, product: any) => void;
    onRefresh: () => void;
}

export default function StockTable({ products, basketId, basket, onEdit, onDelete, onRefresh }: StockTableProps) {
    const [page, setPage] = useState(1);
    const [rowMenu, setRowMenu] = useState<string | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterValue, setFilterValue] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

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
        try {
            let filteredProducts = [...(products || [])];

            if (hasSearchFilter && filterValue) {
                filteredProducts = filteredProducts.filter((product) => {
                    try {
                        const name = product?.name?.toString().toLowerCase() || "";
                        const price = product?.price?.toString() || "";
                        const stock = product?.stock?.toString() || "";
                        const packSize = product?.packSize?.toString() || "";
                        const totalPrice = ((Number(product?.stock) || 0) * (Number(product?.price) || 0)).toString();

                        return name.includes(filterValue.toLowerCase()) ||
                            price.includes(filterValue) ||
                            stock.includes(filterValue) ||
                            packSize.includes(filterValue) ||
                            totalPrice.includes(filterValue);
                    } catch {
                        return false;
                    }
                });
            }

            return filteredProducts;
        } catch {
            return [];
        }
    }, [products, filterValue, hasSearchFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);
    const items = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // คำนวณ Grand Total จากทุก products ที่ filter แล้ว
    const grandTotal = useMemo(() => {
        return filteredItems.reduce((total, product) => {
            const stock = Number(product?.stock) || 0;
            const price = Number(product?.price) || 0;
            return total + (stock * price);
        }, 0);
    }, [filteredItems]);

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

    const handleManageStock = (product: any) => {
        setSelectedProduct(product);
        setStockModalOpen(true);
        setRowMenu(null);
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name, price, stock, pack size, or total..."
                        value={searchInput}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                        classNames={{
                            input: "placeholder:text-gray-300 group-hover:placeholder:text-gray-400",
                            inputWrapper: "group bg-white/10 backdrop-blur-md border border-white/20"
                        }}
                    />
                    <div className="flex gap-3">
                        <Button color="primary" onPress={onOpen} startContent={<PlusIcon className="w-4 h-4" />}
                            className="bg-purple-500/80 backdrop-blur-md border border-white/20 text-gray-100 hover:bg-purple-600/80">
                            Product
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-small">Total {filteredItems.length} products</span>
                    <label className="flex items-center text-gray-300 text-small">
                        Rows per page:
                        <select
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md outline-none text-gray-200 text-small ml-2 px-2 py-1"
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

    return (
        <div className="py-4">
            <Table
                isHeaderSticky
                aria-label="Stock Table"
                topContent={topContent}
                topContentPlacement="outside"
                bottomContent={
                    <div className="flex flex-col gap-2">
                        {/* Summary Row */}
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-200">
                                    Total Inventory Value ({filteredItems.length} items):
                                </span>
                                <span className="text-lg font-bold text-success">
                                    ฿{grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="secondary"
                                    page={page}
                                    total={pages}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        )}
                    </div>
                }
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[350px] overflow-auto bg-white/10 backdrop-blur-md rounded-lg border border-white/20",
                    table: "min-h-[200px]",
                    th: "bg-white/20 backdrop-blur-md text-gray-200 font-semibold border-b border-white/20",
                    td: "text-gray-200 border-b border-white/10"
                }}
            >
                <TableHeader>
                    <TableColumn>Product</TableColumn>
                    <TableColumn>Stock</TableColumn>
                    <TableColumn>Pack Size</TableColumn>
                    <TableColumn>Price</TableColumn>
                    <TableColumn>Total Price</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No products found"}>
                    {items.map((p: any) => {
                        const isSelected = rowMenu === p.id;
                        const stock = Number(p?.stock) || 0;
                        const minStock = Number(p?.minStock) || 0;
                        const price = Number(p?.price) || 0;
                        const packSize = Number(p?.packSize) || 1;
                        const totalPrice = stock * price;

                        return (
                            <TableRow
                                key={p.id}
                                className={`cursor-pointer hover:bg-white/20 ${isSelected ? 'bg-white/30' : ''}`}
                                onClick={() => setRowMenu(p.id)}
                            >
                                <TableCell>{p?.name || 'Unknown Product'}</TableCell>
                                <TableCell className="relative">
                                    <span className={
                                        stock <= minStock
                                            ? "text-red-300 font-bold"
                                            : stock <= (packSize * 2)
                                                ? "text-orange-300 font-medium"
                                                : "text-gray-200"
                                    }>
                                        {stock}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute z-10 right-0 top-6">
                                            <Dropdown placement="right-start" isOpen onClose={() => setRowMenu(null)}>
                                                <DropdownTrigger><span /></DropdownTrigger>
                                                <DropdownMenu aria-label="Product Actions">
                                                    <DropdownItem
                                                        key="stock"
                                                        onClick={() => handleManageStock(p)}
                                                        startContent={<StockIcon className="w-4 h-4 text-primary" />}
                                                    >
                                                        Manage Stock
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => {
                                                            setRowMenu(null);
                                                            onEdit(basket, p);
                                                        }}
                                                        startContent={<EditIcon className="w-4 h-4 text-warning" />}
                                                    >
                                                        Edit Product
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        color="danger"
                                                        onClick={() => {
                                                            setRowMenu(null);
                                                            onDelete(basket, p);
                                                        }}
                                                        startContent={<DeleteIcon className="w-4 h-4 text-danger" />}
                                                    >
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{Number(p?.packSize) || 1} pcs/pack</TableCell>
                                <TableCell>{price > 0 ? price.toLocaleString() : '-'}</TableCell>
                                <TableCell className="font-medium">{totalPrice > 0 ? '฿' + totalPrice.toLocaleString() : '-'}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isOpen}
                onClose={onClose}
                basketId={basketId}
                onProductAdded={onRefresh}
            />

            {/* Stock Management Modal */}
            <StockModal
                isOpen={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                basketId={basketId}
                product={selectedProduct}
                onStockUpdated={onRefresh}
            />
        </div>
    );
}
