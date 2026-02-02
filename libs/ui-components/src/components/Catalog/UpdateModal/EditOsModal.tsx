import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';

type EditOsModalProps = {
  onClose: VoidFunction;
  item: CatalogItem;
  onSubmit: () => Promise<void>;
};

const EditOsModal = ({ onClose, item, onSubmit }: EditOsModalProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <Modal isOpen onClose={onClose} variant="medium">
      <ModalHeader title={t('Deploy Operating system')} />
      <ModalBody>
        {t('Are you sure you want to deploy operating system {{os}}', {
          os: item.spec.displayName || item.metadata.name,
        })}
      </ModalBody>
      <ModalFooter>
        {error && (
          <Alert variant="danger" isInline title={t('Failed to deploy Operating system')}>
            {error}
          </Alert>
        )}
        <Button
          variant="primary"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={async () => {
            setError(undefined);
            setIsSubmitting(true);
            try {
              await onSubmit();
              onClose();
            } catch (e) {
              setError(getErrorMessage(e));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {t('Deploy')}
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditOsModal;
