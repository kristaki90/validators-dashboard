"use client"

import * as React from "react"
import { Spinner } from "./ui/spinner"
import { useMemo, useState, useEffect } from "react"
import { Button } from "./ui/button"
import { useGetLatestSuiSystemState } from "../hooks/useGetLatestSuiSystemState"
import { ValidatorPrediction } from "../types/AllValidatorsPredictions"
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
    ColumnFiltersState,
    Row
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"
import { SlArrowUp, SlArrowDown } from "react-icons/sl"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { truncateString } from "@/app/helpers/truncateString"

const ValidatorImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
    const [imageError, setImageError] = useState(false)

    if (imageError || !imageUrl) {
        return null
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            className="rounded-full mr-4 flex-shrink-0"
            width={40}
            height={40}
            onError={() => setImageError(true)}
        />
    )
}

export default function AllValidatorsPredictionsComponent() {
    const router = useRouter()
    const [predictionsData, setPredictionsData] = useState<ValidatorPrediction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { validators } = useGetLatestSuiSystemState()

    useEffect(() => {
        const fetchPredictions = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    'https://sui-validators-dashboard.onrender.com/api/prophet_predictions_for_all_validators'
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch predictions: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()

                // Handle different response formats
                let processedData: ValidatorPrediction[] = []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = data.map((item: any) => ({
                        validator_name: item.validator_name || '',
                        validator_address: item.validator_address || '',
                        mean_predicted_apy: Number(item.mean_predicted_apy || 0),
                        min_predicted_apy: Number(item.min_predicted_apy || 0),
                        max_predicted_apy: Number(item.max_predicted_apy || 0),
                        last_APY: Number(item.last_APY || item.last_apy || 0),
                    }))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } else if (data.results && Array.isArray(data.results)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = data.results.map((item: any) => ({
                        validator_name: item.validator_name || '',
                        validator_address: item.validator_address || '',
                        mean_predicted_apy: Number(item.mean_predicted_apy || 0),
                        min_predicted_apy: Number(item.min_predicted_apy || 0),
                        max_predicted_apy: Number(item.max_predicted_apy || 0),
                        last_APY: Number(item.last_APY || item.last_apy || 0),
                    }))
                }

                setPredictionsData(processedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching predictions')
                console.error("Error fetching predictions:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPredictions()
    }, [])

    // Enrich results with validator images
    const enrichedResults = useMemo(() => {
        if (!predictionsData || !validators) {
            return []
        }

        return predictionsData
            .filter((result) => result && result.validator_address)
            .map((result) => {
                const validator = validators.find((v) => v.address === result.validator_address)
                return {
                    ...result,
                    name: validator?.name || result.validator_name || truncateString(result.validator_address),
                    imageUrl: validator?.imageUrl || '',
                }
            })
    }, [predictionsData, validators])

    const columns: ColumnDef<ValidatorPrediction & { name: string; imageUrl: string }>[] = React.useMemo(() => [
        {
            accessorKey: "name",
            header: "Validator",
            cell: ({ row }) => {
                const validator = row.original
                return (
                    <div className="p-2 flex flex-row w-full justify-left items-start min-w-0">
                        <ValidatorImage imageUrl={validator.imageUrl} name={validator.name} />
                        <div className="p-2 flex flex-col w-full justify-left items-start min-w-0">
                            <div className="font-bold truncate w-full">{validator.name}</div>
                            <div className="lowercase truncate w-full text-sm text-gray-500">{truncateString(validator.validator_address)}</div>
                        </div>
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            id: "mean_predicted_apy",
            accessorKey: "mean_predicted_apy",
            header: "Mean Predicted APY",
            accessorFn: (row) => row.mean_predicted_apy,
            cell: ({ row }) => {
                const meanApy = row.original.mean_predicted_apy
                return (
                    <div className="p-2 font-bold">{meanApy.toFixed(2)}</div>
                )
            },
            enableSorting: true,
        },
        {
            id: "min_predicted_apy",
            accessorKey: "min_predicted_apy",
            header: "Min Predicted APY",
            accessorFn: (row) => row.min_predicted_apy,
            cell: ({ row }) => {
                const minApy = row.original.min_predicted_apy
                return (
                    <div className="p-2 font-bold">{minApy.toFixed(2)}</div>
                )
            },
            enableSorting: true,
        },
        {
            id: "max_predicted_apy",
            accessorKey: "max_predicted_apy",
            header: "Max Predicted APY",
            accessorFn: (row) => row.max_predicted_apy,
            cell: ({ row }) => {
                const maxApy = row.original.max_predicted_apy
                return (
                    <div className="p-2 font-bold">{maxApy.toFixed(2)}</div>
                )
            },
            enableSorting: true,
        },
        {
            id: "last_APY",
            accessorKey: "last_APY",
            header: "Last APY",
            accessorFn: (row) => row.last_APY,
            cell: ({ row }) => {
                const lastApy = row.original.last_APY
                return (
                    <div className="p-2 font-bold">{lastApy.toFixed(2)}</div>
                )
            },
            enableSorting: true,
        },
    ], [])

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    })

    const [sorting, setSorting] = React.useState<SortingState>([{
        id: 'mean_predicted_apy',
        desc: true,
    }])

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data: enrichedResults,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            columnFilters,
        },
    })

    const handleRowClick = (row: Row<ValidatorPrediction & { name: string; imageUrl: string }>) => {
        router.push(`validator/${row.original.validator_address}`)
    }

    return (
        <section className="my-10">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">All Validators Predictions</p>
                            <h2 className="text-2xl font-bold text-slate-900">Future APY Predictions</h2>
                            <p className="text-sm text-slate-500 mt-1">View predicted APY values for all validators based on time series forecasting.</p>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-900 mb-1">Error</h3>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && enrichedResults.length > 0 && (
                        <>
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-inner overflow-hidden">
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
                        </>
                    )}

                    {!isLoading && !error && enrichedResults.length === 0 && (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                            No predictions data available.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

