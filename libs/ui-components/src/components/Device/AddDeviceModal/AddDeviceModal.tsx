import * as React from 'react';
import { Button, List, ListComponent, ListItem, OrderType, Stack, StackItem } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core/next';

import { useTranslation } from '../../../hooks/useTranslation';
import { getAddingNewDevicesLink } from '../../../links';
import LearnMoreLink from '../../common/LearnMoreLink';
import { useAppContext } from '../../../hooks/useAppContext';

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { appType } = useAppContext();
  const { t } = useTranslation();

  return (
    <Modal variant="small" onClose={onClose} isOpen>
      <ModalHeader title={t('Add devices')} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{t('You can add devices following these steps:')}</StackItem>
          <StackItem>
            <List component={ListComponent.ol} type={OrderType.number}>
              <ListItem>{t('Request an enrollment certificate for your device')}</ListItem>
              <ListItem>{t('Build a bootc OS image')}</ListItem>
              <ListItem>{t('Create, sign and publish a bootable OS disk image')}</ListItem>
              <ListItem>{t('Boot your device into the OS disk image')}</ListItem>
            </List>
          </StackItem>
          <StackItem>
            <LearnMoreLink link={getAddingNewDevicesLink(appType)} text={t('Learn more about adding devices')} />
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" isInline onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDeviceModal;
