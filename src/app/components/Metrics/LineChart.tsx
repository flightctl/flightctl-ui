import React from 'react';
import { Chart, ChartAxis, ChartGroup, ChartLine, ChartProps, ChartVoronoiContainer } from '@patternfly/react-charts';

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
  lineSeriesList: LineSeries[];
  xAxisTicks: number[];
  yAxisTicks: number[];
}

const LineChart = ({ title, ariaTitle, xAxisTicks, yAxisTicks, lineSeriesList }: LineChartProps) => {
  const colorScale = lineSeriesList.map((series) => series.themeColor || '').filter((color) => !!color);
  const props: Partial<ChartProps> = {};
  if (colorScale.length > 0) {
    props.colorScale = colorScale;
  }

  return (
    <Chart
      {...props}
      ariaDesc={title}
      ariaTitle={ariaTitle || title}
      containerComponent={
        <ChartVoronoiContainer labels={({ datum }) => `${datum.name}: ${datum.y}`} constrainToVisibleArea />
      }
      legendData={lineSeriesList.map((lineSeries) => ({ name: lineSeries.label }))}
      legendOrientation="vertical"
      legendPosition="right"
      height={250}
      name={title}
      padding={{
        bottom: 50,
        left: 50,
        right: 200,
        top: 50,
      }}
      width={600}
    >
      <ChartAxis tickValues={xAxisTicks} />
      <ChartAxis dependentAxis showGrid tickValues={yAxisTicks} />
      <ChartGroup>
        {lineSeriesList.map((lineSeries) => {
          return (
            <ChartLine
              key={lineSeries.label}
              data={lineSeries.dataPoints.map((dp) => {
                return { name: lineSeries.label, x: dp.x, y: dp.y };
              })}
            />
          );
        })}
      </ChartGroup>
    </Chart>
  );
};

export default LineChart;
