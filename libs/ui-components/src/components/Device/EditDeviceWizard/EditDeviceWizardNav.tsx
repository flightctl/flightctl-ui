import * as React from 'react';
import { Flex, FlexItem, Icon, Tooltip, WizardNav, WizardNavItem, useWizardContext } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';

const generalInfoStepIndex = 0;
const deviceTemplateStepIndex = 1;
const deviceUpdatesStepIndex = 2;
const reviewDeviceStepIndex = 3;

const StepNavContent = ({
  stepName,
  isDisabled,
  isFleetless,
}: {
  stepName: string;
  isDisabled?: boolean;
  isFleetless?: boolean;
}) => {
  const { t } = useTranslation();
  if (!isDisabled || isFleetless) {
    return stepName;
  }
  return (
    <Flex>
      <FlexItem>{stepName}</FlexItem>
      <FlexItem>
        <Tooltip
          content={t('The device will be bound to a fleet. As a result, its configurations cannot be edited directly.')}
        >
          <span tabIndex={0} aria-label={t('Why this step is disabled')}>
            <Icon status="info" size="sm">
              <InfoCircleIcon />
            </Icon>
          </span>
        </Tooltip>
      </FlexItem>
    </Flex>
  );
};

const EditDeviceWizardNav = ({ isFleetless }: { isFleetless: boolean }) => {
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
        content={
          <StepNavContent
            stepName={t('Device template')}
            isDisabled={isEditTemplateDisabled}
            isFleetless={isFleetless}
          />
        }
        isCurrent={activeStep?.index === deviceTemplateStepIndex + 1}
        aria-disabled={isEditTemplateDisabled}
        onClick={() => {
          if (!isEditTemplateDisabled) {
            goToStepByIndex(deviceTemplateStepIndex + 1);
          }
        }}
      />
      <WizardNavItem
        stepIndex={deviceUpdatesStepIndex}
        content={
          <StepNavContent stepName={t('Updates')} isDisabled={isDeviceUpdatesDisabled} isFleetless={isFleetless} />
        }
        isCurrent={activeStep?.index === deviceUpdatesStepIndex + 1}
        aria-disabled={isDeviceUpdatesDisabled}
        onClick={() => {
          if (!isDeviceUpdatesDisabled) {
            goToStepByIndex(deviceUpdatesStepIndex + 1);
          }
        }}
      />
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
