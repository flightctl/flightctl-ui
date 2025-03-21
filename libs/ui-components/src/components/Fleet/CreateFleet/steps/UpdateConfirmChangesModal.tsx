import * as React from 'react';
import { Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import { TFunction } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';

export type StepSetting = 'all-settings' | 'rollout-policies' | 'update-policies' | 'disruption-budget';

type UpdateConfirmChangesModalProps = {
  setting: StepSetting;
  onClose: (doSwitch: boolean) => void;
};

const getModalContent = (setting: StepSetting, t: TFunction) => {
  switch (setting) {
    case 'all-settings':
      return {
        title: t('Switch to basic update configuration?'),
        primaryAction: t('Switch to basic configurations'),
        question: t('Are you sure you want to switch to basic update configurations?'),
        result: t('If you confirm, all advanced configurations will be lost.'),
      };
    case 'rollout-policies': {
      const title = t("Don't use rollout policies configurations");
      return {
        title,
        primaryAction: title,
        question: t('Are you sure you want to remove the rollout policies configurations?'),
        result: t('If you confirm, all rollout policies configurations will be lost.'),
      };
    }

    case 'disruption-budget': {
      const title = t("Don't use disruption budget configurations");
      return {
        title,
        primaryAction: title,
        question: t('Are you sure you want to remove the disruption budget configurations?'),
        result: t('If you confirm, all disruption budget configurations will be lost.'),
      };
    }
    case 'update-policies': {
      const title = t("Don't use update policies");
      return {
        title,
        primaryAction: title,
        question: t('Are you sure you want to remove the update policy configurations?'),
        result: t('If you confirm, all update policy configurations will be lost.'),
      };
    }
  }
};

const UpdateConfirmChangesModal = ({ setting, onClose }: UpdateConfirmChangesModalProps) => {
  const { t } = useTranslation();

  const modalContentProps = getModalContent(setting, t);

  return (
    <Modal
      variant={setting === 'disruption-budget' ? 'medium' : 'small'}
      title={modalContentProps.title}
      titleIconVariant="warning"
      isOpen
    >
      <Stack hasGutter>
        <StackItem>{modalContentProps.question}</StackItem>
        <StackItem>{modalContentProps.result}</StackItem>
        <StackItem>
          <Button
            key="confirm"
            variant="primary"
            tabIndex={0}
            onClick={() => {
              onClose(true);
            }}
          >
            {modalContentProps.primaryAction}
          </Button>
          <Button
            key="cancel"
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
