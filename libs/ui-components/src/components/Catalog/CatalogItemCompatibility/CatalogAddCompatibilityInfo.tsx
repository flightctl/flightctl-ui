import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';

import type { DeviceFeatures } from '@flightctl/types/alpha';
import { useTranslation } from '../../../hooks/useTranslation';
import { deviceFeaturesToFilters } from '../../../utils/catalogDeviceFeatures';
import CatalogFeatureRequirements from './CatalogFeatureRequirements';

// Placement: Edit Fleet/Device wizard -> Select catalog item (step to select the channel and version)
// Condition: The catalog item has device features.
const CatalogAddCompatibilityInfo = ({ featureRequirements }: { featureRequirements?: DeviceFeatures }) => {
  const { t } = useTranslation();

  const featureFilters = React.useMemo(() => deviceFeaturesToFilters(featureRequirements), [featureRequirements]);
  if (!featureFilters || featureFilters.length === 0) {
    return null;
  }
  return (
    <Alert isInline variant="warning" title={t('Compatibility may vary')}>
      <Stack hasGutter>
        <StackItem>
          {t(
            'The catalog item may not run on devices that do not meet these requirements. Compatibility is checked when devices receive the template.',
          )}
        </StackItem>
        <StackItem>
          <details>
            <summary>{t('View device requirements')}</summary>
            <CatalogFeatureRequirements deviceFeatures={featureRequirements} />
          </details>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default CatalogAddCompatibilityInfo;
