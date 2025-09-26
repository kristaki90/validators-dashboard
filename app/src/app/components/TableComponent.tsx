"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/app/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"
import { Validator } from "../types/Validator"
import { useGetLatestSuiSystemState } from "../hooks/useGetLatestSuiSystemState"
import { truncateString } from "@/app/helpers/truncateString"
import { mistToSui } from "@/app/helpers/suiConversion"

export default function TableComponent() {
    const { validators, isLoading } = useGetLatestSuiSystemState();

    const data: Validator[] = React.useMemo(() => validators, [validators])

    const columns: ColumnDef<Validator>[] = React.useMemo(() => [
        {
            accessorKey: "address",
            header: "Validator",
            cell: ({ row }) => (
                <div className="lowercase">{truncateString(row.getValue("address"))}</div>
            ),
        },
        {
            accessorKey: "stake",
            header: "Stake",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{Math.round(mistToSui(row.getValue("stake"))).toLocaleString()}</div>
                <div className="ml-1 text-gray-400 text-sm"> SUI</div>
            </div >,
        },
        {
            accessorKey: "nextEpochStake",
            header: "Next Epoch Stake",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{Math.round(mistToSui(row.getValue("nextEpochStake"))).toLocaleString()}</div>
                <div className="ml-1 text-gray-400 text-sm"> SUI</div>
            </div>,
        },
        {
            accessorKey: "currentEpochGasPrice",
            header: "Current Epoch Gas Price",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{row.getValue("currentEpochGasPrice")}</div>
                <div className="ml-1 text-gray-400 text-sm"> MIST</div>
            </div>,
        },
        {
            accessorKey: "nextEpochGasPrice",
            header: "Next Epoch Gas Price",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{row.getValue("nextEpochGasPrice")}</div>
                <div className="ml-1 text-gray-400 text-sm"> MIST</div>
            </div>,
        },
        {
            accessorKey: "commissionRate",
            header: "Commission Rate",
            cell: ({ row }) => <div className="capitalize font-bold">{(Number(row.getValue("commissionRate")) / 100)}%</div>,
        },
        {
            accessorKey: "apy",
            header: "APY",
            cell: ({ row }) => <div className="capitalize font-bold">{(Number(row.getValue("apy")) * 100).toFixed(2)}%</div>,
        },
    ], [])

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    })

    const table = useReactTable({
        data,
        columns,
        debugTable: true,
        manualPagination: false,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            pagination,
        },
    })

    return (
        <div className="my-7 p-7 bg-white rounded-lg shadow-lg">
            {(validators.length && !isLoading) &&
                <div className="w-full">
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                        >
                                            {row.getAllCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { console.log("Next page", table.getState().pagination.pageIndex + 1); table.nextPage() }}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </div>


    );
}