import React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLabel,
  ChartLine,
  ChartProps,
  ChartVoronoiContainer,
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
  ariaTitle?: string;
  lineSeriesList: LineSeries[];
  xTickCount: number;
  yTickCount: number;
}

const TimeLineChart = ({ title, ariaTitle, xTickCount, yTickCount, lineSeriesList }: LineChartProps) => {
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
      height={250}
      name={title}
      padding={{
        bottom: 75, // for the tick labels
        left: 75, // for the tick labels
        right: 50,
        top: 20,
      }}
    >
      <ChartAxis
        showGrid
        tickCount={xTickCount}
        tickFormat={(dateTick) => {
          return new Date(dateTick * 1000).toLocaleString();
        }}
        tickLabelComponent={<ChartLabel angle={-45} textAnchor="end" />}
        style={{ tickLabels: { fontSize: 8 } }}
      />
      <ChartAxis dependentAxis showGrid tickCount={yTickCount} style={{ tickLabels: { fontSize: 9 } }} />
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

export default TimeLineChart;
