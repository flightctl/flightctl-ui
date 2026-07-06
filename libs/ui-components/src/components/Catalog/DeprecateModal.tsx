import * as React from 'react';
import {
  Alert,
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextArea,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import FlightCtlForm from '../form/FlightCtlForm';

type DeprecateModalProps = {
  onDeprecate: (message: string) => Promise<void>;
  onClose: VoidFunction;
  itemName: string;
};

export const DeprecateModal = ({ onDeprecate, onClose, itemName }: DeprecateModalProps) => {
  const { t } = useTranslation();
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const isValid = reason.trim().length > 0;

  return (
    <Modal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Deprecate catalog item')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              Are you sure you want to deprecate <b>{itemName}</b>?
            </Trans>
          </StackItem>
          <StackItem>
            <FlightCtlForm>
              <FormGroup label={t('Reason')} isRequired fieldId="deprecation-reason">
                <TextArea
                  id="deprecation-reason"
                  value={reason}
                  onChange={(_ev, value) => setReason(value)}
                  placeholder={t('Explain why this item is being deprecated')}
                  isRequired
                  autoFocus
                />
              </FormGroup>
            </FlightCtlForm>
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
          variant="warning"
          isDisabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsSubmitting(true);
              await onDeprecate(reason.trim());
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {t('Deprecate')}
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

type RestoreModalProps = {
  onRestore: () => Promise<void>;
  onClose: VoidFunction;
  itemName: string;
};

export const RestoreModal = ({ onRestore, onClose, itemName }: RestoreModalProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  return (
    <Modal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Restore catalog item')} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              Are you sure you want to restore <b>{itemName}</b> from its deprecated state?
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
          variant="primary"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsSubmitting(true);
              await onRestore();
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {t('Restore')}
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
