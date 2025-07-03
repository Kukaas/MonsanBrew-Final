import * as React from "react"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react"
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

export default function DataTable({ columns, data }) {
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
        },
        getRowId: row => row.id.toString(),
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="w-full bg-[#181818] rounded-2xl shadow-lg p-4 border border-[#232323]">
            <div className="overflow-hidden rounded-xl">
                <Table className="w-full text-white" style={{ tableLayout: 'fixed' }}>
                    <TableHeader className="bg-[#232323] text-white sticky top-0 z-10 rounded-t-xl">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} colSpan={header.colSpan} className="py-4 px-3 text-base font-bold bg-[#232323] text-white first:rounded-tl-xl last:rounded-tr-xl text-center">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    className="transition-colors hover:bg-[#232323]/70 border-b border-[#232323] last:border-0"
                                >
                                    {row.getVisibleCells().map(cell => {
                                        return (
                                            <TableCell key={cell.id} className="py-3 px-3 text-base text-[#E0E0E0] text-center">
                                                {cell.column.columnDef.render
                                                    ? cell.column.columnDef.render(row.original)
                                                    : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
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
                            <IconChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 lg:flex border-[#232323] bg-[#232323] text-[#BDBDBD]"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
