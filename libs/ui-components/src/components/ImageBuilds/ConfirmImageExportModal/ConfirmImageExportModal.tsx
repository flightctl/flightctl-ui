import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';

export type ConfirmImageExportAction = 'cancel' | 'delete';

const ConfirmDeleteOrCancelImageExportModal = ({
  action,
  onClose,
}: {
  action: ConfirmImageExportAction;
  onClose: (isConfirmed: boolean) => void;
}) => {
  const { t } = useTranslation();

  let title = '';
  let message = '';
  let confirmButtonTitle = '';
  if (action === 'cancel') {
    title = t('Cancel image export?');
    message = t('This will immediately stop the current process. As a result, no images will be exported.');
    confirmButtonTitle = t('Cancel image export');
  } else if (action === 'delete') {
    title = t('Delete image export?');
    message = t(
      'This image export will be permanently removed. The actual image files in your storage will not be deleted.',
    );
    confirmButtonTitle = t('Delete');
  }

  return (
    <Modal variant="small" isOpen onClose={() => onClose(false)}>
      <ModalHeader title={title} />
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="danger" onClick={() => onClose(true)}>
          {confirmButtonTitle}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDeleteOrCancelImageExportModal;
