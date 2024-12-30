import { useCallback, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [worldData, setWorldData] = useState<WorldDataDay[]>([])
  const [worldDataSeparatedByYear, setWorldDataSeparatedByYear] = useState<WorldDataDay[][]>([])

  const worldPlotColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

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

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const xScale = (yearData = worldDataSeparatedByYear[0]) => d3
      .scaleTime()
      .domain(d3.extent(yearData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(worldDataSeparatedByYear[0], d => d.total)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale()));

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
        .attr("d", line);
    })
  }, [worldDataSeparatedByYear, worldPlotColors])

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
      {isLoading ? 'Loading...' 
        : worldDataSeparatedByYear?.length 
          ? <svg id="chart" width="800" height="400" />
          : 'No data'}
    </>
  )
}

export default App
