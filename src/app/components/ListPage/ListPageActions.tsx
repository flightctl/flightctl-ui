import * as React from 'react';
import DeleteModal from '../DeleteModal/DeleteModal';

type DeleteListActionProps = {
  onDelete: (resourceId: string) => Promise<unknown>;
  resourceType: string;
};

export const useDeleteListAction = ({ resourceType, onDelete }: DeleteListActionProps) => {
  const [deleteResource, setDeleteResource] = React.useState<string>();
  const [name, setName] = React.useState<string>();
  const deleteAction = (resourceId: string, resourceName?: string) => ({
    title: 'Delete',
    onClick: () => {
      setDeleteResource(resourceId);
      setName(resourceName);
    },
  });

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
