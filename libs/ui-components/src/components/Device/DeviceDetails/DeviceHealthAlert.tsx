import * as React from 'react';
import { Alert, Button, List, ListItem } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { DeviceOverallHealth } from '../../../hooks/useDeviceOverallHealth';
import { deviceCardIds } from '../../DetailsPage/DetailsPageCard';

const scrollToSection = (targetId: string) => {
  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

type DeviceHealthAlertProps = {
  deviceHealth: DeviceOverallHealth;
  systemInfoHasErrors?: boolean;
  customInfoHasErrors?: boolean;
};

const DeviceHealthAlert = ({
  deviceHealth,
  systemInfoHasErrors = false,
  customInfoHasErrors = false,
}: DeviceHealthAlertProps) => {
  const { t } = useTranslation();
  const alertRef = React.useRef<HTMLDivElement>(null);

  const hasOverallHealthIssues = deviceHealth.level !== null || systemInfoHasErrors || customInfoHasErrors;

  // PatternFly Alert manages expand state internally (defaults collapsed); expand on mount so jump links are visible.
  React.useLayoutEffect(() => {
    const toggle = alertRef.current?.querySelector<HTMLButtonElement>('.pf-v6-c-alert__toggle button');
    if (toggle?.getAttribute('aria-expanded') !== 'true') {
      toggle?.click();
    }
  }, [hasOverallHealthIssues]);

  if (!hasOverallHealthIssues) {
    return null;
  }

  const { statusHealth, appsHealth } = deviceHealth;
  const variant = deviceHealth.level === 'danger' ? 'danger' : 'warning';

  return (
    <div ref={alertRef}>
      <Alert variant={variant} isInline isExpandable title={t('Issues detected')}>
        <List isPlain>
          {statusHealth.itemCount > 0 && (
            <ListItem>
              <Button variant="link" isInline onClick={() => scrollToSection(deviceCardIds.status)}>
                {t('{{count}} status issues', { count: statusHealth.itemCount })}
              </Button>
            </ListItem>
          )}
          {appsHealth.itemCount > 0 && (
            <ListItem>
              <Button variant="link" isInline onClick={() => scrollToSection(deviceCardIds.applications)}>
                {t('{{count}} application issues', { count: appsHealth.itemCount })}
              </Button>
            </ListItem>
          )}
          {systemInfoHasErrors && (
            <ListItem>
              <Button variant="link" isInline onClick={() => scrollToSection(deviceCardIds.systemInfo)}>
                {t('System information reporting is stale')}
              </Button>
            </ListItem>
          )}
          {customInfoHasErrors && (
            <ListItem>
              <Button variant="link" isInline onClick={() => scrollToSection(deviceCardIds.customInfo)}>
                {t('Custom data reporting is stale')}
              </Button>
            </ListItem>
          )}
        </List>
      </Alert>
    </div>
  );
};

export default DeviceHealthAlert;
