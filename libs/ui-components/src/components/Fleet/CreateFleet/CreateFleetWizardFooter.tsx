import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button, WizardFooterWrapper, useWizardContext } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { FleetFormValues } from './types';
import { useNavigate } from '../../../hooks/useNavigate';
import { reviewStepId } from './steps/ReviewStep';
import { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';

type CreateFleetWizardFooterProps = {
  isEdit: boolean;
};

const CreateFleetWizardFooter = ({ isEdit }: CreateFleetWizardFooterProps) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors } = useFormikContext<FleetFormValues>();
  const navigate = useNavigate();

  const isReviewStep = activeStep.id === reviewStepId;
  let isStepValid = true;
  if (activeStep.id === generalInfoStepId) {
    isStepValid = isGeneralInfoStepValid(errors);
  } else if (activeStep.id === deviceTemplateStepId) {
    isStepValid = isDeviceTemplateStepValid(errors);
  }
  const primaryBtn = isReviewStep ? (
    <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
      {isEdit ? t('Update fleet') : t('Create fleet')}
    </Button>
  ) : (
    <Button variant="primary" onClick={goToNextStep} isDisabled={!isStepValid}>
      {t('Next')}
    </Button>
  );

  return (
    <WizardFooterWrapper>
      {primaryBtn}
      {activeStep.id !== generalInfoStepId && (
        <Button variant="secondary" onClick={goToPrevStep} isDisabled={isSubmitting}>
          {t('Back')}
        </Button>
      )}
      <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
        {t('Cancel')}
      </Button>
    </WizardFooterWrapper>
  );
};

export default CreateFleetWizardFooter;
