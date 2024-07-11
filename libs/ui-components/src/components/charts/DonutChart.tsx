import { ChartDonut } from '@patternfly/react-charts';
import { Flex, FlexItem, Stack, StackItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import * as React from 'react';
import { Link, LinkProps } from '../../hooks/useNavigate';
import WithHelperText from '../common/WithHelperText';
import { useTranslation } from '../../hooks/useTranslation';
import { getDefaultStatusColor } from '../../utils/status/common';

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
        <div style={{ height: '230px', width: '230px' }}>
          <ChartDonut
            ariaDesc={title}
            ariaTitle={title}
            constrainToVisibleArea
            colorScale={isEmpty ? [getDefaultStatusColor('unknown')] : data.map((datum) => datum.color)}
            data={
              isEmpty
                ? [{ x: '', y: 100 }]
                : data.map((datum) => ({
                    x: `${datum.y}% ${datum.x}`,
                    y: datum.y,
                  }))
            }
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
                  {helperText ? <WithHelperText showLabel ariaLabel={title} content={helperText} /> : title}
                </Flex>
              </foreignObject>
            }
          />
        </div>
      </FlexItem>
      <FlexItem>
        {isEmpty ? (
          <TextContent>
            <Text component={TextVariants.small}>{t('No devices')}</Text>
          </TextContent>
        ) : (
          <Legend rows={[firstRow, secondRow]} />
        )}
      </FlexItem>
    </Flex>
  );
};

export default DonutChart;
