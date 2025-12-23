"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Spinner } from "./ui/spinner"
import { ApyDataPoint } from "../types/ApyData"

interface ApyChartComponentProps {
    address: string
}

export default function ApyChartComponent({ address }: ApyChartComponentProps) {
    const areaChartRef = useRef<SVGSVGElement>(null)
    const [apyData, setApyData] = useState<ApyDataPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchApyData = async () => {
            if (!address) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `https://sui-validators-dashboard.onrender.com/api/apy_for_validator/${address}`
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch APY data: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()

                // Handle different response formats
                let processedData: ApyDataPoint[] = []
                if (Array.isArray(data)) {
                    processedData = data.map((item: any) => ({
                        epoch: Number(item.epoch || item.epochNumber || 0),
                        apy: Number(item.apy || item.apyValue || 0), // Use value as-is, round to 2 decimals
                    }))
                } else if (data.data && Array.isArray(data.data)) {
                    processedData = data.data.map((item: any) => ({
                        epoch: Number(item.epoch || item.epochNumber || 0),
                        apy: Number(item.apy || item.apyValue || 0),
                    }))
                } else if (data.epoch && data.apy !== undefined) {
                    // Single data point
                    processedData = [{
                        epoch: Number(data.epoch),
                        apy: Number(data.apy),
                    }]
                }

                // Sort by epoch
                processedData.sort((a, b) => a.epoch - b.epoch)
                setApyData(processedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching APY data')
                console.error("Error fetching APY data:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchApyData()
    }, [address])

    useEffect(() => {
        if (!areaChartRef.current || apyData.length === 0) return

        // Clear previous chart
        d3.select(areaChartRef.current).selectAll("*").remove()

        // Set up dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        // Create SVG for area chart
        const areaSvg = d3
            .select(areaChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        // Set up scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(apyData, (d) => d.epoch) as [number, number])
            .range([0, width])

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(apyData, (d) => d.apy) || 10] as [number, number])
            .nice()
            .range([height, 0])

        // Create line generator
        const line = d3
            .line<ApyDataPoint>()
            .x((d) => xScale(d.epoch))
            .y((d) => yScale(d.apy))
            .curve(d3.curveMonotoneX)

        // Helper function to add tooltip
        const addTooltip = (event: MouseEvent, d: ApyDataPoint) => {
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

            tooltip.html(`Epoch: ${d.epoch}<br/>APY: ${Number(d.apy).toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")

            return tooltip
        }

        // ===== AREA CHART =====
        // Create area generator
        const area = d3
            .area<ApyDataPoint>()
            .x((d) => xScale(d.epoch))
            .y0(height) // Bottom of the area (baseline)
            .y1((d) => yScale(d.apy)) // Top of the area (data value)
            .curve(d3.curveMonotoneX)

        // Add grid lines
        areaSvg.append("g")
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

        areaSvg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")

        // Add the area path with gradient
        const gradient = areaSvg.append("defs")
            .append("linearGradient")
            .attr("id", "areaGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 0).attr("y2", height)

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#6366f1")
            .attr("stop-opacity", 0.3)

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#6366f1")
            .attr("stop-opacity", 0.05)

        areaSvg.append("path")
            .datum(apyData)
            .attr("fill", "url(#areaGradient)")
            .attr("d", area)

        // Add the line on top of the area
        areaSvg.append("path")
            .datum(apyData)
            .attr("fill", "none")
            .attr("stroke", "#6366f1")
            .attr("stroke-width", 2.5)
            .attr("d", line)

        // Add dots for data points
        areaSvg.selectAll(".dot")
            .data(apyData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.epoch))
            .attr("cy", (d) => yScale(d.apy))
            .attr("r", 4)
            .attr("fill", "#6366f1")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", function (event, d) {
                addTooltip(event as MouseEvent, d)
            })
            .on("mouseout", function () {
                d3.selectAll(".tooltip").remove()
            })

        // Add x-axis
        areaSvg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add y-axis
        areaSvg.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d) => `${Number(d).toFixed(2)}`))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add axis labels
        areaSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("APY")

        areaSvg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Epoch")
    }, [apyData])

    if (isLoading) {
        return (
            <div className="my-10">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl">
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="my-10">
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
            </div>
        )
    }

    if (apyData.length === 0) {
        return (
            <div className="my-10">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500 shadow-2xl">
                    <p className="text-lg font-semibold">APY Chart</p>
                    <p className="mt-2 text-sm">No APY data available for this validator.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="my-10">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">APY Analytics</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">APY Over Time</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Historical APY performance across epochs
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <svg ref={areaChartRef} className="w-full"></svg>
                </div>
                <div className="mt-4 text-xs text-slate-500 text-center">
                    Showing {apyData.length} data point{apyData.length !== 1 ? 's' : ''} from epoch {apyData[0]?.epoch} to {apyData[apyData.length - 1]?.epoch}
                </div>
            </div>
        </div>
    )
}

