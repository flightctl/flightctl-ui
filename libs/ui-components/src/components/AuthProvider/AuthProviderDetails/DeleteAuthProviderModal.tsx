import * as React from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';

type DeleteAuthProviderModalProps = {
  authProviderId: string;
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
};

const DeleteAuthProviderModal = ({ authProviderId, onClose, onDeleteSuccess }: DeleteAuthProviderModalProps) => {
  const { t } = useTranslation();
  const { remove } = useFetch();
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleDelete = async () => {
    setError(undefined);
    setIsLoading(true);
    try {
      await remove(`authproviders/${authProviderId}`);
      onDeleteSuccess();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal variant={ModalVariant.medium} isOpen onClose={onClose}>
      <ModalHeader title={t('Delete authentication provider?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              This will permanently delete the authentication provider <strong>{authProviderId}</strong> and remove all
              associated configurations.
            </Trans>
          </StackItem>
          <StackItem>
            <Alert
              variant="warning"
              isInline
              title={t(
                'Users who currently authenticate through this provider will lose access until alternative authentication is configured.',
              )}
            />
          </StackItem>

          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('Authentication provider deletion failed')}>
                {error}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <Trans t={t}>
              Type <strong>{authProviderId}</strong> to confirm deletion:
            </Trans>
          </StackItem>
          <TextInput
            value={confirmationText}
            onChange={(_event, value) => setConfirmationText(value)}
            placeholder={`Type "${authProviderId}" to confirm`}
            aria-label={t('Confirmation text')}
          />
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={handleDelete}
          isLoading={isLoading}
          isDisabled={isLoading || confirmationText !== authProviderId}
        >
          {t('Delete authentication provider')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteAuthProviderModal;
