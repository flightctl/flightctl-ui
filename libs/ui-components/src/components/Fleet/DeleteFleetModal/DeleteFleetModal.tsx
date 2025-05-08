import * as React from 'react';
import { Trans } from 'react-i18next';
import { Alert, Button, Stack, StackItem } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core/next';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';

const DeleteFleetModal = ({ fleetId, onClose }: { fleetId: string; onClose: (hasDeleted?: boolean) => void }) => {
  const { t } = useTranslation();
  const { remove } = useFetch();

  const [error, setError] = React.useState<{ text: string; details?: string }>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>();

  const onDelete = async () => {
    try {
      await remove(`fleets/${fleetId}`);
    } catch (fleetErr) {
      setError({ text: t('Deletion of fleet {{fleetId}} failed.'), details: getErrorMessage(fleetErr) });
    }
  };

  return (
    <Modal
      isOpen
      onClose={() => {
        onClose();
      }}
      variant="small"
    >
      <ModalHeader title={t('Delete fleet ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              Are you sure you want to delete fleet <strong>{fleetId}</strong>?
            </Trans>
          </StackItem>
          <StackItem>
            {t(
              'Devices bound to this fleet may join another fleet matching their labels, otherwise they will remain unlinked from any fleet.',
            )}
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                <div>{error.text}</div>
                {error.details && <div>{t('Details: {{errorDetails}}', { errorDetails: error.details })}</div>}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="danger"
          isDisabled={isDeleting || !!error}
          isLoading={isDeleting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsDeleting(true);
              await onDelete();
              setIsDeleting(false);
              onClose(true);
            } catch {
              setIsDeleting(false);
            }
          }}
        >
          {t('Delete fleet')}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            onClose();
          }}
          isDisabled={isDeleting}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteFleetModal;
