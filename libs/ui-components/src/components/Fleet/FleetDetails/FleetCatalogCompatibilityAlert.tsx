import * as React from 'react';
import { Alert } from '@patternfly/react-core';

import type { Fleet } from '@flightctl/types';
import type { DeviceFeatures } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { mergeDeviceFeatures } from '../../../utils/catalogDeviceFeatures';
import { useCatalogItemsContext } from '../../Catalog/CatalogItemsContext';
import { FleetCatalogItemCompatibilityAlert } from '../../Catalog/CatalogItemCompatibility/CatalogItemCompatibilityAlert';
import { getVersionFeatureRequirements } from '../../CatalogComposition/catalogCompositionUtils';

// Placement: Fleet details page (above the main content).
// Condition: Fleet template has deployed catalog items with device features, catalog items are
// loaded, requirements are not contradictory, and some devices may not meet the merged requirements.
const FleetCatalogCompatibilityAlert = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const { getItem, isLoading, catalogItemIds } = useCatalogItemsContext();

  const { allFeatureRequirements, hasContradictingRequirements } = React.useMemo((): {
    allFeatureRequirements: DeviceFeatures | undefined;
    hasContradictingRequirements: boolean;
  } => {
    if (isLoading || catalogItemIds.length === 0) {
      return { allFeatureRequirements: undefined, hasContradictingRequirements: false };
    }
    try {
      return {
        allFeatureRequirements: mergeDeviceFeatures(
          ...catalogItemIds.map(({ ref }) => {
            const item = getItem(ref.catalog, ref.item);
            if (!item) {
              return undefined;
            }
            return getVersionFeatureRequirements(item, ref.version);
          }),
        ),
        hasContradictingRequirements: false,
      };
    } catch {
      return { allFeatureRequirements: undefined, hasContradictingRequirements: true };
    }
  }, [catalogItemIds, getItem, isLoading]);

  const fleetName = fleet.metadata.name as string;
  const totalDevices = fleet.status?.devicesSummary?.total || 0;

  if (hasContradictingRequirements) {
    return (
      <Alert isInline variant="danger" title={t('Catalog requirements conflict')}>
        {t(
          'The catalog items deployed to this fleet have contradicting device requirements. Some catalog items may not run on the same devices. Review the catalog deployments to resolve the conflict.',
        )}
      </Alert>
    );
  }

  return (
    <FleetCatalogItemCompatibilityAlert
      fleetName={fleetName}
      totalDevices={totalDevices}
      featureRequirements={allFeatureRequirements}
      context="fleetDetails"
    />
  );
};

export default FleetCatalogCompatibilityAlert;
