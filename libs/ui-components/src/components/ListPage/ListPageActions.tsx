import * as React from 'react';
import { TFunction } from 'react-i18next';

import { DeviceDecommissionTargetType } from '@flightctl/types';
import { ListAction, ListActionProps, ListActionResult } from './types';

import DeleteModal from '../modals/DeleteModal/DeleteModal';
import DecommissionModal from '../modals/DecommissionModal/DecommissionModal';
import { useTranslation } from '../../hooks/useTranslation';
import { getDisabledTooltipProps } from '../../utils/tooltip';

type DeleteResourceType = 'EnrollmentRequest' | 'ResourceSync' | 'Device';
type DecommissionResourceType = 'Device';

type ResourceType = DeleteResourceType | DecommissionResourceType;

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
    const popperProps = getDisabledTooltipProps(disabledReason);
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
}: ListActionProps<DecommissionResourceType, { target: DeviceDecommissionTargetType }>): ListActionResult => {
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
