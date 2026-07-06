import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';

export type ConfirmImageExportAction = 'cancel' | 'delete' | 'rebuild';

const ConfirmImageExportActionModal = ({
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

  switch (action) {
    case 'cancel':
      title = t('Cancel image export?');
      message = t(
        'This will immediately stop the current process. As a result, the image will not be exported in this format.',
      );
      confirmButtonTitle = t('Cancel image export');
      break;
    case 'delete':
      title = t('Delete image export?');
      message = t(
        'This image export will be permanently removed. The actual image files in your storage will not be deleted.',
      );
      confirmButtonTitle = t('Delete');
      break;
    case 'rebuild':
      title = t('Rebuild image export?');
      message = t(
        'Rebuilding updates the image currently displayed in the console. Previous versions remain accessible via the flightctl CLI.',
      );
      confirmButtonTitle = t('Rebuild');
      break;
  }

  return (
    <Modal variant="small" isOpen onClose={() => onClose(false)}>
      <ModalHeader title={title} />
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button key="confirm" variant={action === 'rebuild' ? 'primary' : 'danger'} onClick={() => onClose(true)}>
          {confirmButtonTitle}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          {action === 'cancel' ? t('Close') : t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmImageExportActionModal;
