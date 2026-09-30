import * as React from 'react';
import type { TFunction } from 'react-i18next';
import { Alert, Button, ModalBody, ModalFooter, ModalHeader, Stack, StackItem } from '@patternfly/react-core';

import { ResourceKind } from '@flightctl/types';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';

import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';

export type DeleteModalResourceType = ResourceKind | 'catalogItem' | 'application' | 'os';

type DeleteModalProps = {
  onDelete: () => Promise<unknown>;
  onClose: VoidFunction;
  resourceType: DeleteModalResourceType;
  confirmText: React.ReactNode;
};

export const getConfirmDeleteLabel = (t: TFunction, resourceType: DeleteModalResourceType) => {
  switch (resourceType) {
    case 'catalogItem':
      return t('Delete catalog item?');
    case 'application':
      return t('Delete application?');
    case 'os':
      return t('Delete system image?');
    case ResourceKind.DEVICE:
      return t('Delete device?');
    case ResourceKind.ENROLLMENT_REQUEST:
      return t('Delete enrollment request?');
    case ResourceKind.RESOURCE_SYNC:
      return t('Delete resource sync?');
    default:
      return t('Delete resource?');
  }
};

export const getDeleteLabel = (t: TFunction, resourceType: DeleteModalResourceType) => {
  switch (resourceType) {
    case 'catalogItem':
      return t('Delete catalog item');
    case 'application':
      return t('Delete application');
    case 'os':
      return t('Delete system image');
    case ResourceKind.DEVICE:
      return t('Delete device');
    case ResourceKind.ENROLLMENT_REQUEST:
      return t('Delete enrollment request');
    case ResourceKind.RESOURCE_SYNC:
      return t('Delete resource sync');
    default:
      return t('Delete resource');
  }
};

const DeleteModal = ({ onDelete, onClose, resourceType, confirmText }: DeleteModalProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const titleLabel = getConfirmDeleteLabel(t, resourceType);
  return (
    <FlightCtlModal isOpen onClose={onClose} variant="small">
      <ModalHeader title={titleLabel} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{confirmText}</StackItem>
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
          {t('Delete')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export default DeleteModal;
