import * as React from 'react';
import { Divider, Flex, FlexItem, Icon, Stack, StackItem } from '@patternfly/react-core';
import { Vulnerability } from '@flightctl/types/alpha';
import SeverityUndefinedIcon from '@patternfly/react-icons/dist/js/icons/severity-undefined-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { useVulnerabilitySummary } from '../../hooks/useVulnerabilitySummary';
import { StatusItem } from '../../utils/status/common';
import { VULNERABILITY_SEVERITY_ORDER, getSeverityCountValue, getSeverityLabel } from '../../utils/vulnerabilities';
import { useDevicesSummary } from '../Device/DevicesPage/useDevices';
import {
  defaultVulnerabilitySeverityStatusItem,
  getVulnerabilitySeverityStatusItems,
} from '../../utils/status/vulnerabilities';
import VulnerabilitiesEmptyState from './VulnerabilitiesEmptyState';

import './SecurityOverviewSummary.css';

type SeverityStatProps = {
  severity: Vulnerability.severity;
  item: StatusItem<Vulnerability.severity>;
  count: number;
};

const SeverityStat = ({ count, severity, item }: SeverityStatProps) => {
  const { t } = useTranslation();

  const SeverityIcon = item.customIcon || SeverityUndefinedIcon;
  const iconColor = item.customColor;

  // Background color is only set for severities with count > 0
  const statusClass = count === 0 ? '' : severity.toLowerCase();
  return (
    <Flex
      className={`fctl-security-overview-summary-box ${statusClass}`}
      direction={{ default: 'column' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem>
        <Flex justifyContent={{ default: 'justifyContentCenter' }}>
          <FlexItem>
            <Icon style={{ '--pf-v6-c-icon__content--Color': iconColor } as React.CSSProperties}>
              <SeverityIcon />
            </Icon>
          </FlexItem>
          <FlexItem className="pf-v6-u-font-size-xl">
            <strong>{count}</strong>
          </FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem>{getSeverityLabel(severity, t)}</FlexItem>
    </Flex>
  );
};

const SecurityOverviewSummary = () => {
  const { t } = useTranslation();
  const { counts } = useVulnerabilitySummary();
  const [devicesSummary, isLoadingDevices] = useDevicesSummary({});

  const hasVulnerabilities = counts.total > 0;
  const hasAllSeverities = counts.none > 0 || counts.unknown > 0;
  const hasDevices = !isLoadingDevices && (devicesSummary?.total || 0) > 0;

  const statusItems = getVulnerabilitySeverityStatusItems(t);
  const severityThresholdIndex = VULNERABILITY_SEVERITY_ORDER.indexOf(Vulnerability.severity.LOW);

  return (
    <Stack hasGutter>
      <StackItem>
        <Stack>
          <StackItem className="pf-v6-u-font-size-4xl">{hasDevices ? counts.total : '--'}</StackItem>
          <StackItem className="pf-v6-u-mb-md">{t('Total active vulnerabilities.')}</StackItem>
          {hasVulnerabilities ? (
            <StackItem>{t('CVEs affecting images deployed across your managed fleet and devices.')}</StackItem>
          ) : (
            <VulnerabilitiesEmptyState hasDevices={hasDevices} />
          )}
        </Stack>
      </StackItem>
      <StackItem>
        <Divider className="pf-v6-u-my-md" />
      </StackItem>
      <StackItem>
        <div
          role="group"
          aria-label={t('Vulnerability counts by severity')}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${hasAllSeverities ? 3 : 4}, minmax(0, 1fr))`,
            gap: 'var(--pf-t--global--spacer--md)',
          }}
        >
          {VULNERABILITY_SEVERITY_ORDER.map((severity, index) => {
            // If none/unknown severities are present, we show all severities.
            // Otherwise, we only show severities of the main categories (Critical to Low)
            if (!hasAllSeverities && index > severityThresholdIndex) {
              return null;
            }

            const item = statusItems.find((item) => item.id === severity) || defaultVulnerabilitySeverityStatusItem(t);
            return (
              <SeverityStat
                key={severity}
                count={getSeverityCountValue(severity, counts)}
                severity={severity}
                item={item}
              />
            );
          })}
        </div>
      </StackItem>
    </Stack>
  );
};

export default SecurityOverviewSummary;
