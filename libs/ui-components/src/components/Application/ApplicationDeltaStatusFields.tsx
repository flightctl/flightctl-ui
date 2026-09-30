import * as React from 'react';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';

import type { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import LabelWithHelperText from '../common/WithHelperText';

const ApplicationDeltaStatusFields = ({ appStatus }: { appStatus: DeviceApplicationStatus }) => {
  const { t } = useTranslation();

  // Applications use the "status.applications.size" field
  const deltaSize = appStatus.size;
  const fallbackReason = appStatus.lastDelta?.fallbackReason;
  if (!deltaSize && !fallbackReason) {
    return null;
  }

  return (
    <>
      {deltaSize && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <LabelWithHelperText
              label={t('Expected update size')}
              content={t(
                'Estimated download size for this application update. Uses a delta artifact when available, otherwise the full image size.',
              )}
            />
          </DescriptionListTerm>
          <DescriptionListDescription>{deltaSize}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {fallbackReason && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <LabelWithHelperText
              label={t('Last delta update message')}
              content={t(
                'The most recent update attempt used a full image pull after a delta apply failed. The update may still have completed successfully.',
              )}
            />
          </DescriptionListTerm>
          <DescriptionListDescription>{fallbackReason}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </>
  );
};

export default ApplicationDeltaStatusFields;
