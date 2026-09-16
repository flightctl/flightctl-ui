import * as React from 'react';
import { Flex, FlexItem, Icon, Label, Stack, StackItem } from '@patternfly/react-core';
import InProgressIcon from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import {
  ConditionType,
  type DeltaGenerationStatus,
  type DeviceDeltaApplyStatus,
  type DeviceStatus,
} from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import LabelWithHelperText from '../../common/WithHelperText';
import { StatusDisplayContent } from '../../Status/StatusDisplay';
import { getCondition } from '../../../utils/api';

const getBooleanValue = (value: string | boolean | undefined | null): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 'true';
};

const DeviceDeltaEligibilityStatus = ({ deviceStatus }: { deviceStatus: DeviceStatus | undefined }) => {
  const { t } = useTranslation();

  const deltaEligible = getBooleanValue(deviceStatus?.systemInfo?.deltaEligible);
  const ociDeltaVersion = deviceStatus?.systemInfo?.ociDeltaVersion;

  if (deltaEligible !== true) {
    return <StatusDisplayContent level="info" label={t('Not eligible')} />;
  }

  if (!ociDeltaVersion) {
    return (
      <StatusDisplayContent level="warning" label={t('Device eligible for delta updates, but oci-delta not found')} />
    );
  }

  return <StatusDisplayContent level="success" label={t('Eligible')} />;
};

const DeltaInfoField = ({ label, content, value }: { label: string; content: string; value: React.ReactNode }) => {
  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
        <LabelWithHelperText label={label} content={content} />
      </FlexItem>
      <FlexItem>{value}</FlexItem>
    </Flex>
  );
};

const DeviceDeltaUpdateStatus = ({ lastDelta }: { lastDelta?: DeviceDeltaApplyStatus }) => {
  const { t } = useTranslation();

  const lastDeltaSize = lastDelta?.size;
  const lastReason = lastDelta?.fallbackReason;
  if (!lastDeltaSize && !lastReason) {
    return null;
  }

  return (
    <>
      {lastDeltaSize && (
        <DeltaInfoField
          label={t('Estimated OS update size')}
          content={t(
            'Estimated download size for the most recent OS update. Uses a delta artifact when available, otherwise the full image size.',
          )}
          value={lastDeltaSize}
        />
      )}
      {lastReason && (
        <DeltaInfoField
          label={t('Delta update fallback')}
          content={t(
            'The most recent OS update pulled the full image after it failed to apply a delta artifact. The update may still have completed successfully.',
          )}
          value={lastReason}
        />
      )}
    </>
  );
};

const DeviceDeltaUpdateProgress = ({ deltaGeneration }: { deltaGeneration: DeltaGenerationStatus }) => {
  const { t } = useTranslation();

  return (
    <DeltaInfoField
      label={t('Delta generation progress')}
      content={t(
        'Incremental update artifacts are being generated before this device receives its updated configuration.',
      )}
      value={
        <Label
          variant="outline"
          icon={
            <Icon>
              <InProgressIcon />
            </Icon>
          }
        >
          {t('Completed {{ completed }} of {{ total }} artifacts', {
            completed: deltaGeneration.completed,
            total: deltaGeneration.total,
          })}
        </Label>
      }
    />
  );
};

const DeviceDeltaUpdateDetails = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const showDeltaProgress = getCondition(deviceStatus?.conditions, ConditionType.DeviceDeltaPreparing);

  return (
    <Stack>
      <StackItem>
        <DeviceDeltaEligibilityStatus deviceStatus={deviceStatus} />
      </StackItem>
      {showDeltaProgress && deviceStatus?.deltaGeneration && (
        <StackItem>
          <DeviceDeltaUpdateProgress deltaGeneration={deviceStatus.deltaGeneration} />
        </StackItem>
      )}
      <StackItem>
        <DeviceDeltaUpdateStatus lastDelta={deviceStatus?.os?.lastDelta} />
      </StackItem>
    </Stack>
  );
};

export default DeviceDeltaUpdateDetails;
