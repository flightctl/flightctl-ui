import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Alert,
  Button,
  Modal /* data-codemods */,
  ModalBody /* data-codemods */,
  ModalFooter /* data-codemods */,
  ModalHeader /* data-codemods */,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';

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
    <Modal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Delete {{resourceType}} ?', { resourceType })} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              Are you sure you want to delete {resourceType} <b>{resourceName}</b>?
            </Trans>
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
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
          {t('Delete {{ resourceType }}', { resourceType })}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
