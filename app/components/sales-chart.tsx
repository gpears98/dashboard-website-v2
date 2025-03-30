'use client'

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Button } from '@/app/components/button'

interface SalesData {
  date: Date
  sales: number
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

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(currentData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(currentData, (d) => d.sales)!])
      .range([innerHeight, 0])
      .nice()

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

    const lineColor = '#22c55e'

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

    const defs = svg.append('defs')
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
      .attr('stop-opacity', 0.2)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0)

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

    // Circles with DOM-positioned tooltips anchored to the dot
    chartG
      .selectAll('circle')
      .data(currentData)
      .join('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', lineColor)
      .on('mouseover', function (event, d) {
        const circle = this as SVGCircleElement
        const matrix = circle.getScreenCTM()
        if (!matrix) return

        const point = svgRef.current?.ownerSVGElement?.createSVGPoint()
        if (!point) return

        point.x = +circle.getAttribute('cx')!
        point.y = +circle.getAttribute('cy')!
        const screenPoint = point.matrixTransform(matrix)

        tooltip
          .style('opacity', 1)
          .style('left', `${screenPoint.x + 10}px`)
          .style('top', `${screenPoint.y - 30}px`)
          .html(
            `<div class="text-sm text-white font-medium">${d3.timeFormat('%b %d, %Y')(d.date)}</div>
             <div class="text-md text-white font-bold">$${d.sales.toLocaleString()}</div>`
          )
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0)
      })

    chartG
      .selectAll('text.label')
      .data(currentData)
      .join('text')
      .attr('x', (d) => xScale(d.date))
      .attr('y', (d) => yScale(d.sales) - 8)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[10px] fill-zinc-500 dark:fill-zinc-400')
      .text((d) => `$${d.sales.toLocaleString()}`)
  }, [currentData, range])

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Sales Overview</h2>
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'yearly'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={range === option ? 'solid' : 'outline'}
              onClick={() => setRange(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-[300px]" />

      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10 px-3 py-2 rounded-md bg-zinc-800 text-white shadow-md transition-opacity duration-150 opacity-0"
        style={{ position: 'absolute' }}
      />
    </div>
  )
}

export default SalesLineChart
