import * as React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';

import { useTranslation } from '../../hooks/useTranslation';

type ConfirmEndAppConsoleSessionModalProps = {
  appName: string;
  onClose: (doConfirm: boolean) => void;
};

const ConfirmEndAppConsoleSessionModal = ({ appName, onClose }: ConfirmEndAppConsoleSessionModalProps) => {
  const { t } = useTranslation();

  return (
    <FlightCtlModal variant="small" isOpen onClose={() => onClose(false)} aria-label={t('Confirm end session')}>
      <ModalHeader title={t('End active console session?')} />
      <ModalBody>
        {t(
          'This will terminate the existing console session for "{{appName}}". If another user is connected, they will be disconnected immediately.',
          { appName },
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" onClick={() => onClose(true)}>
          {t('End session and connect')}
        </Button>
        <Button variant="link" onClick={() => onClose(false)}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export default ConfirmEndAppConsoleSessionModal;
