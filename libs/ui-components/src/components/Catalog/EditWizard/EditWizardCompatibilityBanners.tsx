import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import type { Device, Fleet } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import CatalogFeatureRequirements from '../CatalogFeatureRequirements';
import {
  DeviceCatalogItemCompatibilityAlert,
  FleetCatalogItemCompatibilityAlert,
} from '../CatalogItemCompatibilityAlert';
import type { InstallSpecFormik } from '../InstallWizard/types';

type EditWizardCompatibilityBannersProps = {
  targetDevice?: Device;
  targetFleet?: Fleet;
};

/** Requirements + target compatibility alerts shown above the edit/deploy catalog wizard. */
const EditWizardCompatibilityBanners = ({ targetDevice, targetFleet }: EditWizardCompatibilityBannersProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallSpecFormik>();
  const featureRequirements = values.featureRequirements;

  if (!targetDevice && !targetFleet) {
    return null;
  }

  return (
    <Stack hasGutter className="pf-v6-u-m-md" style={{ height: 'fit-content' }}>
      <StackItem>
        <Alert isInline variant="info" title={t('Device requirements')}>
          <CatalogFeatureRequirements deviceFeatures={featureRequirements} />
        </Alert>
      </StackItem>
      {!!targetDevice && (
        <StackItem>
          <DeviceCatalogItemCompatibilityAlert device={targetDevice} featureRequirements={featureRequirements} />
        </StackItem>
      )}
      {!!targetFleet && (
        <StackItem>
          <FleetCatalogItemCompatibilityAlert
            fleetName={targetFleet.metadata.name as string}
            totalDevices={targetFleet.status?.devicesSummary?.total || 0}
            featureRequirements={featureRequirements}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default EditWizardCompatibilityBanners;
