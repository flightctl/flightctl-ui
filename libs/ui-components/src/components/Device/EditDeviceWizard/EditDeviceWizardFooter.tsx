import * as React from 'react';
import { useFormikContext } from 'formik';
import { Button, WizardFooterWrapper, useWizardContext } from '@patternfly/react-core';

import { EditDeviceFormValues } from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNavigate } from '../../../hooks/useNavigate';
import { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import { reviewDeviceStepId } from './steps/ReviewDeviceStep';
import { deviceUpdatePolicyStepId, isUpdatePolicyStepValid } from './steps/DeviceUpdateStep';

const EditDeviceWizardFooter = () => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors } = useFormikContext<EditDeviceFormValues>();
  const navigate = useNavigate();

  const isSubmitStep = activeStep.id === reviewDeviceStepId;

  let isStepValid = true;
  switch (activeStep.id) {
    case generalInfoStepId:
      isStepValid = isGeneralInfoStepValid(errors);
      break;
    case deviceTemplateStepId:
      isStepValid = isDeviceTemplateStepValid(errors);
      break;
    case deviceUpdatePolicyStepId:
      isStepValid = isUpdatePolicyStepValid(errors);
      break;
    default:
      break;
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
