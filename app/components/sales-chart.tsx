import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SalesData {
  date: Date;
  sales: number;
}

const SalesLineChart = () => {
  // Dummy data for demonstration. Replace with real API data as needed.
  const weeklyData: SalesData[] = [
    { date: new Date(2025, 2, 23), sales: 4321 },
    { date: new Date(2025, 2, 24), sales: 3890 },
    { date: new Date(2025, 2, 25), sales: 4210 },
    { date: new Date(2025, 2, 26), sales: 4475 },
    { date: new Date(2025, 2, 27), sales: 5010 },
    { date: new Date(2025, 2, 28), sales: 3675 },
    { date: new Date(2025, 2, 29), sales: 4890 }
  ];

  const monthlyData: SalesData[] = [
    { date: new Date(2025, 2, 1), sales: 3200 },
    { date: new Date(2025, 2, 2), sales: 2800 },
    { date: new Date(2025, 2, 3), sales: 3050 },
    { date: new Date(2025, 2, 4), sales: 5000 },
    { date: new Date(2025, 2, 5), sales: 4500 },
    { date: new Date(2025, 2, 6), sales: 4700 },
    { date: new Date(2025, 2, 7), sales: 5200 },
    { date: new Date(2025, 2, 8), sales: 6100 },
    { date: new Date(2025, 2, 9), sales: 5800 },
    { date: new Date(2025, 2, 10), sales: 6050 },
    { date: new Date(2025, 2, 11), sales: 6300 },
    { date: new Date(2025, 2, 12), sales: 6000 },
    { date: new Date(2025, 2, 13), sales: 5600 },
    { date: new Date(2025, 2, 14), sales: 5900 },
    { date: new Date(2025, 2, 15), sales: 6100 },
    { date: new Date(2025, 2, 16), sales: 6200 },
    { date: new Date(2025, 2, 17), sales: 7100 },
    { date: new Date(2025, 2, 18), sales: 6900 },
    { date: new Date(2025, 2, 19), sales: 7300 },
    { date: new Date(2025, 2, 20), sales: 7500 },
    { date: new Date(2025, 2, 21), sales: 7800 },
    { date: new Date(2025, 2, 22), sales: 8100 },
    { date: new Date(2025, 2, 23), sales: 7900 },
    { date: new Date(2025, 2, 24), sales: 8200 },
    { date: new Date(2025, 2, 25), sales: 8500 },
    { date: new Date(2025, 2, 26), sales: 8700 },
    { date: new Date(2025, 2, 27), sales: 8900 },
    { date: new Date(2025, 2, 28), sales: 9100 },
    { date: new Date(2025, 2, 29), sales: 9400 }
  ];

  const yearlyData: SalesData[] = [
    { date: new Date(2024, 0, 1), sales: 120000 },
    { date: new Date(2024, 1, 1), sales: 135000 },
    { date: new Date(2024, 2, 1), sales: 128000 },
    { date: new Date(2024, 3, 1), sales: 140000 },
    { date: new Date(2024, 4, 1), sales: 150000 },
    { date: new Date(2024, 5, 1), sales: 160000 },
    { date: new Date(2024, 6, 1), sales: 155000 },
    { date: new Date(2024, 7, 1), sales: 170000 },
    { date: new Date(2024, 8, 1), sales: 165000 },
    { date: new Date(2024, 9, 1), sales: 180000 },
    { date: new Date(2024, 10, 1), sales: 190000 },
    { date: new Date(2024, 11, 1), sales: 200000 }
  ];

  const [range, setRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Choose the current dataset based on the selected range
  const currentData: SalesData[] =
    range === 'weekly' ? weeklyData : range === 'monthly' ? monthlyData : yearlyData;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Clear any previous chart elements
    svg.selectAll('*').remove();

    // Set dimensions and margins for the chart
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set up SVG viewport
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create the main group for the chart, shifting by margins
    const chartG = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define X and Y scales based on current data
    const xScale = d3.scaleTime()
      .domain(d3.extent(currentData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(currentData, d => d.sales) || 0])
      .range([innerHeight, 0])
      .nice();

    // Define a tick formatter that accepts two arguments
    let xFormat: (d: Date | number, i: number) => string;
    if (range === 'weekly') {
      xFormat = (d, i) => d3.timeFormat('%a')(d as Date); // e.g., Mon, Tue, etc.
    } else if (range === 'monthly') {
      xFormat = (d, i) => d3.timeFormat('%b %d')(d as Date); // e.g., Mar 01, Mar 15, etc.
    } else {
      xFormat = (d, i) => d3.timeFormat('%b')(d as Date); // e.g., Jan, Feb, etc.
    }

    // Create axes with the custom tick formatter
    const xAxis = d3.axisBottom(xScale).tickFormat(xFormat);
    if (range === 'weekly') {
      xAxis.ticks(d3.timeDay.every(1));
    } else if (range === 'monthly') {
      xAxis.ticks(d3.timeWeek.every(1));
    } else if (range === 'yearly') {
      xAxis.ticks(d3.timeMonth.every(1));
    }
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `$${d3.format('.2s')(d as number)}`);

    // Append axes to the chart group
    chartG.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    chartG.append('g')
      .call(yAxis);

    // Append x-axis label
    chartG.append("text")
      .attr("text-anchor", "end")
      .attr("x", innerWidth)
      .attr("y", innerHeight + margin.bottom - 5)
      .text("Date")
      .attr("fill", "black");

    // Append y-axis label
    chartG.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -margin.top)
      .text("Sales Amount")
      .attr("fill", "black");

    // Create the line generator function
    const lineGenerator = d3.line<SalesData>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Append the line path and animate it
    const path = chartG.append('path')
      .datum(currentData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

    // Append circles at data points with tooltip interactivity
    chartG.selectAll('.data-point')
      .data(currentData)
      .join('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseenter', function(event, d) {
        const dateStr = d3.timeFormat('%b %d, %Y')(d.date);
        tooltip.style('opacity', 1)
               .text(`${dateStr}: $${d.sales.toLocaleString()}`);
      })
      .on('mousemove', function(event, d) {
        const [mouseX, mouseY] = d3.pointer(event, svg.node()!);
        tooltip.style('left', `${margin.left + mouseX + 10}px`)
               .style('top', `${margin.top + mouseY - 20}px`);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });
  }, [range, currentData]);

  return (
    <div className="relative bg-white p-4 shadow rounded">
      <div className="flex justify-end mb-2">
        <label className="mr-2 font-medium text-sm" htmlFor="rangeSelect">
          View:
        </label>
        <select
          id="rangeSelect"
          value={range}
          onChange={(e) =>
            setRange(e.target.value as 'weekly' | 'monthly' | 'yearly')
          }
          className="p-1 border border-gray-300 rounded text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <svg ref={svgRef} className="w-full h-64"></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-gray-700 text-white text-xs py-1 px-2 rounded pointer-events-none"
        style={{ opacity: 0 }}
      />
    </div>
  );
};

export default SalesLineChart;
