"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Spinner } from "./ui/spinner"
import { ApyDataPoint } from "../types/ApyData"
import { StakeDataPoint } from "../types/StakeData"
import { PoolShareDataPoint } from "../types/PoolShareData"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { mistToSui } from "../helpers/suiConversion"

interface ApyChartComponentProps {
    address: string
}

type DataPoint = ApyDataPoint | StakeDataPoint | PoolShareDataPoint

export default function ApyChartComponent({ address }: ApyChartComponentProps) {
    const apyAreaChartRef = useRef<SVGSVGElement>(null)
    const apyContourChartRef = useRef<SVGSVGElement>(null)
    const stakeAreaChartRef = useRef<SVGSVGElement>(null)
    const poolShareAreaChartRef = useRef<SVGSVGElement>(null)

    const [apyData, setApyData] = useState<ApyDataPoint[]>([])
    const [stakeData, setStakeData] = useState<StakeDataPoint[]>([])
    const [poolShareData, setPoolShareData] = useState<PoolShareDataPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeChartTab, setActiveChartTab] = useState("apy")

    useEffect(() => {
        const fetchAllData = async () => {
            if (!address) return

            setIsLoading(true)
            setError(null)

            try {
                // Fetch APY data
                const apyResponse = await fetch(
                    `https://sui-validators-dashboard.onrender.com/api/apy_for_validator/${address}`
                )
                if (apyResponse.ok) {
                    const apyData = await apyResponse.json()
                    let processedApy: ApyDataPoint[] = []
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (Array.isArray(apyData)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedApy = apyData.map((item: any) => ({
                            epoch: Number(item.epoch || item.epochNumber || 0),
                            apy: Number(item.apy || item.apyValue || 0),
                        }))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } else if (apyData.data && Array.isArray(apyData.data)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedApy = apyData.data.map((item: any) => ({
                            epoch: Number(item.epoch || item.epochNumber || 0),
                            apy: Number(item.apy || item.apyValue || 0),
                        }))
                    } else if (apyData.epoch && apyData.apy !== undefined) {
                        processedApy = [{
                            epoch: Number(apyData.epoch),
                            apy: Number(apyData.apy),
                        }]
                    }
                    processedApy.sort((a, b) => a.epoch - b.epoch)
                    setApyData(processedApy)
                }

                // Fetch Stake data
                const stakeResponse = await fetch(
                    `https://sui-validators-dashboard.onrender.com/api/stake_for_validator/${address}`
                )
                if (stakeResponse.ok) {
                    const stakeData = await stakeResponse.json()
                    let processedStake: StakeDataPoint[] = []
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (Array.isArray(stakeData)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedStake = stakeData.map((item: any) => ({
                            epoch: Number(item.Epoch || item.epoch || item.epochNumber || 0),
                            stake: mistToSui(Number(item.Stake || item.stake || item.stakeValue || 0)),
                        }))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } else if (stakeData.data && Array.isArray(stakeData.data)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedStake = stakeData.data.map((item: any) => ({
                            epoch: Number(item.Epoch || item.epoch || item.epochNumber || 0),
                            stake: mistToSui(Number(item.Stake || item.stake || item.stakeValue || 0)),
                        }))
                    } else if ((stakeData.Epoch || stakeData.epoch) && (stakeData.Stake !== undefined || stakeData.stake !== undefined)) {
                        processedStake = [{
                            epoch: Number(stakeData.Epoch || stakeData.epoch),
                            stake: mistToSui(Number(stakeData.Stake || stakeData.stake)),
                        }]
                    }
                    processedStake.sort((a, b) => a.epoch - b.epoch)
                    setStakeData(processedStake)
                }

                // Fetch Pool Share data
                const poolShareResponse = await fetch(
                    `https://sui-validators-dashboard.onrender.com/api/pool_share_for_validator/${address}`
                )
                if (poolShareResponse.ok) {
                    const poolShareData = await poolShareResponse.json()
                    let processedPoolShare: PoolShareDataPoint[] = []
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (Array.isArray(poolShareData)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedPoolShare = poolShareData.map((item: any) => ({
                            epoch: Number(item.Epoch || item.epoch || item.epochNumber || 0),
                            poolShare: Number(item["pool share %"] || item.poolShare || item.poolShareValue || item.poolSharePercentage || 0),
                        }))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } else if (poolShareData.data && Array.isArray(poolShareData.data)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        processedPoolShare = poolShareData.data.map((item: any) => ({
                            epoch: Number(item.Epoch || item.epoch || item.epochNumber || 0),
                            poolShare: Number(item["pool share %"] || item.poolShare || item.poolShareValue || item.poolSharePercentage || 0),
                        }))
                    } else if ((poolShareData.Epoch || poolShareData.epoch) && (poolShareData["pool share %"] !== undefined || poolShareData.poolShare !== undefined)) {
                        processedPoolShare = [{
                            epoch: Number(poolShareData.Epoch || poolShareData.epoch),
                            poolShare: Number(poolShareData["pool share %"] || poolShareData.poolShare),
                        }]
                    }
                    processedPoolShare.sort((a, b) => a.epoch - b.epoch)
                    setPoolShareData(processedPoolShare)
                }

                setIsLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching chart data')
                console.error("Error fetching chart data:", err)
                setIsLoading(false)
            }
        }

        fetchAllData()
    }, [address])

    useEffect(() => {
        if (!apyAreaChartRef.current || !apyContourChartRef.current || apyData.length === 0) return
        if (activeChartTab !== "apy") return // Only render when tab is active

        // Clear previous charts
        d3.select(apyAreaChartRef.current).selectAll("*").remove()
        d3.select(apyContourChartRef.current).selectAll("*").remove()

        // Set up dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        // Create SVG for area chart
        const areaSvg = d3
            .select(apyAreaChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        // Set up scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(apyData, (d: ApyDataPoint) => d.epoch) as [number, number])
            .range([0, width])

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(apyData, (d: ApyDataPoint) => d.apy) || 10] as [number, number])
            .nice()
            .range([height, 0])

        // Create line generator
        const line = d3
            .line()
            .x((d: ApyDataPoint) => xScale(d.epoch))
            .y((d: ApyDataPoint) => yScale(d.apy))
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
            .area()
            .x((d: ApyDataPoint) => xScale(d.epoch))
            .y0(height) // Bottom of the area (baseline)
            .y1((d: ApyDataPoint) => yScale(d.apy)) // Top of the area (data value)
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
            .attr("cx", (d: ApyDataPoint) => xScale(d.epoch))
            .attr("cy", (d: ApyDataPoint) => yScale(d.apy))
            .attr("r", 4)
            .attr("fill", "#6366f1")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", function (event: MouseEvent, d: ApyDataPoint) {
                addTooltip(event, d)
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
            .call(d3.axisLeft(yScale).tickFormat((d: number | { valueOf(): number }) => `${Number(d).toFixed(2)}`))
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

        // ===== CONTOUR CHART =====
        const contourSvg = d3
            .select(apyContourChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        // Create color scale for contours
        const minApy = d3.min(apyData, (d: ApyDataPoint) => d.apy) || 0
        const maxApy = d3.max(apyData, (d: ApyDataPoint) => d.apy) || 10
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([minApy, maxApy])

        // Create contour levels
        const numLevels = 20
        const contourLevels = d3.range(numLevels + 1).map((i: number) =>
            minApy + (maxApy - minApy) * (i / numLevels)
        )

        // Create interpolated data for smoother contours
        const interpolatedData: Array<{ epoch: number; apy: number }> = []
        for (let i = 0; i < apyData.length - 1; i++) {
            const current = apyData[i]
            const next = apyData[i + 1]
            const steps = 10
            for (let j = 0; j <= steps; j++) {
                const t = j / steps
                interpolatedData.push({
                    epoch: current.epoch + (next.epoch - current.epoch) * t,
                    apy: current.apy + (next.apy - current.apy) * t,
                })
            }
        }

        // Create grid for contour plot
        const gridSize = 50
        const epochRange = d3.extent(apyData, (d: ApyDataPoint) => d.epoch) as [number, number]
        const epochStep = (epochRange[1] - epochRange[0]) / gridSize
        const apyStep = (maxApy - minApy) / gridSize

        // Create scales for contour
        const contourXScale = d3
            .scaleLinear()
            .domain(epochRange)
            .range([0, width])

        const contourYScale = d3
            .scaleLinear()
            .domain([minApy, maxApy])
            .range([height, 0])

        // Create smoother contour visualization using marching squares approach
        // Draw filled contour bands
        for (let i = 0; i < contourLevels.length - 1; i++) {
            const levelMin = contourLevels[i]
            const levelMax = contourLevels[i + 1]
            const midLevel = (levelMin + levelMax) / 2
            const color = colorScale(midLevel)

            // Create a grid of cells and fill those within the contour level
            for (let epochIdx = 0; epochIdx < gridSize; epochIdx++) {
                const epoch1 = epochRange[0] + epochIdx * epochStep
                const epoch2 = epochRange[0] + (epochIdx + 1) * epochStep

                for (let apyIdx = 0; apyIdx < gridSize; apyIdx++) {
                    const apy1 = minApy + apyIdx * apyStep
                    const apy2 = minApy + (apyIdx + 1) * apyStep

                    // Get interpolated value for this cell
                    const cellEpoch = (epoch1 + epoch2) / 2
                    const cellApy = (apy1 + apy2) / 2

                    let cellValue = minApy
                    if (interpolatedData.length > 0) {
                        const closest = interpolatedData.reduce((prev, curr) =>
                            Math.abs(curr.epoch - cellEpoch) < Math.abs(prev.epoch - cellEpoch) ? curr : prev
                        )
                        cellValue = closest.apy
                    }

                    // Check if this cell is within the contour level
                    if (cellValue >= levelMin && cellValue < levelMax) {
                        contourSvg.append("rect")
                            .attr("x", contourXScale(epoch1))
                            .attr("y", contourYScale(apy2))
                            .attr("width", contourXScale(epoch2) - contourXScale(epoch1))
                            .attr("height", contourYScale(apy1) - contourYScale(apy2))
                            .attr("fill", color)
                            .attr("opacity", 0.7)
                            .attr("stroke", "none")
                    }
                }
            }
        }


        // Add grid lines
        contourSvg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(contourXScale)
                    .tickSize(-height)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.5)

        contourSvg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(contourYScale)
                    .tickSize(-width)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.5)

        // Add x-axis
        contourSvg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(contourXScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add y-axis
        contourSvg.append("g")
            .call(d3.axisLeft(contourYScale).tickFormat((d: number | { valueOf(): number }) => `${Number(d).toFixed(2)}`))
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "12px")

        // Add axis labels
        contourSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("APY")

        contourSvg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "#374151")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Epoch")

        // Add color legend
        const legendWidth = 20
        const legendHeight = height
        const legendX = width + 10

        const legendScale = d3.scaleLinear()
            .domain([minApy, maxApy])
            .range([legendHeight, 0])

        const legendAxis = d3.axisRight(legendScale)
            .tickFormat((d: number | { valueOf(): number }) => `${Number(d).toFixed(2)}`)
            .ticks(5)

        const legendGradient = contourSvg.append("defs")
            .append("linearGradient")
            .attr("id", "legendGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", legendHeight)
            .attr("x2", 0).attr("y2", 0)

        const numStops = 10
        for (let i = 0; i <= numStops; i++) {
            const value = minApy + (maxApy - minApy) * (i / numStops)
            legendGradient.append("stop")
                .attr("offset", `${(i / numStops) * 100}%`)
                .attr("stop-color", colorScale(value))
        }

        contourSvg.append("rect")
            .attr("x", legendX)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("fill", "url(#legendGradient)")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-width", 1)

        contourSvg.append("g")
            .attr("transform", `translate(${legendX + legendWidth}, 0)`)
            .call(legendAxis)
            .selectAll("text")
            .style("fill", "#6b7280")
            .style("font-size", "11px")
    }, [apyData, activeChartTab])

    // Render Stake chart
    useEffect(() => {
        if (!stakeAreaChartRef.current || stakeData.length === 0) return
        if (activeChartTab !== "stake") return // Only render when tab is active

        d3.select(stakeAreaChartRef.current).selectAll("*").remove()

        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        const areaSvg = d3.select(stakeAreaChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const xScale = d3.scaleLinear()
            .domain(d3.extent(stakeData, (d: StakeDataPoint) => d.epoch) as [number, number])
            .range([0, width])

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(stakeData, (d: StakeDataPoint) => d.stake) || 1000000] as [number, number])
            .nice()
            .range([height, 0])

        const line = d3.line()
            .x((d: StakeDataPoint) => xScale(d.epoch))
            .y((d: StakeDataPoint) => yScale(d.stake))
            .curve(d3.curveMonotoneX)

        const area = d3.area()
            .x((d: StakeDataPoint) => xScale(d.epoch))
            .y0(height)
            .y1((d: StakeDataPoint) => yScale(d.stake))
            .curve(d3.curveMonotoneX)

        // Grid and axes (similar to APY chart)
        areaSvg.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
            .selectAll("line").attr("stroke", "#e5e7eb").attr("stroke-dasharray", "3,3")

        areaSvg.append("g").attr("class", "grid")
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ""))
            .selectAll("line").attr("stroke", "#e5e7eb").attr("stroke-dasharray", "3,3")

        const gradient = areaSvg.append("defs").append("linearGradient")
            .attr("id", "stakeAreaGradient").attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", height)

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.3)
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0.05)

        areaSvg.append("path").datum(stakeData).attr("fill", "url(#stakeAreaGradient)").attr("d", area)
        areaSvg.append("path").datum(stakeData).attr("fill", "none").attr("stroke", "#10b981")
            .attr("stroke-width", 2.5).attr("d", line)

        areaSvg.selectAll(".dot").data(stakeData).enter().append("circle")
            .attr("cx", (d: StakeDataPoint) => xScale(d.epoch))
            .attr("cy", (d: StakeDataPoint) => yScale(d.stake))
            .attr("r", 4).attr("fill", "#10b981").attr("stroke", "#fff").attr("stroke-width", 2)
            .on("mouseover", function (event: MouseEvent, d: StakeDataPoint) {
                const tooltip = d3.select("body").append("div").attr("class", "tooltip")
                    .style("opacity", 0).style("position", "absolute")
                    .style("background", "rgba(0, 0, 0, 0.8)").style("color", "white")
                    .style("padding", "8px 12px").style("border-radius", "6px")
                    .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000")
                tooltip.transition().duration(200).style("opacity", 1)
                tooltip.html(`Epoch: ${d.epoch}<br/>Stake: ${d.stake.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px")
            })
            .on("mouseout", () => d3.selectAll(".tooltip").remove())

        areaSvg.append("g").attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text").style("fill", "#6b7280").style("font-size", "12px")

        areaSvg.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d: number | { valueOf(): number }) => `${(Number(d) / 1000).toFixed(0)}K`))
            .selectAll("text").style("fill", "#6b7280").style("font-size", "12px")

        areaSvg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2)).attr("dy", "1em")
            .style("text-anchor", "middle").style("fill", "#374151")
            .style("font-size", "14px").style("font-weight", "600").text("Stake (SUI)")

        areaSvg.append("text").attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle").style("fill", "#374151")
            .style("font-size", "14px").style("font-weight", "600").text("Epoch")
    }, [stakeData, activeChartTab])

    // Render Pool Share chart
    useEffect(() => {
        if (!poolShareAreaChartRef.current || poolShareData.length === 0) return
        if (activeChartTab !== "poolShare") return // Only render when tab is active

        d3.select(poolShareAreaChartRef.current).selectAll("*").remove()

        const margin = { top: 20, right: 30, bottom: 50, left: 60 }
        const width = 800 - margin.left - margin.right
        const height = 400 - margin.top - margin.bottom

        const areaSvg = d3.select(poolShareAreaChartRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform", `translate(${margin.left},${margin.top})`)

        const xScale = d3.scaleLinear()
            .domain(d3.extent(poolShareData, (d: PoolShareDataPoint) => d.epoch) as [number, number])
            .range([0, width])

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(poolShareData, (d: PoolShareDataPoint) => d.poolShare) || 1] as [number, number])
            .nice().range([height, 0])

        const line = d3.line()
            .x((d: PoolShareDataPoint) => xScale(d.epoch))
            .y((d: PoolShareDataPoint) => yScale(d.poolShare))
            .curve(d3.curveMonotoneX)

        const area = d3.area()
            .x((d: PoolShareDataPoint) => xScale(d.epoch))
            .y0(height).y1((d: PoolShareDataPoint) => yScale(d.poolShare))
            .curve(d3.curveMonotoneX)

        areaSvg.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
            .selectAll("line").attr("stroke", "#e5e7eb").attr("stroke-dasharray", "3,3")

        areaSvg.append("g").attr("class", "grid")
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ""))
            .selectAll("line").attr("stroke", "#e5e7eb").attr("stroke-dasharray", "3,3")

        const gradient = areaSvg.append("defs").append("linearGradient")
            .attr("id", "poolShareAreaGradient").attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", height)

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.3)
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.05)

        areaSvg.append("path").datum(poolShareData).attr("fill", "url(#poolShareAreaGradient)").attr("d", area)
        areaSvg.append("path").datum(poolShareData).attr("fill", "none").attr("stroke", "#f59e0b")
            .attr("stroke-width", 2.5).attr("d", line)

        areaSvg.selectAll(".dot").data(poolShareData).enter().append("circle")
            .attr("cx", (d: PoolShareDataPoint) => xScale(d.epoch))
            .attr("cy", (d: PoolShareDataPoint) => yScale(d.poolShare))
            .attr("r", 4).attr("fill", "#f59e0b").attr("stroke", "#fff").attr("stroke-width", 2)
            .on("mouseover", function (event: MouseEvent, d: PoolShareDataPoint) {
                const tooltip = d3.select("body").append("div").attr("class", "tooltip")
                    .style("opacity", 0).style("position", "absolute")
                    .style("background", "rgba(0, 0, 0, 0.8)").style("color", "white")
                    .style("padding", "8px 12px").style("border-radius", "6px")
                    .style("font-size", "12px").style("pointer-events", "none").style("z-index", "1000")
                tooltip.transition().duration(200).style("opacity", 1)
                tooltip.html(`Epoch: ${d.epoch}<br/>Pool Share: ${(d.poolShare * 100).toFixed(4)}%`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px")
            })
            .on("mouseout", () => d3.selectAll(".tooltip").remove())

        areaSvg.append("g").attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text").style("fill", "#6b7280").style("font-size", "12px")

        areaSvg.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d: number | { valueOf(): number }) => `${(Number(d) * 100).toFixed(2)}%`))
            .selectAll("text").style("fill", "#6b7280").style("font-size", "12px")

        areaSvg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2)).attr("dy", "1em")
            .style("text-anchor", "middle").style("fill", "#374151")
            .style("font-size", "14px").style("font-weight", "600").text("Pool Share (%)")

        areaSvg.append("text").attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle").style("fill", "#374151")
            .style("font-size", "14px").style("font-weight", "600").text("Epoch")
    }, [poolShareData, activeChartTab])

    // Early returns must come AFTER all hooks
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

    return (
        <div className="my-10">
            <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="flex flex-col">
                <TabsList orientation="horizontal" className="flex-shrink-0 bg-white/60 backdrop-blur rounded-2xl p-2 shadow-lg border border-slate-200/50 mb-6">
                    <TabsTrigger value="apy" label="APY" orientation="horizontal" />
                    <TabsTrigger value="stake" label="Stake" orientation="horizontal" />
                    <TabsTrigger value="poolShare" label="Pool Share" orientation="horizontal" />
                </TabsList>
                <TabsContent value="apy" className="min-w-0 flex-1">
                    {apyData.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500 shadow-2xl">
                            <p className="text-lg font-semibold">APY Chart</p>
                            <p className="mt-2 text-sm">No APY data available for this validator.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                                <div className="mb-6">
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">APY Analytics</p>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-900">APY Over Time</h2>
                                    <p className="mt-2 text-sm text-slate-500">Historical APY performance across epochs</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <svg ref={apyAreaChartRef} className="w-full"></svg>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                                <div className="mb-6">
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">APY Analytics</p>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-900">APY Contour</h2>
                                    <p className="mt-2 text-sm text-slate-500">Contour visualization showing APY intensity and distribution</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <svg ref={apyContourChartRef} className="w-full"></svg>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 text-center">
                                Showing {apyData.length} data point{apyData.length !== 1 ? 's' : ''} from epoch {apyData[0]?.epoch} to {apyData[apyData.length - 1]?.epoch}
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="stake" className="min-w-0 flex-1">
                    {stakeData.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500 shadow-2xl">
                            <p className="text-lg font-semibold">Stake Chart</p>
                            <p className="mt-2 text-sm">No stake data available for this validator.</p>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Stake Analytics</p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900">Stake Over Time</h2>
                                <p className="mt-2 text-sm text-slate-500">Historical stake amounts across epochs</p>
                            </div>
                            <div className="overflow-x-auto">
                                <svg ref={stakeAreaChartRef} className="w-full"></svg>
                            </div>
                            <div className="text-xs text-slate-500 text-center mt-4">
                                Showing {stakeData.length} data point{stakeData.length !== 1 ? 's' : ''} from epoch {stakeData[0]?.epoch} to {stakeData[stakeData.length - 1]?.epoch}
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="poolShare" className="min-w-0 flex-1">
                    {poolShareData.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500 shadow-2xl">
                            <p className="text-lg font-semibold">Pool Share Chart</p>
                            <p className="mt-2 text-sm">No pool share data available for this validator.</p>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 md:p-8 shadow-2xl">
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pool Share Analytics</p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900">Pool Share Over Time</h2>
                                <p className="mt-2 text-sm text-slate-500">Historical pool share percentages across epochs</p>
                            </div>
                            <div className="overflow-x-auto">
                                <svg ref={poolShareAreaChartRef} className="w-full"></svg>
                            </div>
                            <div className="text-xs text-slate-500 text-center mt-4">
                                Showing {poolShareData.length} data point{poolShareData.length !== 1 ? 's' : ''} from epoch {poolShareData[0]?.epoch} to {poolShareData[poolShareData.length - 1]?.epoch}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

