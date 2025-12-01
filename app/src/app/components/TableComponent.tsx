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
import { HiMagnifyingGlass } from "react-icons/hi2";

const getScoreBadge = (score: number) => {
    if (score >= 80) {
        return { label: "Elite", bg: "bg-emerald-100", text: "text-emerald-700" }
    }
    if (score >= 65) {
        return { label: "Strong", bg: "bg-blue-100", text: "text-blue-700" }
    }
    if (score >= 45) {
        return { label: "Stable", bg: "bg-amber-100", text: "text-amber-700" }
    }
    return { label: "Watch", bg: "bg-rose-100", text: "text-rose-700" }
}

export default function TableComponent() {
    const router = useRouter()

    const { validators, isLoading } = useGetLatestSuiSystemState();
    let data: Validator[] = validators;

    useEffect(() => {
        data = validators;
    }, [!validators]);

    const leaderboardStats = React.useMemo(() => {
        if (!validators?.length) {
            return {
                total: 0,
                topScore: 0,
                averageApy: 0,
            }
        }

        const total = validators.length;
        const topScore = Math.max(...validators.map((validator) => Number(validator.scoring ?? 0))) * 100;
        const averageApy = validators.reduce((sum, validator) => sum + Number(validator.apy ?? 0), 0) / total * 100;

        return {
            total,
            topScore: Number.isFinite(topScore) ? topScore : 0,
            averageApy: Number.isFinite(averageApy) ? averageApy : 0,
        }
    }, [validators]);

    const columns: ColumnDef<Validator>[] = React.useMemo(() => [
        {
            id: "rowNumber",
            header: "#",
            cell: ({ row, table }) => {
                const paginatedRows = table.getRowModel().rows;
                const rowIndexOnPage = paginatedRows.findIndex(
                    (paginatedRow) => paginatedRow.id === row.id,
                );
                const rowNumber = rowIndexOnPage + 1;
                return (
                    <div className="p-2 text-center font-semibold text-gray-500">
                        {rowNumber}
                    </div>
                );
            },
            enableSorting: false,
        },
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
                        <div className="font-bold flex items-center gap-2">
                            {truncateString(row.getValue("name"))}
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-500">
                                #{row.original.rank}
                            </span>
                        </div>
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
            cell: ({ row }) => {
                const scoreValue = Number(row.getValue("scoring")) * 100;
                const badge = getScoreBadge(scoreValue);
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{scoreValue.toFixed(2)}%</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                        </span>
                    </div>
                )
            },
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
            accessorKey: "stakeSharePercentage",
            header: "Pool Share %",
            cell: ({ row }) => (
                <div className="capitalize font-bold">
                    {(Number(row.getValue("stakeSharePercentage")) * 100).toFixed(2)}%
                </div>
            ),
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

    const isTableReady = Boolean(data.length) && !isLoading;

    return (
        <section className="my-10">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Validator Leaderboard</p>
                                <h2 className="text-2xl font-bold text-slate-900">Current Validator Snapshot</h2>
                                <p className="text-sm text-slate-500">Tap any row for a deeper validator profile.</p>
                            </div>
                            <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 shadow-lg">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-white/20 p-1.5 backdrop-blur">
                                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Top Score</p>
                                        </div>
                                        <p className="mt-2 text-3xl font-extrabold text-white">{leaderboardStats.topScore.toFixed(2)}%</p>
                                    </div>
                                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                                    <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 blur-xl"></div>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    Latest on-chain snapshot
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                className="pl-9 text-sm"
                                onChange={e => { setColumnFilters([{ id: 'name', value: truncateString(e.target.value) }]); }}
                                placeholder="Search by address or name..."
                            />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Showing top performers first</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-inner overflow-hidden">
                        {isTableReady ? (
                            <div className="max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-slate-50">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className="bg-slate-50">
                                                {headerGroup.headers.map((header) => {
                                                    return (
                                                        <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50">
                                                            {header.isPlaceholder ? null : (
                                                                <div
                                                                    className={
                                                                        header.column.getCanSort()
                                                                            ? 'cursor-pointer select-none flex items-center gap-2'
                                                                            : 'flex items-center gap-2'
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
                                                <TableRow
                                                    key={row.id}
                                                    onClick={() => handleRowClick(row)}
                                                    className="cursor-pointer bg-white transition hover:bg-indigo-50/60"
                                                >
                                                    {row.getAllCells().map((cell) => (
                                                        <TableCell key={cell.id} className="text-sm text-slate-700">
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
                                                    className="h-24 text-center text-sm text-slate-500"
                                                >
                                                    No results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                                {isLoading ? "Loading validator data..." : "Validator data unavailable."}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={"outline"}
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="rounded-full px-4"
                            >
                                Prev
                            </Button>
                            <Button
                                variant={"outline"}
                                onClick={() => { table.nextPage(); }}
                                disabled={!table.getCanNextPage()}
                                className="rounded-full px-4"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}