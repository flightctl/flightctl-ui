import * as React from 'react';
import {
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { type CveCountsBySeverity, type Vulnerability } from '@flightctl/types/alpha';
import SeverityUndefinedIcon from '@patternfly/react-icons/dist/js/icons/severity-undefined-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { useVulnerabilitySummary } from '../../hooks/useVulnerabilitySummary';
import { type StatusItem } from '../../utils/status/common';
import {
  type SeverityTilesLayout,
  getSeverityCountValue,
  getSeverityLabel,
  getVisibleSeverityTilesConfig,
} from '../../utils/vulnerabilities';
import { useDevicesSummary } from '../Device/DevicesPage/useDevices';
import {
  defaultVulnerabilitySeverityStatusItem,
  getVulnerabilitySeverityStatusItems,
} from '../../utils/status/vulnerabilities';
import { VulnerabilitiesOverviewEmptyState } from './VulnerabilitiesEmptyState';

import './SecurityOverviewSummary.css';

type Severity = Vulnerability.severity;

type SeverityStatProps = {
  severity: Severity;
  item: StatusItem<Severity>;
  count: number;
  interactive?: boolean;
  isSelected?: boolean;
  onToggle?: (severity: Severity) => void;
};

const SeverityStat = ({
  count,
  severity,
  item,
  interactive = false,
  isSelected = false,
  onToggle,
}: SeverityStatProps) => {
  const { t } = useTranslation();

  const SeverityIcon = item.customIcon || SeverityUndefinedIcon;
  const isSelectable = interactive && count > 0;
  const severityLabel = getSeverityLabel(severity, t);

  const handleClick = () => {
    if (isSelectable) {
      onToggle?.(severity);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isSelectable) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle?.(severity);
    }
  };

  const tile = (
    <Flex
      className={[
        'fctl-security-overview-summary-box',
        count > 0 ? 'fctl-security-overview-summary-box__filled' : '',
        severity.toLowerCase(),
        isSelectable ? 'fctl-security-overview-summary-box--interactive' : '',
        isSelected ? 'fctl-security-overview-summary-box--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      direction={{ default: 'column' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsCenter' }}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={isSelectable ? handleClick : undefined}
      onKeyDown={isSelectable ? handleKeyDown : undefined}
      aria-pressed={isSelectable ? isSelected : undefined}
      aria-label={
        isSelectable ? t('Filter table by {{severity}} severity', { severity: severityLabel }) : severityLabel
      }
    >
      <FlexItem>
        <Flex justifyContent={{ default: 'justifyContentCenter' }}>
          <FlexItem>
            <Icon>
              <SeverityIcon />
            </Icon>
          </FlexItem>
          <FlexItem className="pf-v6-u-font-size-xl">
            <strong>{count}</strong>
          </FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem>{severityLabel}</FlexItem>
    </Flex>
  );

  if (isSelectable) {
    return (
      <Tooltip content={t('Filter table by {{severity}} severity', { severity: severityLabel })}>
        <span className="fctl-security-overview-summary-tile-wrapper">{tile}</span>
      </Tooltip>
    );
  }

  return tile;
};

type SeverityTilesGridProps = {
  counts: CveCountsBySeverity;
  layout?: SeverityTilesLayout;
  interactive?: boolean;
  selectedSeverities?: Severity[];
  onSeverityToggle?: (severity: Severity) => void;
  isLoading?: boolean;
};

const SeverityTilesGrid = ({
  counts,
  layout = 'overview',
  interactive = false,
  selectedSeverities = [],
  onSeverityToggle,
  isLoading = false,
}: SeverityTilesGridProps) => {
  const { t } = useTranslation();
  const statusItems = getVulnerabilitySeverityStatusItems(t);
  const { severities, columnSpan } = getVisibleSeverityTilesConfig(counts, layout);

  if (isLoading) {
    return (
      <Grid hasGutter role="group" aria-label={t('Vulnerability counts by severity')}>
        {severities.map((severity) => (
          <GridItem key={severity} xl={columnSpan} span={6}>
            <Skeleton height="5.5rem" />
          </GridItem>
        ))}
      </Grid>
    );
  }

  return (
    <Grid hasGutter role="group" aria-label={t('Vulnerability counts by severity')}>
      {severities.map((severity) => {
        const item =
          statusItems.find((statusItem) => statusItem.id === severity) || defaultVulnerabilitySeverityStatusItem(t);
        const count = getSeverityCountValue(severity, counts);
        return (
          <GridItem key={severity} xl={columnSpan} span={6}>
            <SeverityStat
              severity={severity}
              item={item}
              count={count}
              interactive={interactive}
              isSelected={selectedSeverities.includes(severity)}
              onToggle={onSeverityToggle}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

type SecurityOverviewDetailProps = {
  counts: CveCountsBySeverity;
  selectedSeverities?: Severity[];
  onSeverityToggle?: (severity: Severity) => void;
  isLoading?: boolean;
};

export const SecurityOverviewSummaryOverview = () => {
  const { t } = useTranslation();
  const { counts } = useVulnerabilitySummary();
  const [devicesSummary, isLoadingDevices] = useDevicesSummary({});

  const hasVulnerabilities = counts.total > 0;
  const hasDevices = !isLoadingDevices && (devicesSummary?.total || 0) > 0;

  return (
    <Stack hasGutter>
      <StackItem>
        <Stack>
          <StackItem className="pf-v6-u-font-size-4xl">{hasDevices ? counts.total : '--'}</StackItem>
          <StackItem className="pf-v6-u-mb-md">{t('Total active vulnerabilities.')}</StackItem>
          {hasVulnerabilities ? (
            <StackItem>{t('CVEs affecting images deployed across your managed fleet and devices.')}</StackItem>
          ) : (
            <VulnerabilitiesOverviewEmptyState hasDevices={hasDevices} />
          )}
        </Stack>
      </StackItem>
      <StackItem>
        <Divider className="pf-v6-u-my-md" />
      </StackItem>
      <StackItem>
        <SeverityTilesGrid counts={counts} />
      </StackItem>
    </Stack>
  );
};

const SecurityOverviewSummary = ({
  counts,
  selectedSeverities = [],
  onSeverityToggle,
  isLoading = false,
}: SecurityOverviewDetailProps) => {
  return (
    <SeverityTilesGrid
      counts={counts}
      layout="entityDetail"
      interactive
      selectedSeverities={selectedSeverities}
      onSeverityToggle={onSeverityToggle}
      isLoading={isLoading}
    />
  );
};

export default SecurityOverviewSummary;
