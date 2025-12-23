import * as React from 'react';
import { Button, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { Blocker, BlockerFunction } from 'react-router-dom';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import { FlightCtlApp, useAppContext } from '../../hooks/useAppContext';

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
  const blocker = useBlocker?.(shouldBlock);

  return <>{blocker ? <ConfirmNavigationDialog blocker={blocker} /> : null}</>;
};

const BrowserBlocker = ({ lock }: { lock: boolean }) => {
  const { t } = useTranslation();
  const {
    router: { Prompt },
  } = useAppContext();

  return (
    Prompt &&
    lock && <Prompt message={t('Are you sure you want to leave the current page? Unsaved changes will be lost.')} />
  );
};

const LeaveFormConfirmation = () => {
  const { dirty, isSubmitting } = useFormikContext();
  const {
    appType,
    router: { useBlocker },
  } = useAppContext();

  const lock = !isSubmitting && dirty;

  if (appType === FlightCtlApp.AAP) {
    return null;
  }

  // workaround for OCP plugin where useBlocker is not yet available due to older react-router-dom version
  return useBlocker ? <RouterBlocker lock={lock} /> : <BrowserBlocker lock={lock} />;
};

export default LeaveFormConfirmation;
