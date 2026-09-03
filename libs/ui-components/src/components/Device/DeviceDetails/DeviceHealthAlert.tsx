import * as React from 'react';
import { Alert, Button, List, ListItem } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import type { DeviceHealthItem, DeviceOverallHealth } from '../../../hooks/useDeviceOverallHealth';

const DEVICE_STATUS_CARD_ID = 'device-status-card';
const DEVICE_APPLICATIONS_CARD_ID = 'device-applications-card';

const scrollToSection = (targetId: string) => {
  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const DeviceHealthAlertLink = ({ healthItem }: { healthItem: DeviceHealthItem }) => {
  const { t } = useTranslation();
  const { type, itemCount } = healthItem;
  if (itemCount === 0) {
    return null;
  }
  const targetId = type === 'apps' ? DEVICE_APPLICATIONS_CARD_ID : DEVICE_STATUS_CARD_ID;
  return (
    <Button variant="link" isInline onClick={() => scrollToSection(targetId)}>
      {type === 'apps'
        ? t('{{count}} application errors', { count: itemCount })
        : t('{{count}} status issues', { count: itemCount })}
    </Button>
  );
};

const DeviceHealthAlert = ({ deviceHealth }: { deviceHealth: DeviceOverallHealth }) => {
  const { t } = useTranslation();
  const alertRef = React.useRef<HTMLDivElement>(null);

  // PatternFly Alert manages expand state internally (defaults collapsed); expand on mount so jump links are visible.
  React.useLayoutEffect(() => {
    const toggle = alertRef.current?.querySelector<HTMLButtonElement>('.pf-v6-c-alert__toggle button');
    if (toggle?.getAttribute('aria-expanded') !== 'true') {
      toggle?.click();
    }
  }, []);

  if (deviceHealth.level === null) {
    return null;
  }

  const { statusHealth, appsHealth } = deviceHealth;
  return (
    <div ref={alertRef}>
      <Alert variant={deviceHealth.level} isInline isExpandable title={t('Issues detected')}>
        <List isPlain>
          {statusHealth.itemCount > 0 && (
            <ListItem>
              <DeviceHealthAlertLink healthItem={statusHealth} />
            </ListItem>
          )}
          {appsHealth.itemCount > 0 && (
            <ListItem>
              <DeviceHealthAlertLink healthItem={appsHealth} />
            </ListItem>
          )}
        </List>
      </Alert>
    </div>
  );
};

export default DeviceHealthAlert;
