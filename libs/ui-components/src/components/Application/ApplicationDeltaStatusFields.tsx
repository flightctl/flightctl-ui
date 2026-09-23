import * as React from 'react';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';

import type { DeviceDeltaApplyStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import LabelWithHelperText from '../common/WithHelperText';

const ApplicationDeltaStatusFields = ({ lastDelta }: { lastDelta?: DeviceDeltaApplyStatus }) => {
  const { t } = useTranslation();

  const lastDeltaSize = lastDelta?.size;
  const lastReason = lastDelta?.fallbackReason;

  if (!lastDeltaSize && !lastReason) {
    return null;
  }

  return (
    <>
      {lastDeltaSize && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <LabelWithHelperText
              label={t('Expected update size')}
              content={t(
                'Estimated download size for this application update. Uses a delta artifact when available, otherwise the full image size.',
              )}
            />
          </DescriptionListTerm>
          <DescriptionListDescription>{lastDeltaSize}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {lastReason && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <LabelWithHelperText
              label={t('Last delta update message')}
              content={t(
                'The most recent update attempt used a full image pull after a delta apply failed. The update may still have completed successfully.',
              )}
            />
          </DescriptionListTerm>
          <DescriptionListDescription>{lastReason}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </>
  );
};

export default ApplicationDeltaStatusFields;
