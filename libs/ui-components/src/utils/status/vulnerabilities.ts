import { TFunction } from 'react-i18next';

import { SeverityCriticalIcon } from '@patternfly/react-icons/dist/js/icons/severity-critical-icon';
import SeverityImportantIcon from '@patternfly/react-icons/dist/js/icons/severity-important-icon';
import SeverityModerateIcon from '@patternfly/react-icons/dist/js/icons/severity-moderate-icon';
import SeverityMinorIcon from '@patternfly/react-icons/dist/js/icons/severity-minor-icon';
import SeverityNoneIcon from '@patternfly/react-icons/dist/js/icons/severity-none-icon';
import SeverityUndefinedIcon from '@patternfly/react-icons/dist/js/icons/severity-undefined-icon';

import { Vulnerability } from '@flightctl/types/alpha';
import { StatusItem } from './common';
import { VULNERABILITY_SEVERITY_COLOR } from '../vulnerabilities';

export const defaultVulnerabilitySeverityStatusItem = (t: TFunction): StatusItem<Vulnerability.severity> => ({
  id: Vulnerability.severity.UNKNOWN,
  label: t('Undefined'),
  level: 'unknown',
  customIcon: SeverityUndefinedIcon,
  customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.UNKNOWN],
});

export const getVulnerabilitySeverityStatusItems = (t: TFunction): StatusItem<Vulnerability.severity>[] => [
  {
    id: Vulnerability.severity.CRITICAL,
    label: t('Critical'),
    level: 'danger',
    customIcon: SeverityCriticalIcon,
    customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.CRITICAL],
  },
  {
    id: Vulnerability.severity.HIGH,
    label: t('Important'),
    level: 'custom',
    customIcon: SeverityImportantIcon,
    customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.HIGH],
  },
  {
    id: Vulnerability.severity.MEDIUM,
    label: t('Moderate'),
    level: 'custom',
    customIcon: SeverityModerateIcon,
    customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.MEDIUM],
  },
  {
    id: Vulnerability.severity.LOW,
    label: t('Low'),
    level: 'custom',
    customIcon: SeverityMinorIcon,
    customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.LOW],
  },
  {
    id: Vulnerability.severity.NONE,
    label: t('None'),
    level: 'custom',
    customIcon: SeverityNoneIcon,
    customColor: VULNERABILITY_SEVERITY_COLOR[Vulnerability.severity.NONE],
  },
  // Unknown
  defaultVulnerabilitySeverityStatusItem(t),
];
