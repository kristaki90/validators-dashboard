"use client"

import * as React from "react"
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    ColumnFiltersState
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
import Image from "next/image";
import { Input } from "./ui/input";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function TableComponent() {
    const router = useRouter()

    const { validators, isLoading } = useGetLatestSuiSystemState();
    let data: Validator[] = validators;

    useEffect(() => {
        data = validators;
    }, [!validators]);

    const columns: ColumnDef<Validator>[] = React.useMemo(() => [
        {
            accessorKey: "name",
            header: "Validator",
            accessorFn: (row) => row?.name?.toString(),
            filterFn: (row, id, filterValue) => {
                const name = row.original.name?.toLowerCase() ?? "";
                const address = row.original.address?.toLowerCase() ?? "";
                const value = (filterValue ?? "").toLowerCase();
                return name.includes(value) || address.includes(value);
            },
            cell: ({ row }) => (
                <div className="p-2 flex flex-row w-full justify-left items-end">
                    {row.original.imageUrl && (
                        <Image
                            src={row.original.imageUrl}
                            alt={row.original.name}
                            className="rounded-full mr-4"
                            width={40}
                            height={40}
                        />
                    )}
                    <div className="p-2 flex flex-col w-full justify-left items-start">
                        <div className="font-bold">{truncateString(row.getValue("name"))}</div>
                        <div className="lowercase">{truncateString(row.original.address)}</div>
                    </div>
                </div>
            ),
            enableSorting: false,
            // enableManualFiltering: true,
        },
        {
            accessorKey: "scoring",
            header: "Scoring",
            cell: ({ row }) => <div className="capitalize font-bold">{(Number(row.getValue("scoring")) * 100).toFixed(2)}%</div>,
            enableSorting: true,
        },
        {
            accessorKey: "stake",
            header: "Stake",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{Math.round(mistToSui(row.getValue("stake"))).toLocaleString()}</div>
                <div className="ml-1 text-gray-400 text-sm"> SUI</div>
            </div >,
            enableSorting: true,
        },
        {
            accessorKey: "nextEpochStake",
            header: "Next Epoch Stake",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{Math.round(mistToSui(row.getValue("nextEpochStake"))).toLocaleString()}</div>
                <div className="ml-1 text-gray-400 text-sm"> SUI</div>
            </div>,
            enableSorting: true,
        },
        {
            accessorKey: "currentEpochGasPrice",
            header: "Current Epoch Gas Price",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{row.getValue("currentEpochGasPrice")}</div>
                <div className="ml-1 text-gray-400 text-sm"> MIST</div>
            </div>,
            enableSorting: true,
        },
        {
            accessorKey: "nextEpochGasPrice",
            header: "Next Epoch Gas Price",
            cell: ({ row }) => <div className="p-2 flex flex-row w-full justify-left items-end">
                <div className="capitalize font-bold">{row.getValue("nextEpochGasPrice")}</div>
                <div className="ml-1 text-gray-400 text-sm"> MIST</div>
            </div>,
            enableSorting: true,
        },
        {
            accessorKey: "commissionRate",
            header: "Commission Rate",
            cell: ({ row }) => <div className="capitalize font-bold">{(Number(row.getValue("commissionRate")) / 100)}%</div>,
            enableSorting: true,
        },
        {
            accessorKey: "apy",
            header: "APY",
            cell: ({ row }) => <div className="capitalize font-bold">{(Number(row.getValue("apy")) * 100).toFixed(2)}%</div>,
            enableSorting: true,
        },
    ], [])

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    })

    const [sorting, setSorting] = React.useState<SortingState>([{
        id: 'scoring',
        desc: true,
    }])

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        debugTable: true,
        manualPagination: false,
        manualFiltering: false,
        autoResetAll: true,
        initialState: { pagination, sorting },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            pagination,
            sorting,
            columnFilters,
        },
    })

    const handleRowClick = (row: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log(row.original.address)
        router.push(`validator/${row.original.address}`);
    }


    return (
        <div className="my-7 p-7 bg-white rounded-lg shadow-lg">
            {(data.length && !isLoading) &&
                <div className="w-full">
                    <div className="w-full mb-2 flex flex-row justify-end">
                        <Input
                            onChange={e => { setColumnFilters([{ id: 'name', value: truncateString(e.target.value) }]); }}
                            placeholder=" Search by address or name..."
                        />
                    </div>

                    <div className="w-full">
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={
                                                                    header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none'
                                                                        : ''
                                                                }
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                title={
                                                                    header.column.getCanSort()
                                                                        ? header.column.getNextSortingOrder() === 'asc'
                                                                            ? 'Sort ascending'
                                                                            : header.column.getNextSortingOrder() === 'desc'
                                                                                ? 'Sort descending'
                                                                                : 'Clear sort'
                                                                        : undefined
                                                                }
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {{
                                                                    asc: <SlArrowUp />,
                                                                    desc: <SlArrowDown />,
                                                                }[header.column.getIsSorted() as string] ?? null}

                                                            </div>
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
                                            <TableRow key={row.id} onClick={() => handleRowClick(row)}>
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
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={"outline"}
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        {'<'}
                                    </Button>
                                    <Button
                                        variant={"outline"}
                                        onClick={() => { table.nextPage(); }}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        {'>'}
                                    </Button>
                                    <span className="flex items-center gap-1">
                                        <div>Page</div>
                                        <strong>
                                            {table.getState().pagination.pageIndex + 1} of{' '}
                                            {table.getPageCount().toLocaleString()}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            }
        </div>
    );
}