import { getErrorMessage } from '@app/utils/error';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

type DeleteModalProps = {
  onDelete: () => Promise<unknown>;
  onClose: VoidFunction;
  resourceType: string;
  resourceName: string;
};

const DeleteModal: React.FC<DeleteModalProps> = ({ onDelete, onClose, resourceType, resourceName }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <Modal
      title={t('Delete {{resourceType}} ?', { resourceType })}
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
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsDeleting(false);
            }
          }}
        >
          {t('Delete')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <Trans t={t}>
            Are you sure you want to delete {resourceType} <b>{resourceName}</b>?
          </Trans>
        </StackItem>
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title={t('An error occured')}>
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteModal;
