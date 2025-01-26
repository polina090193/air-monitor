import { useCallback, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { useFetchData } from './queries/useFetchData'
import { Flex } from '@chakra-ui/react'
import YearSelect from './components/form-components/YearSelect'
import './App.css'

function App() {
  const { data: rawData, error, isLoading } = useFetchData('yearWorldCO2') as {
    data: WorldCO2DataRow[],
    error: Error,
    isLoading: boolean
  };
  const [worldDataSeparatedByYear, setWorldDataSeparatedByYear] = useState<WorldCO2DataYear[]>([])

  const width = useMemo(() => 1200, []);
  const height = useMemo(() => 600, []);
  const margin = useMemo(() => ({ top: 20, right: 30, bottom: 30, left: 50 }), []);

  const worldPlotColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

  const [selectedYear, setSelectedYear] = useState<number>(0)

  const adjustDataForTimelinePlot = useCallback((data: WorldCO2DataRow[] | []) => {
    return data?.map((row) => ({
      date: d3.timeParse("%Y-%m-%d")(row.date) as Date,  
      total: row.total,
    })) || []
  }, [])

  const worldData = useMemo(() => 
    adjustDataForTimelinePlot(rawData), 
  [adjustDataForTimelinePlot, rawData])

  const getWorldDataSeparatedByYear = useCallback(() => {
    const dataSeparatedByYear: WorldCO2DataYear[] = [];

    if (worldData.length) {
      let currentYearData: WorldCO2DataDay[] = [];
      let year = worldData[0].date.getFullYear();

      for (const dataDay of worldData) {
        if (dataDay.date.getFullYear() === year) {
          currentYearData.push(dataDay);
        } else {
          dataSeparatedByYear.push({ year, data: currentYearData });
          currentYearData = [dataDay];
          year = dataDay.date.getFullYear();
        }
      }
      dataSeparatedByYear.push({ year, data: currentYearData });
    }

    setWorldDataSeparatedByYear(dataSeparatedByYear);
  }, [worldData])

  const years = useMemo(
    () => worldDataSeparatedByYear.map((yearData) => yearData.year),
    [worldDataSeparatedByYear]
  )

  const renderWorldPlot = useCallback(() => {
    const svg = d3.select("#chart");
    svg.selectAll("*").remove();

    const formatMonth = d3.timeFormat("%B")

    const yearDataForPlot = selectedYear 
      ? worldDataSeparatedByYear.filter((yearData) => yearData.year === selectedYear)
      : worldDataSeparatedByYear;

    const yearDataXScaleInitializer = yearDataForPlot.length ? yearDataForPlot[0].data : [];

    const xScale = (yearData = yearDataXScaleInitializer) => d3
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

    yearDataForPlot.forEach(({ data: yearData }, index) => {
      const line = d3
        .line<WorldCO2DataDay>()
        .x((d) => xScale(yearData)(d.date))
        .y((d) => yScale(d.total));
  
      svg
        .append("path")
        .datum(yearData)
        .attr("fill", "none")
        .attr("stroke", worldPlotColors(index.toString()))
        .attr("stroke-width", 1.5)
        .attr("d", line)

      if (selectedYear) {
        svg
          .append("rect")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom)
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mousemove", (event) => {
            const [x] = d3.pointer(event);
            const xDate = xScale(yearDataXScaleInitializer).invert(x + margin.left);
            
            const closestData = worldData.reduce((a, b) => {
              return Math.abs(b.date.getTime() - xDate.getTime()) < Math.abs(a.date.getTime() - xDate.getTime()) ? b : a;
            });

            d3.select("#tooltip")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY}px`)
              .style("display", "block")
              .html(`Date: ${d3.timeFormat("%Y-%m-%d")(closestData.date)}<br>Total: ${closestData.total}`);
          })
          .on("mouseout", () => {
            d3.select("#tooltip").style("display", "none");
          });
      } else {
        const legend = svg.append("g")
          .attr("transform", `translate(${width - margin.right * 2}, ${margin.top})`);

        yearDataForPlot.forEach((yearData, i) => {
          const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

          legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", worldPlotColors(i.toString()));

          legendRow.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text(yearData.year);
        });
      }
    })
  }, [height, margin, selectedYear, width, worldData, worldDataSeparatedByYear, worldPlotColors])

  useEffect(() => {
    getWorldDataSeparatedByYear()
  }, [getWorldDataSeparatedByYear])

  useEffect(() => {
    if (!worldDataSeparatedByYear?.length) return
    renderWorldPlot()
  }, [worldDataSeparatedByYear, renderWorldPlot]);
  
  if (error) return <p>Error loading data</p>;

  return (
    <>
      <Flex>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', marginTop: '20vh' }}>
          <YearSelect years={years} onYearChange={setSelectedYear} />
          {isLoading ? 'Loading...' 
            : worldDataSeparatedByYear?.length 
              ? <svg id="chart" width={width} height={height} />
              : 'No data'}
          <div id="tooltip" style={{ height: '20vh' }} />
        </div>
      </Flex>
    </>
  )
}

export default App
