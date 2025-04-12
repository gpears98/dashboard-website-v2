'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { Button } from '@/app/components/button'
import { Badge } from '@/app/components/badge'

interface SalesData {
  date: Date
  sales: number
}

interface SummaryStats {
  total: number
  average: number
  max: number
  percentChange: number
}

const SalesLineChart = () => {
  const weeklyData: SalesData[] = [
    { date: new Date(2025, 2, 23), sales: 4321 },
    { date: new Date(2025, 2, 24), sales: 3890 },
    { date: new Date(2025, 2, 25), sales: 4210 },
    { date: new Date(2025, 2, 26), sales: 4475 },
    { date: new Date(2025, 2, 27), sales: 5010 },
    { date: new Date(2025, 2, 28), sales: 3675 },
    { date: new Date(2025, 2, 29), sales: 4890 },
  ]

  const monthlyData: SalesData[] = Array.from({ length: 29 }, (_, i) => ({
    date: new Date(2025, 2, i + 1),
    sales: Math.floor(3000 + Math.random() * 7000),
  }))

  const yearlyData: SalesData[] = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2024, i, 1),
    sales: Math.floor(120000 + Math.random() * 80000),
  }))

  const [range, setRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const currentData =
    range === 'weekly' ? weeklyData : range === 'monthly' ? monthlyData : yearlyData

  const lastYearData = currentData.map((d) => ({
    date: d.date, // use current date so both lines align perfectly
    sales: Math.floor(d.sales * 0.9 + Math.random() * 0.2 * d.sales), // simulate variation
  }))

  // Calculate summary statistics
  const stats: SummaryStats = useMemo(() => {
    const total = d3.sum(currentData, d => d.sales)
    const average = total / currentData.length
    const max = d3.max(currentData, d => d.sales) || 0

    const lastYearTotal = d3.sum(lastYearData, d => d.sales)
    const percentChange = ((total - lastYearTotal) / lastYearTotal) * 100

    return {
      total,
      average,
      max,
      percentChange
    }
  }, [currentData, lastYearData])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    svg.selectAll('*').remove()

    const containerWidth = svgRef.current?.parentElement?.clientWidth || 800
    const width = containerWidth
    const height = 300
    const margin = { top: 20, right: 30, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)

    const chartG = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const combinedDates = [...currentData, ...lastYearData]
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(combinedDates, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    const maxY = d3.max([...currentData, ...lastYearData], (d) => d.sales)!
    const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice()

    const xFormat =
      range === 'weekly'
        ? d3.timeFormat('%a')
        : range === 'monthly'
        ? d3.timeFormat('%b %d')
        : d3.timeFormat('%b')

    const xAxis = d3.axisBottom(xScale).tickFormat((d) => xFormat(d as Date))
    const yAxis = d3.axisLeft(yScale).ticks(6)

    chartG
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'text-xs fill-zinc-600 dark:fill-zinc-400')

    chartG.append('g').call(yAxis).selectAll('text').attr('class', 'text-xs fill-zinc-600 dark:fill-zinc-400')

    // Add grid lines
    chartG
      .append('g')
      .attr('class', 'grid-lines')
      .selectAll('line.grid-line')
      .data(yScale.ticks(6))
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'rgba(0, 0, 0, 0.07)')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1)

    // Define colors
    const lineColor = '#22c55e'
    const blueLineColor = '#3b82f6'
    const hoverColor = '#16a34a'

    const area = d3
      .area<SalesData>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX)

    const line = d3
      .line<SalesData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX)

    const lastYearLine = d3
      .line<SalesData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX)

    const defs = svg.append('defs')

    // Improved gradient for current year
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'green-area-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0.3)

    gradient
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0.1)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0)

    // Add drop shadow filter for hover effect
    const filter = defs
      .append('filter')
      .attr('id', 'drop-shadow')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('color-interpolation-filters', 'sRGB')

    filter
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 1)
      .attr('stdDeviation', 2)
      .attr('flood-opacity', 0.3)
      .attr('flood-color', 'rgb(0, 0, 0)')

    chartG
      .append('path')
      .datum(currentData)
      .attr('fill', 'url(#green-area-gradient)')
      .attr('d', area)

    chartG
      .append('path')
      .datum(currentData)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', line)

    chartG
      .append('path')
      .datum(lastYearData)
      .attr('fill', 'none')
      .attr('stroke', blueLineColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 2')
      .attr('d', lastYearLine)

    // Add data points with enhanced hover effects
    chartG
      .selectAll('circle')
      .data(currentData)
      .join('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 5)
      .attr('fill', lineColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('class', 'data-point')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function (_, d) {
        const circle = this as SVGCircleElement
        const matrix = circle.getScreenCTM()
        if (!matrix) return

        const point = svgRef.current?.ownerSVGElement?.createSVGPoint()
        if (!point) return

        // Enhance the circle on hover
        d3.select(this)
          .attr('r', 7)
          .attr('fill', hoverColor)
          .attr('filter', 'url(#drop-shadow)')

        point.x = +circle.getAttribute('cx')!
        point.y = +circle.getAttribute('cy')!
        const screenPoint = point.matrixTransform(matrix)

        // Find previous period data for comparison
        const lastYearValue = lastYearData.find((ly) =>
          ly.date.getTime() === d.date.getTime()
        )?.sales || 0

        const percentChange = ((d.sales - lastYearValue) / lastYearValue) * 100
        const changeDirection = percentChange >= 0 ? '↑' : '↓'
        const changeColor = percentChange >= 0 ? 'text-green-500' : 'text-red-500'

        tooltip
          .style('opacity', 1)
          .style('left', `${screenPoint.x + 10}px`)
          .style('top', `${screenPoint.y - 30}px`)
          .html(
            `<div class="text-sm text-white font-medium">${d3.timeFormat('%b %d, %Y')(d.date)}</div>
             <div class="flex items-center gap-2">
               <div class="text-md text-white font-bold">$${d.sales.toLocaleString()}</div>
               <div class="${changeColor} text-xs font-semibold">${changeDirection} ${Math.abs(percentChange).toFixed(1)}%</div>
             </div>
             <div class="text-xs text-zinc-300 mt-1">vs. Last Year: $${lastYearValue.toLocaleString()}</div>`
          )
      })
      .on('mouseout', function() {
        // Reset the circle on mouseout
        d3.select(this)
          .attr('r', 5)
          .attr('fill', lineColor)
          .attr('filter', null)

        tooltip.style('opacity', 0)
      })

    // Add a legend
    const legend = chartG
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 180}, 0)`)

    // Current year legend item
    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 10)
      .attr('y2', 10)
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 13)
      .attr('class', 'text-xs fill-zinc-700 dark:fill-zinc-300')
      .text('Current Period')

    // Last year legend item
    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 30)
      .attr('y2', 30)
      .attr('stroke', blueLineColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2')

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 33)
      .attr('class', 'text-xs fill-zinc-700 dark:fill-zinc-300')
      .text('Previous Period')

    // Only show value labels for weekly view to avoid clutter
    if (range === 'weekly') {
      chartG
        .selectAll('text.label')
        .data(currentData)
        .join('text')
        .attr('x', (d) => xScale(d.date))
        .attr('y', (d) => yScale(d.sales) - 12)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-[10px] fill-zinc-500 dark:fill-zinc-400')
        .text((d) => `$${d.sales.toLocaleString()}`)
    }
  }, [currentData, range])

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Sales Overview</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {range === 'weekly' ? 'Last 7 days' : range === 'monthly' ? 'Last 30 days' : 'Last 12 months'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'yearly'] as const).map((option) => (
            <Button
              key={option}
              {...(range === option
                ? { color: 'dark/zinc' as const }
                : { outline: true as const })}
              onClick={() => setRange(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Sales</div>
          <div className="text-xl font-semibold mt-1">${stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Average</div>
          <div className="text-xl font-semibold mt-1">${Math.round(stats.average).toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Peak Sales</div>
          <div className="text-xl font-semibold mt-1">${stats.max.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">vs Previous</div>
            <Badge color={stats.percentChange >= 0 ? 'green' : 'red'}>
              {stats.percentChange >= 0 ? '↑' : '↓'} {Math.abs(stats.percentChange).toFixed(1)}%
            </Badge>
          </div>
          <div className="text-xl font-semibold mt-1 flex items-center gap-2">
            <span className={stats.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {stats.percentChange >= 0 ? 'Growth' : 'Decline'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <svg ref={svgRef} className="w-full h-[350px]" />
      </div>

      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10 px-4 py-3 rounded-lg bg-zinc-800 text-white shadow-lg transition-opacity duration-150 opacity-0 border border-zinc-700"
        style={{ position: 'absolute' }}
      />
    </div>
  )
}

export default SalesLineChart
