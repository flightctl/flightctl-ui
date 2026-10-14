import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import type { Device, Fleet } from '@flightctl/types';

import type { InstallSpecFormik } from '../InstallWizard/types';
import {
  DeviceCatalogItemCompatibilityAlert,
  FleetCatalogItemCompatibilityAlert,
} from './CatalogItemCompatibilityAlert';

type EditWizardCompatibilityBannersProps = {
  targetDevice?: Device;
  targetFleet?: Fleet;
};

// Placement: Fleet/Device catalog tab --> Edit/Deploy catalog item. (Seen above the wizard content)
// Condition: A target device or fleet is set (always true in this entry path).
const EditWizardCompatibilityBanners = ({ targetDevice, targetFleet }: EditWizardCompatibilityBannersProps) => {
  const { values } = useFormikContext<InstallSpecFormik>();

  if (!targetDevice && !targetFleet) {
    return null;
  }

  const featureRequirements = values.featureRequirements;
  return (
    <Stack hasGutter className="pf-v6-u-m-md" style={{ height: 'fit-content' }}>
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
