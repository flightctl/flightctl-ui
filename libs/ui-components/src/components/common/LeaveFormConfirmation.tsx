import * as React from 'react';
import { Button, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { Blocker, BlockerFunction } from 'react-router-dom';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';

const ConfirmNavigationDialog = ({ blocker }: { blocker: Blocker }) => {
  const { t } = useTranslation();

  if (blocker.state !== 'blocked') {
    return null;
  }

  return (
    <Modal isOpen variant="small">
      <ModalHeader title={t('There are unsaved changes')} titleIconVariant="warning" />
      <ModalBody>
        <Content component="p">
          {t('Are you sure you want to leave the current page? Unsaved changes will be lost.')}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          key="proceed"
          variant="danger"
          onClick={() => {
            blocker.proceed?.();
          }}
        >
          {t('Discard changes')}
        </Button>
        <Button
          key="stay"
          variant="link"
          onClick={() => {
            blocker.reset?.();
          }}
        >
          {t('Stay here')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const RouterBlocker = ({ lock }: { lock: boolean }) => {
  const {
    router: { useBlocker },
  } = useAppContext();

  const shouldBlock: BlockerFunction = ({ currentLocation, nextLocation }) => {
    return lock && currentLocation.pathname !== nextLocation.pathname;
  };

  const blocker = useBlocker(shouldBlock);
  return <ConfirmNavigationDialog blocker={blocker} />;
};

const LeaveFormConfirmation = () => {
  const { dirty, isSubmitting } = useFormikContext();

  const lock = !isSubmitting && dirty;
  return <RouterBlocker lock={lock} />;
};

export default LeaveFormConfirmation;
