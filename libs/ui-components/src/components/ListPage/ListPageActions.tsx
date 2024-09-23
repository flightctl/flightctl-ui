import * as React from 'react';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { IAction } from '@patternfly/react-table';
import { useTranslation } from '../../hooks/useTranslation';
import { TFunction } from 'react-i18next';

export type DeleteListActionResult = {
  deleteAction: (params: { resourceId: string; resourceName?: string; disabledReason?: string | boolean }) => IAction;
  deleteModal: React.ReactNode;
};

type ResourceType = 'Device' | 'EnrollmentRequest' | 'ResourceSync';

type DeleteListActionProps = {
  onDelete: (resourceId: string) => Promise<unknown>;
  resourceType: 'Device' | 'EnrollmentRequest' | 'ResourceSync';
};

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

export const useDeleteListAction = ({ resourceType, onDelete }: DeleteListActionProps): DeleteListActionResult => {
  const { t } = useTranslation();
  const [deleteResourceId, setDeleteResourceId] = React.useState<string>();
  const [name, setName] = React.useState<string>();

  const resourceTypeLabel = getResourceTypeLabel(t, resourceType);

  const deleteAction: DeleteListActionResult['deleteAction'] = ({ resourceId, resourceName, disabledReason }) => {
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
        await onDelete(deleteResourceId);
        onClose();
      }}
    />
  );

  return { deleteAction, deleteModal };
};
