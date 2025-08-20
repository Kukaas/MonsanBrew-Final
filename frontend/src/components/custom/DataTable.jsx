import { useState, useEffect, useRef } from 'react';
import PropTypes from "prop-types"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FilterX } from 'lucide-react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DataTable({ columns, data, loading, rowProps, highlightedId }) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
            globalFilter,
            columnFilters,
        },
        getRowId: row => row.id.toString(),
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        globalFilterFn: 'includesString',
    })

    const rowRefs = useRef({});
    useEffect(() => {
        if (highlightedId && rowRefs.current[highlightedId]) {
            rowRefs.current[highlightedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedId]);

    return (
        <div className="w-full bg-[#181818] rounded-2xl shadow-lg p-4 border border-[#232323]">
            <div className="flex justify-start mb-4">
                <Button
                    variant="yellow"
                    size="sm"
                    className="flex items-center gap-2 font-bold shadow-md rounded-lg transition-transform"
                    onClick={() => setColumnFilters([])}
                >
                    <FilterX className="w-4 h-4" />
                    Reset Filters
                </Button>
            </div>
            <div className="overflow-visible rounded-xl">
                <Table className="w-full text-white" style={{ tableLayout: 'fixed' }}>
                    <TableHeader className="bg-[#232323] text-white sticky top-0 z-10 rounded-t-xl">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} colSpan={header.colSpan} className="py-4 px-3 text-base font-bold bg-[#232323] text-white first:rounded-tl-xl last:rounded-tr-xl text-center">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {/* Per-column filter */}
                                        {header.column.getCanFilter() && header.column.columnDef.enableColumnFilter !== false && (
                                            <div className="mt-2">
                                                {header.column.columnDef.meta?.filterOptions ? (
                                                    <select
                                                        value={header.column.getFilterValue() || ""}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        className="w-full px-2 py-1 rounded border border-[#232323] bg-[#232323] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
                                                    >
                                                        <option value="">All</option>
                                                        {header.column.columnDef.meta.filterOptions.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : header.column.columnDef.meta?.filterType === "date" ? (
                                                    <input
                                                        type="date"
                                                        value={header.column.getFilterValue() || ""}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        className="w-full px-2 py-1 rounded border border-[#232323] bg-[#232323] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={header.column.getFilterValue() || ''}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        placeholder={`Filter...`}
                                                        className="w-full px-2 py-1 rounded border border-[#232323] bg-[#232323] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FFC107]"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-[#FFC107] text-lg font-bold">
                                    <span className="flex justify-center items-center gap-2">
                                        <svg className="animate-spin h-6 w-6 text-[#FFC107]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Loading...
                                    </span>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => {
                                const isHighlighted = highlightedId && (row.original.id === highlightedId || row.original._id === highlightedId);
                                return (
                                    <TableRow
                                        key={row.id}
                                        ref={isHighlighted ? el => { rowRefs.current[row.original.id || row.original._id] = el } : undefined}
                                        className={
                                            "transition-colors hover:bg-[#232323]/70 border-b border-[#232323] last:border-0" +
                                            (isHighlighted ? " bg-yellow-200/30 !border-yellow-400" : "")
                                        }
                                        {...(rowProps ? rowProps(row) : {})}
                                    >
                                        {row.getVisibleCells().map(cell => {
                                            return (
                                                <TableCell key={cell.id} className="py-3 px-3 text-base text-[#E0E0E0] text-center" style={{ pointerEvents: 'auto' }}>
                                                    {cell.column.columnDef.render
                                                        ? cell.column.columnDef.render(row.original)
                                                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-[#BDBDBD]">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2 py-2 text-sm text-[#BDBDBD] mt-2">
                <div />
                <div className="flex w-full items-center gap-8 lg:w-fit">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium text-[#BDBDBD]">Rows per page</Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={value => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger size="sm" className="w-20 bg-[#232323] border-none text-[#E0E0E0]" id="rows-per-page">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="bg-[#232323] text-[#E0E0E0]">
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

DataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    rowProps: PropTypes.func,
    highlightedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
