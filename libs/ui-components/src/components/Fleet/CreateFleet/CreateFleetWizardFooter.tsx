import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { FleetFormValues } from './../../../types/deviceSpec';
import { useNavigate } from '../../../hooks/useNavigate';
import { reviewStepId } from './steps/ReviewStep';
import { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import {
  deviceTemplateStepId,
  isDeviceTemplateStepValid,
} from '../../Device/EditDeviceWizard/steps/DeviceTemplateStep';
import { isUpdatePolicyStepValid, updatePolicyStepId } from './steps/UpdatePolicyStep';

type CreateFleetWizardFooterProps = {
  isReadOnly: boolean;
  isEdit: boolean;
};

const CreateFleetWizardFooter = ({ isReadOnly, isEdit }: CreateFleetWizardFooterProps) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors } = useFormikContext<FleetFormValues>();
  const navigate = useNavigate();
  const buttonRef = React.useRef<HTMLButtonElement>();

  const isReviewStep = activeStep.id === reviewStepId;
  let isStepValid = true;
  if (activeStep.id === generalInfoStepId) {
    isStepValid = isGeneralInfoStepValid(errors);
  } else if (activeStep.id === deviceTemplateStepId) {
    isStepValid = isDeviceTemplateStepValid(errors);
  } else if (activeStep.id === updatePolicyStepId) {
    isStepValid = isUpdatePolicyStepValid(errors);
  }

  const onMoveNext = () => {
    goToNextStep();
    // Blur the button, otherwise it keeps the focus from the previous click
    buttonRef.current?.blur();
  };

  let primaryBtn: React.ReactNode;

  if (isReviewStep) {
    if (isReadOnly) {
      primaryBtn = (
        <Button variant="primary" onClick={() => navigate(-1)}>
          {t('Close')}
        </Button>
      );
    } else {
      primaryBtn = (
        <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
          {isEdit ? t('Save') : t('Create fleet')}
        </Button>
      );
    }
  } else {
    primaryBtn = (
      <Button variant="primary" onClick={onMoveNext} isDisabled={!isReadOnly && !isStepValid} ref={buttonRef}>
        {t('Next')}
      </Button>
    );
  }

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>{primaryBtn}</ActionListItem>
          {activeStep.id !== generalInfoStepId && (
            <Button variant="secondary" onClick={goToPrevStep} isDisabled={isSubmitting}>
              {t('Back')}
            </Button>
          )}
        </ActionListGroup>
        <ActionListGroup>
          <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
            {t('Cancel')}
          </Button>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default CreateFleetWizardFooter;
