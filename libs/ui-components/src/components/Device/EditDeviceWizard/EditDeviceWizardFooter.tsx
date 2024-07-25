import * as React from 'react';
import { useFormikContext } from 'formik';
import { Button, WizardFooterWrapper, useWizardContext } from '@patternfly/react-core';

import { EditDeviceFormValues } from './types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNavigate } from '../../../hooks/useNavigate';
import { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import { reviewDeviceStepId } from './steps/ReviewDeviceStep';

const EditDeviceWizardFooter = () => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors } = useFormikContext<EditDeviceFormValues>();
  const navigate = useNavigate();

  const isSubmitStep = activeStep.id === reviewDeviceStepId;

  let isStepValid = true;
  if (activeStep.id === generalInfoStepId) {
    isStepValid = isGeneralInfoStepValid(errors);
  } else if (activeStep.id === deviceTemplateStepId) {
    isStepValid = isDeviceTemplateStepValid(errors);
  }

  const primaryBtn = isSubmitStep ? (
    <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
      {t('Save')}
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

export default EditDeviceWizardFooter;
