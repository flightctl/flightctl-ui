import * as React from 'react';
import { Icon, Tooltip, WizardNav, WizardNavItem, useWizardContext } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { TFunction } from 'react-i18next';

const generalInfoStepIndex = 0;
const deviceTemplateStepIndex = 1;
const deviceUpdatesStepIndex = 2;
const reviewDeviceStepIndex = 3;

const disabledTemplateReason = (t: TFunction) =>
  t('The device will be bound to a fleet. As a result, its configurations cannot be edited directly.');

const EditDeviceWizardNav = () => {
  const { t } = useTranslation();
  const { activeStep, steps, goToStepByIndex } = useWizardContext();

  const isEditTemplateDisabled = steps[deviceTemplateStepIndex]?.isDisabled;
  const isDeviceUpdatesDisabled = steps[deviceUpdatesStepIndex]?.isDisabled;
  const isReviewDeviceDisabled = steps[reviewDeviceStepIndex]?.isDisabled;

  return (
    <WizardNav>
      <WizardNavItem
        stepIndex={generalInfoStepIndex}
        content={t('General info')}
        isCurrent={!activeStep || activeStep?.index === generalInfoStepIndex + 1}
        onClick={() => {
          goToStepByIndex(generalInfoStepIndex + 1);
        }}
      />
      <WizardNavItem
        stepIndex={deviceTemplateStepIndex}
        content={t('Device template')}
        isCurrent={activeStep?.index === deviceTemplateStepIndex + 1}
        isDisabled={isEditTemplateDisabled}
        onClick={() => {
          if (!isEditTemplateDisabled) {
            goToStepByIndex(deviceTemplateStepIndex + 1);
          }
        }}
      />
      <WizardNavItem
        stepIndex={deviceUpdatesStepIndex}
        content={t('Updates')}
        isCurrent={activeStep?.index === deviceUpdatesStepIndex + 1}
        isDisabled={isDeviceUpdatesDisabled}
        onClick={() => {
          if (!isDeviceUpdatesDisabled) {
            goToStepByIndex(deviceUpdatesStepIndex + 1);
          }
        }}
      >
        {isDeviceUpdatesDisabled && (
          <Tooltip content={disabledTemplateReason(t)}>
            <Icon status="info" size="sm">
              <InfoCircleIcon />
            </Icon>
          </Tooltip>
        )}
      </WizardNavItem>
      <WizardNavItem
        stepIndex={reviewDeviceStepIndex}
        content={t('Review and save')}
        isCurrent={activeStep?.index === reviewDeviceStepIndex + 1}
        isDisabled={isReviewDeviceDisabled}
        onClick={() => {
          if (!isReviewDeviceDisabled) {
            goToStepByIndex(reviewDeviceStepIndex + 1);
          }
        }}
      />
    </WizardNav>
  );
};

export default EditDeviceWizardNav;
