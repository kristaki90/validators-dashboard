"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Spinner } from "./ui/spinner"
import { ProphetPredictionPoint } from "../types/ProphetPredictions"

interface ProphetPredictionsComponentProps {
    address: string
}

export default function ProphetPredictionsComponent({ address }: ProphetPredictionsComponentProps) {
    const chartRef = useRef<SVGSVGElement>(null)
    const [predictionsData, setPredictionsData] = useState<ProphetPredictionPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPredictions = async () => {
            if (!address) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `https://sui-validators-dashboard.onrender.com/api/prophet_detailed_predictions_by_validator/${address}`
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch predictions: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()

                // Handle different response formats
                let processedData: ProphetPredictionPoint[] = []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = data.map((item: any) => ({
                        epoch: Number(item.epoch || item.Epoch || item.epochNumber || 0),
                        prediction: Number(item.predicted_apy || item.prediction || item.Prediction || item.predicted || item.value || 0),
                        lowerBound: item.lowerBound || item.lower_bound || item.lower || item.yhat_lower,
                        upperBound: item.upperBound || item.upper_bound || item.upper || item.yhat_upper,
                    }))
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } else if (data.data && Array.isArray(data.data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    processedData = data.data.map((item: any) => ({
                        epoch: Number(item.epoch || item.Epoch || item.epochNumber || 0),
                        prediction: Number(item.predicted_apy || item.prediction || item.Prediction || item.predicted || item.value || 0),
                        lowerBound: item.lowerBound || item.lower_bound || item.lower || item.yhat_lower,
                        upperBound: item.upperBound || item.upper_bound || item.upper || item.yhat_upper,
                    }))
                } else if (data.epoch && (data.predicted_apy !== undefined || data.prediction !== undefined)) {
                    processedData = [{
                        epoch: Number(data.epoch),
                        prediction: Number(data.predicted_apy || data.prediction),
                        lowerBound: data.lowerBound,
                        upperBound: data.upperBound,
                    }]
                }

                // Sort by epoch
                processedData.sort((a, b) => a.epoch - b.epoch)
                setPredictionsData(processedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching predictions')
                console.error("Error fetching predictions:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPredictions()
    }, [address])

    useEffect(() => {
        if (!chartRef.current || predictionsData.length === 0) return

        d3.select(chartRef.current).selectAll("*").remove()

        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        const svg = d3.select(chartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const xScale = d3.scaleLinear()
            .domain(d3.extent(predictionsData, (d: ProphetPredictionPoint) => d.epoch) as [number, number])
            .range([0, width])

        const maxValue = d3.max(predictionsData, (d: ProphetPredictionPoint) =>
            Math.max(d.prediction, d.upperBound || d.prediction)
        ) || 10

        const yScale = d3.scaleLinear()
            .domain([0, maxValue] as [number, number])
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

        // Draw confidence interval if available
        const hasConfidenceInterval = predictionsData.some(d => d.lowerBound !== undefined && d.upperBound !== undefined)
        if (hasConfidenceInterval) {
            const confidenceArea = d3.area()
                .x((d: ProphetPredictionPoint) => xScale(d.epoch))
                .y0((d: ProphetPredictionPoint) => yScale(d.lowerBound || d.prediction))
                .y1((d: ProphetPredictionPoint) => yScale(d.upperBound || d.prediction))
                .curve(d3.curveMonotoneX)

            svg.append("path")
                .datum(predictionsData)
                .attr("fill", "rgba(99, 102, 241, 0.1)")
                .attr("stroke", "none")
                .attr("d", confidenceArea)
        }

        // Create line generator for predictions
        const line = d3.line()
            .x((d: ProphetPredictionPoint) => xScale(d.epoch))
            .y((d: ProphetPredictionPoint) => yScale(d.prediction))
            .curve(d3.curveMonotoneX)

        // Draw prediction line
        svg.append("path")
            .datum(predictionsData)
            .attr("fill", "none")
            .attr("stroke", "#6366f1")
            .attr("stroke-width", 2.5)
            .attr("d", line)

        // Add dots for data points
        svg.selectAll(".dot")
            .data(predictionsData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d: ProphetPredictionPoint) => xScale(d.epoch))
            .attr("cy", (d: ProphetPredictionPoint) => yScale(d.prediction))
            .attr("r", 4)
            .attr("fill", "#6366f1")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", function (event: MouseEvent, d: ProphetPredictionPoint) {
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

                let tooltipText = `Epoch: ${d.epoch}<br/>Prediction: ${d.prediction.toFixed(2)}`
                if (d.lowerBound !== undefined && d.upperBound !== undefined) {
                    tooltipText += `<br/>Range: ${d.lowerBound.toFixed(2)} - ${d.upperBound.toFixed(2)}`
                }
                tooltip.html(tooltipText)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
            })
            .on("mouseout", function () {
                d3.selectAll(".tooltip").remove()
            })

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

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
            .text("Predicted APY")

        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Epoch")
    }, [predictionsData])

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

    if (predictionsData.length === 0) {
        return (
            <div className="my-10">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500 shadow-2xl">
                    <p className="text-lg font-semibold">Predictions Chart</p>
                    <p className="mt-2 text-sm">No predictions data available for this validator.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="my-10">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Predictions</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Future Predictions</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Forecasted values using time series forecasting
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <svg ref={chartRef} className="w-full"></svg>
                </div>
                <div className="text-xs text-slate-500 text-center mt-4">
                    Showing {predictionsData.length} prediction{predictionsData.length !== 1 ? 's' : ''} from epoch {predictionsData[0]?.epoch} to {predictionsData[predictionsData.length - 1]?.epoch}
                </div>
            </div>
        </div>
    )
}

