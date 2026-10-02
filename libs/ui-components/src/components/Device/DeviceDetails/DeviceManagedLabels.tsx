import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import type { ManagedLabels } from '../../../hooks/useDeviceLabelProvenance';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlPageDrawer from '../../common/FlightCtlPageDrawer';
import { ManagedLabelsView } from '../../common/LabelsView';

export const DERIVED_MANAGED_LABELS_LIMIT = 5;

/**
 * Derived chips inline; full managed label set in the drawer.
 * Primary labels already appear on System info / Custom data cards.
 */
const DeviceManagedLabels = ({ managedLabels }: { managedLabels: ManagedLabels }) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const derivedLabels = React.useMemo(
    () => managedLabels.items.filter((label) => label.kind !== 'primary'),
    [managedLabels],
  );

  return (
    <>
      <Stack hasGutter>
        {managedLabels.derivedCount === 0 ? (
          <StackItem>
            <Alert isInline isPlain variant="info" title={t('No additional device-reported labels')}>
              {t(
                'Values that already appear in system info or custom data stay on those fields. Use View all to review the full mapped label set.',
              )}
            </Alert>
          </StackItem>
        ) : (
          <StackItem className="fctl-managed-labels-view">
            <ManagedLabelsView managedLabels={derivedLabels} showOnly={DERIVED_MANAGED_LABELS_LIMIT} onlyDerived />

            {managedLabels.derivedCount > DERIVED_MANAGED_LABELS_LIMIT && (
              <Content className="pf-v6-u-mt-sm">
                {t('+{{itemCount}} more', {
                  itemCount: managedLabels.derivedCount - DERIVED_MANAGED_LABELS_LIMIT,
                })}
              </Content>
            )}
          </StackItem>
        )}
        {managedLabels.totalCount > 0 && (
          <StackItem>
            <Button variant="link" isInline onClick={() => setDrawerOpen(true)}>
              {t('View all device-reported labels ({{num}})', { num: managedLabels.totalCount })}
            </Button>
          </StackItem>
        )}
      </Stack>
      <FlightCtlPageDrawer
        isExpanded={drawerOpen}
        panelContent={
          <>
            <DrawerHead>
              <Content component={ContentVariants.h3}>{t('Device-reported labels')}</Content>
              <DrawerActions>
                <DrawerCloseButton onClose={() => setDrawerOpen(false)} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert isInline variant="info" title={t('Read-only')}>
                    {t(
                      'These values come from device status via organization mappings. Configuration is org-level only; they cannot be edited on the device.',
                    )}
                  </Alert>
                </StackItem>
                <StackItem>
                  <ManagedLabelsView managedLabels={managedLabels.items} />
                </StackItem>
              </Stack>
            </DrawerPanelBody>
          </>
        }
      />
    </>
  );
};

export default DeviceManagedLabels;
