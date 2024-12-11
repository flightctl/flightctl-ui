import * as React from 'react';
import { Button, List, ListComponent, ListItem, Modal, OrderType, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../hooks/useTranslation';

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();

  return (
    <Modal variant="medium" title={t('Add devices')} onClose={onClose} isOpen>
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
          <Button
            component="a"
            variant="link"
            isInline
            href="https://github.com/flightctl/flightctl/blob/main/docs/user/getting-started.md#building-a-bootable-container-image-including-the-flight-control-agent"
            target="_blank"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            {t('Learn more about adding devices')}{' '}
          </Button>
        </StackItem>
        <StackItem className="pf-v5-u-mt-md">
          <Button variant="primary" isInline onClick={onClose}>
            {t('Close')}
          </Button>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default AddDeviceModal;
