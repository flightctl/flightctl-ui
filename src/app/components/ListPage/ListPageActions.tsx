import * as React from 'react';
import DeleteModal from '../DeleteModal/DeleteModal';
import { IAction } from '@patternfly/react-table';

export type DeleteListActionResult = {
  deleteAction: (params: { resourceId: string; resourceName?: string; disabledReason?: string | boolean }) => IAction;
  deleteModal: React.ReactNode;
};

type DeleteListActionProps = {
  onDelete: (resourceId: string) => Promise<unknown>;
  resourceType: string;
};

export const useDeleteListAction = ({ resourceType, onDelete }: DeleteListActionProps): DeleteListActionResult => {
  const [deleteResource, setDeleteResource] = React.useState<string>();
  const [name, setName] = React.useState<string>();
  const deleteAction: DeleteListActionResult['deleteAction'] = ({ resourceId, resourceName, disabledReason }) => {
    const popperProps = disabledReason ? { tooltipProps: { content: disabledReason } } : undefined;
    return {
      title: 'Delete',
      isAriaDisabled: !!disabledReason,
      ...popperProps,
      onClick: () => {
        setDeleteResource(resourceId);
        setName(resourceName);
      },
    };
  };

  const onClose = () => {
    setDeleteResource(undefined);
    setName(undefined);
  };
  const deleteModal = deleteResource && (
    <DeleteModal
      resourceType={resourceType}
      resourceName={name || deleteResource}
      onClose={onClose}
      onDelete={async () => {
        await onDelete(deleteResource);
        onClose();
      }}
    />
  );

  return { deleteAction, deleteModal };
};
