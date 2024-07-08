import { ChartDonut, ChartLabel } from '@patternfly/react-charts';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { global_Color_200 as titleColor } from '@patternfly/react-tokens/dist/js/global_Color_200';
import * as React from 'react';
import { Link, LinkProps } from '../../hooks/useNavigate';

import './DonutChart.css';

export type Data = {
  x: string;
  y: number;
  color: string;
  link: LinkProps;
};

const Legend = ({ rows }: { rows: Data[][] }) => {
  return (
    <Stack>
      {rows.map((r, index) => (
        <StackItem key={index}>
          <Flex rowGap={{ default: 'rowGapNone' }} columnGap={{ default: 'columnGapMd' }}>
            {r.map((datum, index) => (
              <FlexItem key={index}>
                <LegendItem key={datum.x} color={datum.color}>
                  <span>
                    {`${datum.y}%`} <Link {...datum.link}>{datum.x}</Link>
                  </span>
                </LegendItem>
              </FlexItem>
            ))}
          </Flex>
        </StackItem>
      ))}
    </Stack>
  );
};

const LegendItem = ({ children, color }: { children: React.ReactNode; color: string }) => {
  return (
    <Flex
      flexWrap={{ default: 'nowrap' }}
      alignItems={{ default: 'alignItemsBaseline' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
      columnGap={{ default: 'columnGapXs' }}
    >
      <FlexItem>
        <div
          style={{
            backgroundColor: color,
            height: '10px',
            width: '10px',
          }}
        />
      </FlexItem>
      <FlexItem>{children}</FlexItem>
    </Flex>
  );
};

const DonutChart = ({ data, title }: { data: Data[]; title: string }) => {
  const firstRow = data.slice(0, Math.floor(data.length / 2));
  const secondRow = data.slice(Math.floor(data.length / 2), data.length);

  return (
    <Stack hasGutter>
      <StackItem className="fctl-charts__donut">
        <div style={{ height: '230px', width: '230px' }}>
          <ChartDonut
            ariaDesc={title}
            ariaTitle={title}
            constrainToVisibleArea
            colorScale={data.map((datum) => datum.color)}
            data={data.map((datum) => ({
              x: `${datum.y}% ${datum.x}`,
              y: datum.y,
            }))}
            name={title}
            title={title}
            titleComponent={<ChartLabel style={{ fontSize: '14px', fill: titleColor.value }} />}
          />
        </div>
      </StackItem>
      <StackItem>
        <Legend rows={[firstRow, secondRow]} />
      </StackItem>
    </Stack>
  );
};

export default DonutChart;
