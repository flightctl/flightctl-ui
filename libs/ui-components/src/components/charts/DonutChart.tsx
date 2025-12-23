import * as React from 'react';
import { ChartContainer, ChartDonut } from '@patternfly/react-charts/victory';
import { Content, ContentVariants, Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { Link, LinkProps } from '../../hooks/useNavigate';
import LabelWithHelperText from '../common/WithHelperText';
import { useTranslation } from '../../hooks/useTranslation';
import { getDefaultStatusColor } from '../../utils/status/common';

import './DonutChart.css';

export type Data = {
  x: string;
  y: number;
  color: string;
  link: LinkProps;
  tooltip: string;
};

const chartWidth = 230;
const chartHeight = 230;

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
  const { t } = useTranslation();
  const firstRow = data.slice(0, Math.floor(data.length / 2));
  const secondRow = data.slice(Math.floor(data.length / 2), data.length);

  const isEmpty = !data.some(({ y }) => !!y);

  return (
    <Flex
      justifyContent={{ default: 'justifyContentCenter' }}
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem className="fctl-charts__donut">
        <ChartContainer
          className="fctl-charts__donut-container"
          width={chartWidth}
          height={chartHeight}
          role="img"
          aria-label={title}
        >
          <foreignObject x="0" y="0" width={chartWidth} height={chartHeight}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentCenter' }}
              alignContent={{ default: 'alignContentCenter' }}
              className="fctl-charts__title"
            >
              {helperText ? <LabelWithHelperText label={title} content={helperText} /> : title}
            </Flex>
          </foreignObject>
          <ChartDonut
            ariaDesc={title}
            ariaTitle={title}
            constrainToVisibleArea
            colorScale={isEmpty ? [getDefaultStatusColor('unknown')] : data.map((datum) => datum.color)}
            data={isEmpty ? [{ y: 100 }] : data}
            name={title}
            standalone={false}
            labels={isEmpty ? [] : data.map((datum) => datum.tooltip)}
          />
        </ChartContainer>
      </FlexItem>
      <FlexItem>
        {isEmpty ? (
          <Content component={ContentVariants.small}>{t('No devices')}</Content>
        ) : (
          <Legend rows={[firstRow, secondRow]} />
        )}
      </FlexItem>
    </Flex>
  );
};

export default DonutChart;
