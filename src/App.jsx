import * as d3 from 'd3';
import { tip as d3tip } from 'd3-v6-tip';
import { useState, useEffect, useRef } from 'react';
import './index.css';

const HeatMap = ({
  data,
  width = 1400,
  height = 600,
  padding = 80,
  lowlow = '#355C7D',
  low = '#6C5B7B',
  base = '#C06C84',
  high = '#F8B195',
  highhigh = '#F67280',
}) => {
  var yearMin = d3.min(data?.map((item) => item.year)) || 0;
  var yearMax = d3.max(data?.map((item) => item.year)) || 0;

  const gx = useRef();
  const gy = useRef();

  const xScale = d3
    .scaleLinear()
    .domain([yearMin, yearMax + 1])
    .range([padding, width - padding]);
  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([height - padding, padding]);

  const tip = d3tip()
    .attr('id', 'tooltip')
    .html(function (d) {
      return d;
    })
    .direction('n')
    .offset([-2, 0]);

  var legendData = [
    [-2, lowlow],
    [-1, low],
    [0, base],
    [1, high],
    [2, highhigh],
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  useEffect(
    () =>
      void d3
        .select(gx.current)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))),
    [gx, xScale]
  );
  useEffect(
    () =>
      void d3.select(gy.current).call(
        d3
          .axisLeft(yScale)
          .tickValues(yScale.domain())
          .tickFormat((d, i) => months[i])
      ),
    [gy, yScale]
  );

  const rectangles = data?.map((d, i) => {
    const varianceColor = (variance) => {
      return variance <= -2
        ? lowlow
        : variance <= -1
        ? low
        : variance <= 0
        ? base
        : variance <= 1
        ? high
        : highhigh;
    };
    return (
      <rect
        className='cell'
        fill={varianceColor(d.variance)}
        data-month={d.month - 1}
        data-year={d.year}
        data-temp='temps'
        height={(height - 2 * padding) / 12}
        y={yScale(d.month - 1)}
        width={(width - 2 * padding) / (yearMax - yearMin)}
        x={xScale(d.year)}
      ></rect>
    );
  });

  return (
    <>
      <svg width={width} height={height}>
        <g ref={gx} transform={`translate(0,${height - padding})`}></g>
        <g ref={gy} transform={`translate(${padding},0)`}></g>
        {rectangles}
      </svg>
    </>
  );
};

const App = () => {
  const [data, setData] = useState([]);
  const [baseTemp, setBaseTemp] = useState(0);
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
      );
      const data = await res.json();
      setBaseTemp(data.baseTemperature);
      setData(data.monthlyVariance);
    }
    fetchData();
  }, []);
  return (
    <div id='wrapper'>
      <HeatMap data={data} baseTemp={baseTemp} />
    </div>
  );
};

export default App;

const old = () => {
  var svg = d3
    .select('#svgBox')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(tip);

  d3.json(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
  ).then((datas) => {
    const baseTemp = datas.baseTemperature;
    console.log('Base Temp is: ' + baseTemp);
    var monthlyData = datas.monthlyVariance;
    monthlyData.forEach((item) => {
      item.month -= 1;
    });

    // console.log(monthlyData);

    // // TITLE
    // svg
    //   .append('text')
    //   .text('Monthly Global Land-Surface Temperature')
    //   .attr('x', 800)
    //   .attr('y', 40)
    //   .attr('id', 'title');

    // SUBTITLE
    // svg
    //   .append('text')
    //   .text('1753 - 2015: base temperature 8.66℃')
    //   .attr('x', 810)
    //   .attr('y', 65)
    //   .attr('id', 'description');

    // LEGEND

    const yYScale = d3
      .scaleBand()
      .domain([-2, -1, 0, 1, 2])
      .range([height - padding, padding]);
    const yYAxis = d3.axisLeft(yYScale).tickValues(yYScale.domain());

    const legend = svg
      .append('g')
      .call(yYAxis)
      .attr('transform', 'translate(' + (width - padding + padding / 2) + ',0)')
      .attr('id', 'legend');

    legend
      .append('g')
      .selectAll('rect')
      .data(legendData)
      .enter()
      .append('rect')
      .style('fill', (d, i) => d[1])
      .attr('y', (item) => {
        return yYScale(item[0]);
      })
      .attr('width', 30)
      .attr('height', (height - 2 * padding) / 5);

    // X-AXIS (Bottom)
    var yearMin = d3.min(datas.monthlyVariance.map((item) => item.year));
    var yearMax = d3.max(datas.monthlyVariance.map((item) => item.year));
    var totalYears = yearMax - yearMin;
    console.log(totalYears);
    const xScale = d3
      .scaleLinear()
      .domain([yearMin, yearMax + 1])
      .range([padding, width - padding]);
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    svg
      .append('g')
      .attr('transform', 'translate(0,' + (height - padding) + ')')
      .call(xAxis)
      .attr('id', 'x-axis');

    // Y-AXIS (Left)
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // const yScale = d3
    //   .scaleBand()
    //   .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    //   .range([height - padding, padding]);

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yScale.domain())
      .tickFormat((d, i) => {
        return months[i];
      });
    svg
      .append('g')
      .attr('transform', 'translate(' + padding + ',0)')
      .call(yAxis)
      .attr('id', 'y-axis');

    // DATA CELLS
    svg
      .selectAll('rect')
      .data(monthlyData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('fill', (item) => {
        const variance = item.variance;
        return variance <= -2
          ? lowlow
          : variance <= -1
          ? low
          : variance <= 0
          ? base
          : variance <= 1
          ? high
          : highhigh;
      })
      .attr('data-month', (item) => {
        return item.month;
      })
      .attr('data-year', (item) => {
        return item.year;
      })
      .attr('data-temp', 'temps')
      .attr('height', (height - 2 * padding) / 12)
      .attr('y', (item) => {
        return yScale(item.month);
      })
      .attr('width', (width - 2 * padding) / totalYears)
      .attr('x', (item) => {
        return xScale(item.year);
      })

      // TOOLTIP
      .on('mouseover', function (event, item) {
        var date = new Date(item.year, item.month);
        var str =
          '<span>' +
          d3.timeFormat('%B - %Y')(date) +
          '</span>' +
          '<span>' +
          Math.round((baseTemp + item.variance) * 10) / 10 +
          '℃</span>' +
          '<span>' +
          Math.round(item.variance * 10) / 10 +
          '℃</span>';
        tip.attr('data-year', item.year);
        tip.show(str, this);
      })
      .on('mouseout', tip.hide);
  });

  return 1;
};
