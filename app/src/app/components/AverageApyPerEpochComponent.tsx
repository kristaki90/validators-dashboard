"use client"

import * as React from "react"
import { Spinner } from "./ui/spinner"
import { useMemo, useState, useEffect, useRef } from "react"
import { AverageApyPerEpochPoint } from "../types/AverageApyPerEpoch"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"
import { SlArrowUp, SlArrowDown } from "react-icons/sl"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import * as d3 from "d3"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"

export default function AverageApyPerEpochComponent() {
    const lineChartRef = useRef<SVGSVGElement>(null)
    const barChartRef = useRef<SVGSVGElement>(null)
    const [data, setData] = useState<AverageApyPerEpochPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("table")

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    'https://sui-validators-dashboard.onrender.com/api/average_apy_per_epoch'
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const responseData: any = await response.json()

                // Handle different response formats
                let processedData: AverageApyPerEpochPoint[] = []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (Array.isArray(responseData)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = responseData.map((item: any) => ({
                        epoch: Number(item.epoch || item.Epoch || 0),
                        avgAPY: Number(item.avgAPY || item.avg_apy || item.average_apy || 0),
                    }))
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = responseData.data.map((item: any) => ({
                        epoch: Number(item.epoch || item.Epoch || 0),
                        avgAPY: Number(item.avgAPY || item.avg_apy || item.average_apy || 0),
                    }))
                }

                // Sort by epoch
                processedData.sort((a, b) => a.epoch - b.epoch)
                setData(processedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
                console.error("Error fetching average APY per epoch:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Render histogram
    useEffect(() => {
        if (!lineChartRef.current || data.length === 0) return
        if (activeTab !== "charts") return

        d3.select(lineChartRef.current).selectAll("*").remove()

        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        const svg = d3.select(lineChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        // Create bins for histogram
        const minApy = d3.min(data, (d: AverageApyPerEpochPoint) => d.avgAPY) || 0
        const maxApy = d3.max(data, (d: AverageApyPerEpochPoint) => d.avgAPY) || 10
        const numBins = 20
        const binWidth = (maxApy - minApy) / numBins

        // Create bins
        const bins: Array<{ x0: number; x1: number; count: number }> = []
        for (let i = 0; i < numBins; i++) {
            bins.push({
                x0: minApy + i * binWidth,
                x1: minApy + (i + 1) * binWidth,
                count: 0
            })
        }

        // Count values in each bin
        data.forEach((d: AverageApyPerEpochPoint) => {
            const binIndex = Math.min(Math.floor((d.avgAPY - minApy) / binWidth), numBins - 1)
            if (bins[binIndex]) {
                bins[binIndex].count++
            }
        })

        const maxCount = d3.max(bins, (d: { x0: number; x1: number; count: number }) => d.count) || 1

        const xScale = d3.scaleLinear()
            .domain([minApy, maxApy])
            .range([0, width])

        const yScale = d3.scaleLinear()
            .domain([0, maxCount])
            .nice()
            .range([height, 0])

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .tickSize(-height)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")

        svg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")

        // Create gradient for bars
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "histogramGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 0).attr("y2", height)

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#06b6d4")
            .attr("stop-opacity", 0.8)

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#3b82f6")
            .attr("stop-opacity", 0.8)

        // Add histogram bars
        svg.selectAll(".histogram-bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "histogram-bar")
            .attr("x", (d: { x0: number; x1: number; count: number }) => xScale(d.x0))
            .attr("width", (d: { x0: number; x1: number; count: number }) => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr("y", (d: { x0: number; x1: number; count: number }) => yScale(d.count))
            .attr("height", (d: { x0: number; x1: number; count: number }) => height - yScale(d.count))
            .attr("fill", "url(#histogramGradient)")
            .attr("rx", 2)
            .on("mouseover", function (this: SVGRectElement, event: MouseEvent, d: { x0: number; x1: number; count: number }) {
                d3.select(this)
                    .attr("opacity", 0.7)
                    .attr("stroke", "#06b6d4")
                    .attr("stroke-width", 2)

                const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)
                    .style("position", "absolute")
                    .style("background", "rgba(0, 0, 0, 0.8)")
                    .style("color", "white")
                    .style("padding", "8px 12px")
                    .style("border-radius", "6px")
                    .style("font-size", "12px")
                    .style("pointer-events", "none")
                    .style("z-index", "1000")

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1)

                tooltip.html(`APY Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br/>Count: ${d.count} epoch${d.count !== 1 ? 's' : ''}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
            })
            .on("mouseout", function (this: SVGRectElement) {
                d3.select(this)
                    .attr("opacity", 1)
                    .attr("stroke", "none")
                d3.selectAll(".tooltip").remove()
            })

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat((d: number | { valueOf(): number }) => `${Number(d).toFixed(1)}`))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add axis labels
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Frequency (Number of Epochs)")

        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Average APY Range")
    }, [data, activeTab])

    // Render bar chart
    useEffect(() => {
        if (!barChartRef.current || data.length === 0) return
        if (activeTab !== "charts") return

        d3.select(barChartRef.current).selectAll("*").remove()

        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        const svg = d3.select(barChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const xScale = d3.scaleBand()
            .domain(data.map((d: AverageApyPerEpochPoint) => d.epoch.toString()))
            .range([0, width])
            .padding(0.1)

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: AverageApyPerEpochPoint) => d.avgAPY) || 10] as [number, number])
            .nice()
            .range([height, 0])

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .tickSize(-height)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")

        svg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")

        // Create gradient for bars
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "barGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 0).attr("y2", height)

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#8b5cf6")
            .attr("stop-opacity", 0.8)

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#6366f1")
            .attr("stop-opacity", 0.8)

        // Add bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d: AverageApyPerEpochPoint) => xScale(d.epoch.toString()) || 0)
            .attr("width", xScale.bandwidth())
            .attr("y", (d: AverageApyPerEpochPoint) => yScale(d.avgAPY))
            .attr("height", (d: AverageApyPerEpochPoint) => height - yScale(d.avgAPY))
            .attr("fill", "url(#barGradient)")
            .attr("rx", 4)
            .on("mouseover", function (this: SVGRectElement, event: MouseEvent, d: AverageApyPerEpochPoint) {
                d3.select(this)
                    .attr("opacity", 0.7)
                    .attr("stroke", "#6366f1")
                    .attr("stroke-width", 2)

                const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)
                    .style("position", "absolute")
                    .style("background", "rgba(0, 0, 0, 0.8)")
                    .style("color", "white")
                    .style("padding", "8px 12px")
                    .style("border-radius", "6px")
                    .style("font-size", "12px")
                    .style("pointer-events", "none")
                    .style("z-index", "1000")

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1)

                tooltip.html(`Epoch: ${d.epoch}<br/>Avg APY: ${d.avgAPY.toFixed(2)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
            })
            .on("mouseout", function (this: SVGRectElement) {
                d3.select(this)
                    .attr("opacity", 1)
                    .attr("stroke", "none")
                d3.selectAll(".tooltip").remove()
            })

        // Add x-axis
        const xAxis = d3.axisBottom(xScale)
        // Only show every nth tick to avoid crowding
        const tickStep = Math.max(1, Math.floor(data.length / 20))
        xAxis.tickValues(data.filter((_, i) => i % tickStep === 0).map(d => d.epoch.toString()))

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "11px")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")

        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d: number | { valueOf(): number }) => `${Number(d).toFixed(2)}`))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add axis labels
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Average APY")

        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Epoch")
    }, [data, activeTab])

    const columns: ColumnDef<AverageApyPerEpochPoint>[] = React.useMemo(() => [
        {
            id: "epoch",
            accessorKey: "epoch",
            header: "Epoch",
            accessorFn: (row) => row.epoch,
            cell: ({ row }) => {
                return (
                    <div className="p-2 font-semibold text-slate-900">{row.original.epoch}</div>
                )
            },
            enableSorting: true,
        },
        {
            id: "avgAPY",
            accessorKey: "avgAPY",
            header: "Average APY",
            accessorFn: (row) => row.avgAPY,
            cell: ({ row }) => {
                const avgApy = row.original.avgAPY
                return (
                    <div className="p-2 font-semibold text-slate-900">{avgApy.toFixed(2)}</div>
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
        id: 'epoch',
        desc: false,
    }])

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
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

    return (
        <section className="my-10">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Average APY Per Epoch</p>
                            <h2 className="text-2xl font-bold text-slate-900">Network Average APY Over Time</h2>
                            <p className="text-sm text-slate-500 mt-1">View the average APY across all validators for each epoch.</p>
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

                    {!isLoading && !error && data.length > 0 && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
                            <TabsList orientation="horizontal" className="flex-shrink-0 bg-white/60 backdrop-blur rounded-2xl p-2 shadow-lg border border-slate-200/50 mb-6">
                                <TabsTrigger value="table" label="Table" orientation="horizontal" />
                                <TabsTrigger value="charts" label="Charts" orientation="horizontal" />
                            </TabsList>
                            <TabsContent value="table" className="min-w-0 flex-1">
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
                                                            className="bg-white transition hover:bg-indigo-50/60"
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
                            </TabsContent>
                            <TabsContent value="charts" className="min-w-0 flex-1">
                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                                        <div className="mb-6">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Value Comparison</p>
                                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Average APY by Epoch</h2>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Compare average APY values across individual epochs
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <svg ref={barChartRef} className="w-full"></svg>
                                        </div>
                                        <div className="text-xs text-slate-500 text-center mt-4">
                                            Showing {data.length} data point{data.length !== 1 ? 's' : ''} from epoch {data[0]?.epoch} to {data[data.length - 1]?.epoch}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                                        <div className="mb-6">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Distribution Analysis</p>
                                            <h2 className="mt-2 text-2xl font-bold text-slate-900">APY Value Distribution</h2>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Histogram showing how many epochs fall into each APY value range
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <svg ref={lineChartRef} className="w-full"></svg>
                                        </div>
                                        <div className="text-xs text-slate-500 text-center mt-4">
                                            Showing {data.length} data point{data.length !== 1 ? 's' : ''} from epoch {data[0]?.epoch} to {data[data.length - 1]?.epoch}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    {!isLoading && !error && data.length === 0 && (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                            No data available.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

