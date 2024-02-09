import React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine, ChartProps,
  ChartVoronoiContainer
} from '@patternfly/react-charts';

interface LineSeriesDataPoint {
  name: string;
  x: string;
  y: number;
}

interface LineSeries {
  label: string;
  themeColor?: string;
  dataPoints: LineSeriesDataPoint[];
}

interface LineChartProps {
  title: string;
  ariaTitle: string;
  lineSeries:  LineSeries[],
  xAxisTicks: number[],
  yAxisTicks: number[],
}

const LineChart = ({
  title,
  ariaTitle,
                     xAxisTicks,
                     yAxisTicks,
  lineSeries,
                   }: LineChartProps) => {
  const colorScale = lineSeries.map((serie) => serie.themeColor || '').filter((color) => !!color);
  const props: Partial<ChartProps> = {};
  if (colorScale.length > 0) {
    props.colorScale = colorScale;
  }

  return (
    <Chart
      {...props}
      ariaDesc={title}
      ariaTitle={ariaTitle || title}
      containerComponent={<ChartVoronoiContainer labels={({ datum }) => `${datum.name}: ${datum.y}`} constrainToVisibleArea />}
      legendData={lineSeries.map((lineSerie) => ({ name: lineSerie.label }))}
      legendOrientation="vertical"
      legendPosition="right"
      height={250}
      name={title}
      padding={{
        bottom: 50,
        left: 50,
        right: 200, // Adjusted to accommodate legend
        top: 50
      }}
      width={600}
    >
      <ChartAxis tickValues={xAxisTicks} />
      <ChartAxis dependentAxis showGrid tickValues={yAxisTicks} />
      <ChartGroup>
        {lineSeries.map((lineSerie) => {
          return (
            <ChartLine
              key={lineSerie.label}
              data={lineSerie.dataPoints.map((dp) => {
                return { name: lineSerie.label, x: dp.x, y: dp.y }
              })}
            />

          )
        })}
      </ChartGroup>
    </Chart>
  )
}

export default LineChart;
