import { TFunction } from 'react-i18next';
import { CveCountsBySeverity, Vulnerability, VulnerabilityGroup } from '@flightctl/types/alpha';

const SeverityColorCritical = 'var(--pf-t--global--icon--color--severity--critical--default)';
const SeverityColorImportant = 'var(--pf-t--global--icon--color--severity--important--default)';
const SeverityColorModerate = 'var(--pf-t--global--icon--color--severity--moderate--default)';
const SeverityColorMinor = 'var(--pf-t--global--icon--color--severity--minor--default)';
const SeverityColorNone = 'var(--pf-t--global--icon--color--severity--none--default)';

type Severity = Vulnerability.severity;

export const VULNERABILITY_SEVERITY_ORDER: Severity[] = [
  Vulnerability.severity.CRITICAL,
  Vulnerability.severity.HIGH,
  Vulnerability.severity.MEDIUM,
  Vulnerability.severity.LOW,
  Vulnerability.severity.NONE,
  Vulnerability.severity.UNKNOWN,
];

export const VULNERABILITY_SEVERITY_COLOR: Record<Severity, string> = {
  [Vulnerability.severity.CRITICAL]: SeverityColorCritical,
  [Vulnerability.severity.HIGH]: SeverityColorImportant,
  [Vulnerability.severity.MEDIUM]: SeverityColorModerate,
  [Vulnerability.severity.LOW]: SeverityColorMinor, // grey in PF6
  [Vulnerability.severity.NONE]: SeverityColorNone, // blue in PF6
  [Vulnerability.severity.UNKNOWN]: SeverityColorMinor, // grey in PF6
};

export const VULNERABILITY_FILTER_QUERY_PARAM = 'cveId';

export const isVulnerabilityGroup = (
  vulnerability: Vulnerability | VulnerabilityGroup,
): vulnerability is VulnerabilityGroup => 'findings' in vulnerability;

export const getSeverityCountValue = (severity: Severity, counts: CveCountsBySeverity) => {
  switch (severity) {
    case Vulnerability.severity.CRITICAL:
      return counts.critical;
    case Vulnerability.severity.HIGH:
      return counts.high;
    case Vulnerability.severity.MEDIUM:
      return counts.medium;
    case Vulnerability.severity.LOW:
      return counts.low;
    case Vulnerability.severity.NONE:
      return counts.none;
    case Vulnerability.severity.UNKNOWN:
      return counts.unknown;
  }
};

export const getSeverityLabel = (severity: Severity, t: TFunction): string => {
  switch (severity) {
    case Vulnerability.severity.CRITICAL:
      return t('Critical');
    case Vulnerability.severity.HIGH:
      return t('Important');
    case Vulnerability.severity.MEDIUM:
      return t('Moderate');
    case Vulnerability.severity.LOW:
      return t('Low');
    case Vulnerability.severity.NONE:
      return t('None');
    case Vulnerability.severity.UNKNOWN:
    default:
      return t('Undefined');
  }
};
