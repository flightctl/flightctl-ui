import * as React from 'react';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { IAction } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';

export type DeleteListActionResult = {
  deleteAction: (params: { resourceId: string; resourceName?: string; disabledReason?: string | boolean }) => IAction;
  deleteModal: React.ReactNode;
};

type DeleteListActionProps = {
  onDelete: (resourceId: string) => Promise<unknown>;
  resourceType: string;
};

export const useDeleteListAction = ({ resourceType, onDelete }: DeleteListActionProps): DeleteListActionResult => {
  const { t } = useTranslation();
  const [deleteResourceId, setDeleteResourceId] = React.useState<string>();
  const [name, setName] = React.useState<string>();
  const deleteAction: DeleteListActionResult['deleteAction'] = ({ resourceId, resourceName, disabledReason }) => {
    const popperProps = disabledReason ? { tooltipProps: { content: disabledReason } } : undefined;
    return {
      title: t('Delete'),
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
      resourceType={resourceType}
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
