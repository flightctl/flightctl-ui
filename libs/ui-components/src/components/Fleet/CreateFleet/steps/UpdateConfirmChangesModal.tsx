import * as React from 'react';

import { Button, Modal, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';

export type StepSetting = 'all-settings' | 'rollout-policies' | 'disruption-budget';

type UpdateConfirmChangesModalProps = {
  setting: StepSetting;
  onClose: (doSwitch: boolean) => void;
};

const SwitchBasicSettingsConfirm = () => {
  const { t } = useTranslation();

  return (
    <>
      {t('Are you sure you want to switch to basic update configurations?')}
      <br />
      {t('If you confirm, all advanced configurations will be lost.')}
    </>
  );
};

const SwitchBasicDisruptionConfirm = () => {
  const { t } = useTranslation();

  return (
    <>
      {t('Are you sure you want to remove the disruption budget configurations?')}
      <br />
      {t('If you confirm, all disruption budget configurations will be lost.')}
    </>
  );
};

const SwitchBasicRolloutConfirm = () => {
  const { t } = useTranslation();

  return (
    <>
      {t('Are you sure you want to remove the rollout policies configurations?')}
      <br />
      {t('If you confirm, all rollout policies configurations will be lost.')}
    </>
  );
};

const UpdateConfirmChangesModal = ({ setting, onClose }: UpdateConfirmChangesModalProps) => {
  const { t } = useTranslation();

  let titleText: string = '';
  let mainActionText: string = '';

  let ContentComponent: () => React.JSX.Element;
  switch (setting) {
    case 'all-settings':
      ContentComponent = SwitchBasicSettingsConfirm;
      titleText = t('Switch to basic update configuration?');
      mainActionText = t('Switch to basic configurations');
      break;
    case 'rollout-policies':
      ContentComponent = SwitchBasicRolloutConfirm;
      titleText = t("Don't use rollout policies configurations");
      mainActionText = titleText;

      break;
    case 'disruption-budget':
      ContentComponent = SwitchBasicDisruptionConfirm;
      titleText = t("Don't use disruption budget configurations");
      mainActionText = titleText;
      break;
  }

  return (
    <Modal
      variant={setting === 'disruption-budget' ? 'medium' : 'small'}
      title={titleText}
      titleIconVariant="warning"
      isOpen
    >
      <Stack hasGutter>
        <StackItem>
          <ContentComponent />
        </StackItem>
        <StackItem>
          <Button
            key="basic"
            variant="primary"
            tabIndex={0}
            onClick={() => {
              onClose(true);
            }}
          >
            {mainActionText}
          </Button>
          <Button
            key="advanced"
            variant="link"
            tabIndex={0}
            onClick={() => {
              onClose(false);
            }}
          >
            {t('Cancel')}
          </Button>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default UpdateConfirmChangesModal;
