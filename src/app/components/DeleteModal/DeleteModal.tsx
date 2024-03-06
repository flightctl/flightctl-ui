import { getErrorMessage } from '@app/utils/error';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';

type DeleteModalProps = {
  onDelete: () => Promise<unknown>;
  onClose: VoidFunction;
  resourceType: string;
  resourceName: string;
};

const DeleteModal: React.FC<DeleteModalProps> = ({ onDelete, onClose, resourceType, resourceName }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <Modal
      title={`Delete ${resourceType} ?`}
      isOpen
      onClose={onClose}
      variant="small"
      titleIconVariant="warning"
      actions={[
        <Button
          key="confirm"
          variant="danger"
          isDisabled={isDeleting}
          isLoading={isDeleting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsDeleting(true);
              await onDelete();
              setIsDeleting(false);
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          Are you sure you want to delete {resourceType} <b>{resourceName}</b>?
        </StackItem>
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title="An error occured">
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteModal;
