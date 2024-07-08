import { ChartDonut } from '@patternfly/react-charts';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { Link, LinkProps } from '../../hooks/useNavigate';
import WithHelperText from '../common/WithHelperText';

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

const DonutChart = ({ data, title, helperText }: { data: Data[]; title: string; helperText?: string }) => {
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
            titleComponent={
              <foreignObject x="0" y="0" width="230px" height="230px">
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  justifyContent={{ default: 'justifyContentCenter' }}
                  alignContent={{ default: 'alignContentCenter' }}
                  className="fctl-charts__title"
                >
                  {helperText ? (
                    <WithHelperText
                      className="fctl-charts__title-helper"
                      showLabel
                      ariaLabel={title}
                      content={helperText}
                    />
                  ) : (
                    title
                  )}
                </Flex>
              </foreignObject>
            }
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
