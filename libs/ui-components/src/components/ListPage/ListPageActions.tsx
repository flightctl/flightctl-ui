import * as React from 'react';
import { TFunction, Trans } from 'react-i18next';

import { DeviceDecommissionTargetType } from '@flightctl/types';
import { ListAction, ListActionProps, ListActionResult } from './types';

import { useTranslation } from '../../hooks/useTranslation';
import { getDisabledTooltipProps } from '../../utils/tooltip';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import DecommissionModal from '../modals/DecommissionModal/DecommissionModal';
import ResumeDevicesModal from '../modals/ResumeDevicesModal/ResumeDevicesModal';

type DeleteResourceType = 'EnrollmentRequest' | 'ResourceSync' | 'Device';
type DeviceOnlyResourceType = 'Device';

type ResourceType = 'Device' | 'EnrollmentRequest' | 'ResourceSync';

const getResourceTypeLabel = (t: TFunction, resourceType: ResourceType) => {
  switch (resourceType) {
    case 'Device':
      return t('device');
    case 'EnrollmentRequest':
      return t('pending device');
    case 'ResourceSync':
      return t('resource sync');
  }
};

export const useDeleteListAction = ({
  resourceType,
  onConfirm,
}: ListActionProps<DeleteResourceType, never>): ListActionResult => {
  const { t } = useTranslation();
  const [deleteResourceId, setDeleteResourceId] = React.useState<string>();
  const [name, setName] = React.useState<string>();

  const resourceTypeLabel = getResourceTypeLabel(t, resourceType);

  const deleteAction: ListAction = ({ resourceId, resourceName, disabledReason }) => {
    const popperProps = disabledReason ? { tooltipProps: { content: disabledReason } } : undefined;
    return {
      title: t('Delete {{ resourceType }}', { resourceType: resourceTypeLabel }),
      isAriaDisabled: !!disabledReason,
      ...popperProps,
      onClick: () => {
        setDeleteResourceId(resourceId);
        setName(resourceName);
      },
    };
  };

  const onClose = () => {
    setDeleteResourceId(undefined);
    setName(undefined);
  };

  const deleteModal = deleteResourceId && (
    <DeleteModal
      resourceType={resourceTypeLabel}
      resourceName={name || deleteResourceId}
      onClose={onClose}
      onDelete={async () => {
        await onConfirm(deleteResourceId);
        onClose();
      }}
    />
  );

  return { action: deleteAction, modal: deleteModal };
};

export const useDecommissionListAction = ({
  onConfirm,
}: ListActionProps<DeviceOnlyResourceType, { target: DeviceDecommissionTargetType }>): ListActionResult => {
  const { t } = useTranslation();
  const [decommissionDeviceId, setDecommissionDeviceId] = React.useState<string>();

  const decommissionAction: ListAction = ({ resourceId, disabledReason }) => {
    const popperProps = getDisabledTooltipProps(disabledReason);
    return {
      title: t('Decommission device'),
      ...popperProps,
      onClick: () => {
        setDecommissionDeviceId(resourceId);
      },
    };
  };

  const onClose = () => {
    setDecommissionDeviceId(undefined);
  };

  const decommissionModal = decommissionDeviceId && (
    <DecommissionModal
      onClose={onClose}
      onDecommission={async (target: DeviceDecommissionTargetType) => {
        await onConfirm(decommissionDeviceId, { target });
      }}
    />
  );

  return { action: decommissionAction, modal: decommissionModal };
};

export const useResumeListAction = (onResumeComplete?: VoidFunction): ListActionResult => {
  const { t } = useTranslation();
  const [deviceId, setDeviceId] = React.useState<string>();
  const [deviceName, setDeviceName] = React.useState<string>();

  const resumeAction: ListAction = ({ resourceId, resourceName, disabledReason }) => {
    const popperProps = getDisabledTooltipProps(disabledReason);
    return {
      title: t('Resume device'),
      ...popperProps,
      onClick: () => {
        setDeviceId(resourceId);
        setDeviceName(resourceName || resourceId);
      },
    };
  };

  const onClose = (hasResumed?: boolean) => {
    setDeviceId(undefined);
    setDeviceName(undefined);
    if (hasResumed) {
      onResumeComplete?.();
    }
  };

  const resumeModal = deviceId && (
    <ResumeDevicesModal
      mode="device"
      title={
        <Trans t={t}>
          You are about to resume device <strong>{deviceName}</strong>
        </Trans>
      }
      selector={{ fieldSelector: `metadata.name=${deviceId}` }}
      expectedCount={1}
      onClose={onClose}
    />
  );

  return { action: resumeAction, modal: resumeModal };
};
