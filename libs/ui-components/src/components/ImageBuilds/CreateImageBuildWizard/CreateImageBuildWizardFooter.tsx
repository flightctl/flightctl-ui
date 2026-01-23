import * as React from 'react';
import { FormikErrors } from 'formik';

import { ImageBuildFormValues } from './types';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { reviewStepId } from './steps/ReviewStep';
import { isSourceImageStepValid, sourceImageStepId } from './steps/SourceImageStep';
import { isOutputImageStepValid, outputImageStepId } from './steps/OutputImageStep';
import { isRegistrationStepValid, registrationStepId } from './steps/RegistrationStep';

const validateStep = (activeStepId: string, errors: FormikErrors<ImageBuildFormValues>): boolean => {
  if (activeStepId === sourceImageStepId) {
    return isSourceImageStepValid(errors);
  }
  if (activeStepId === outputImageStepId) {
    return isOutputImageStepValid(errors);
  }
  if (activeStepId === registrationStepId) {
    return isRegistrationStepValid(errors);
  }
  return true;
};

const CreateImageBuildWizardFooter = () => {
  const { t } = useTranslation();

  return (
    <FlightCtlWizardFooter<ImageBuildFormValues>
      firstStepId={sourceImageStepId}
      submitStepId={reviewStepId}
      validateStep={validateStep}
      saveButtonText={t('Build image')}
    />
  );
};

export default CreateImageBuildWizardFooter;
