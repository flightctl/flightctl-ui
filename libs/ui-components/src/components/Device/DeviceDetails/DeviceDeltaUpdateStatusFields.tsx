import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { ConditionType, type DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import LabelWithHelperText from '../../common/WithHelperText';
import { getCondition } from '../../../utils/api';

const DeviceDeltaUpdateStatusFields = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();

  const lastDelta = deviceStatus?.os?.lastDelta;
  const downloadSize = lastDelta?.size;
  const fallbackReason = lastDelta?.fallbackReason;
  const deltaGeneration = deviceStatus?.deltaGeneration;
  const deltaPreparingCondition = getCondition(deviceStatus?.conditions, ConditionType.DeviceDeltaPreparing);
  const showProgress = Boolean(deltaPreparingCondition && deltaGeneration);

  if (!downloadSize && !fallbackReason && !showProgress) {
    return null;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3" size="md">
          {t('Delta update status')}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList isCompact className="fctl-device-status-fields">
          {downloadSize && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                <LabelWithHelperText
                  label={t('Update download size')}
                  content={t(
                    'Estimated download size for the current update. When a delta artifact is available, this reflects the smaller incremental download instead of the full OS image.',
                  )}
                  isInline
                />
              </DescriptionListTerm>
              <DescriptionListDescription>{downloadSize}</DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {showProgress && deltaGeneration && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                <LabelWithHelperText
                  label={t('Delta generation progress')}
                  content={t(
                    'Incremental update artifacts are being generated for this device. Its configuration update may continue once generation completes or the configured deadline is reached.',
                  )}
                  isInline
                />
              </DescriptionListTerm>
              <DescriptionListDescription>
                {t('Completed {{ completed }} of {{ total }} artifacts', {
                  completed: deltaGeneration.completed,
                  total: deltaGeneration.total,
                })}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {fallbackReason && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                <LabelWithHelperText
                  label={t('Delta fallback')}
                  content={t(
                    'The most recent update used a full OS image instead of an incremental delta. The overall update may still succeed.',
                  )}
                  isInline
                />
              </DescriptionListTerm>
              <DescriptionListDescription>{fallbackReason}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

export default DeviceDeltaUpdateStatusFields;
