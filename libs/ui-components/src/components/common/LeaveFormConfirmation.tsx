import * as React from 'react';
import { Button, Text, TextContent } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core/next';

import { unstable_Blocker as Blocker, unstable_BlockerFunction as BlockerFunction } from 'react-router-dom';
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
        <TextContent>
          <Text>{t('Are you sure you want to leave the current page? Unsaved changes will be lost.')}</Text>
        </TextContent>
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

const LeaveFormConfirmation = () => {
  const { dirty, isSubmitting } = useFormikContext();
  const {
    appType,
    router: { useBlocker },
  } = useAppContext();

  const lock = !isSubmitting && dirty;

  if (!useBlocker || appType === FlightCtlApp.AAP) {
    return null;
  }

  return <RouterBlocker lock={lock} />;
};

export default LeaveFormConfirmation;
