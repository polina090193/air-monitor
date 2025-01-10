import { useCallback, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [worldData, setWorldData] = useState<WorldDataDay[]>([])
  const [worldDataSeparatedByYear, setWorldDataSeparatedByYear] = useState<WorldDataDay[][]>([])

  const width = useMemo(() => 1000, []);
  const height = useMemo(() => 400, []);
  const margin = useMemo(() => ({ top: 20, right: 30, bottom: 30, left: 50 }), []);

  const worldPlotColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

  const {selectedYear, setSelectedYear} = useState<number | null>(null)

  const loadWorldData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Original source: https://carbonmonitor.org/
      const fetchedWorldData = await fetch('../data/world_data.json')

      if (fetchedWorldData.ok) {
        const worldDataJson: WorldDataRow[] = await fetchedWorldData.json();

        const parseDate = d3.timeParse("%Y-%m-%d") as (date: string) => Date;

        setWorldData(worldDataJson.map((d: WorldDataRow) => ({
          date: parseDate(d.date),  
          total: d.total,
        })))
      } else {
        console.error('Error fetching world data:', fetchedWorldData.statusText);
      }
    } catch (error) {
      console.error('Error fetching world data:', error)
    }
    setIsLoading(false)
  }, [])

  const getWorldDataSeparatedByYear = useCallback(() => {
    const dataSeparatedByYear: WorldDataDay[][] = [];

    if (worldData.length) {
      let year = worldData[0].date.getFullYear();
      let currentYearData: WorldDataDay[] = [];

      for (const dataDay of worldData) {
        if (dataDay.date.getFullYear() === year) {
          currentYearData.push(dataDay);
        } else {
          dataSeparatedByYear.push(currentYearData);
          currentYearData = [dataDay];
          year = dataDay.date.getFullYear();
        }
      }

      dataSeparatedByYear.push(currentYearData);
    }

    setWorldDataSeparatedByYear(dataSeparatedByYear);
  }, [worldData])

  const renderWorldPlot = useCallback(() => {
    const svg = d3.select("#chart");
    svg.selectAll("*").remove();

    const formatMonth = d3.timeFormat("%B")

    const xScale = (yearData = worldDataSeparatedByYear[0]) => d3
      .scaleUtc()
      .domain(d3.extent(yearData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right])
  
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(worldData, d => d.total)!, d3.max(worldData, d => d.total)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale()).ticks(d3.timeMonth) // Ensure ticks are at month intervals
        .tickFormat((d) => formatMonth(new Date(d.valueOf()))));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    worldDataSeparatedByYear.forEach((yearData, index) => {
      const line = d3
        .line<WorldDataDay>()
        .x((d) => xScale(yearData)(d.date))
        .y((d) => yScale(d.total));
  
      svg
        .append("path")
        .datum(yearData)
        .attr("fill", "none")
        .attr("stroke", worldPlotColors(index.toString()))
        .attr("stroke-width", 1.5)
        .attr("d", line)

      if (selectedYear !== null) {
        svg
          .append("rect")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom)
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mousemove", (event) => {
            const [x] = d3.pointer(event);
            const xDate = xScale(worldDataSeparatedByYear[0]).invert(x);
            const closestData = worldData.reduce((a, b) => {
              return Math.abs(b.date.getTime() - xDate.getTime()) < Math.abs(a.date.getTime() - xDate.getTime()) ? b : a;
            });

            d3.select("#tooltip")
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`)
              .style("display", "inline-block")
              .html(`Date: ${d3.timeFormat("%Y-%m-%d")(closestData.date)}<br>Total: ${closestData.total}`);
          })
          .on("mouseout", () => {
            d3.select("#tooltip").style("display", "none");
          });
      }
    })
  }, [height, margin, selectedYear, width, worldData, worldDataSeparatedByYear, worldPlotColors])

  useEffect(() => {
    loadWorldData()
  }, [loadWorldData])

  useEffect(() => {
    getWorldDataSeparatedByYear()
  }, [getWorldDataSeparatedByYear])

  useEffect(() => {
    if (!worldDataSeparatedByYear?.length) return
    renderWorldPlot()
  }, [worldDataSeparatedByYear, renderWorldPlot]);

  return (
    <>
      <select name="yearSelect" id="yearSelect" value={selectedYear} onChange={(event) => setSelectedYear(parseInt(event.target.value))}>
        <option value="null">Select a year</option>
        {worldDataSeparatedByYear.map((yearData, index) => (
          <option key={index} value={yearData[0].date.getFullYear()}>{yearData[0].date.getFullYear()}</option>
        ))}
      </select>
      {isLoading ? 'Loading...' 
        : worldDataSeparatedByYear?.length 
          ? <svg id="chart" width={width} height={height} />
          : 'No data'}
      <div id="tooltip" />
    </>
  )
}

export default App
