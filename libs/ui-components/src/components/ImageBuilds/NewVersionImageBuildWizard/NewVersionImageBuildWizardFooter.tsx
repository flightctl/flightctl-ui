import * as React from 'react';
import { FormikErrors } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { isNewVersionStepValid, newVersionStepId } from './steps/NewVersionStep';
import { catalogStepId, isCatalogStepValid } from '../CreateImageBuildWizard/steps/CatalogStep';
import { reviewStepId } from './steps/ReviewStep';
import { NewVersionWizardFormValues } from './types';

const validateStep = (activeStepId: string, errors: FormikErrors<NewVersionWizardFormValues>): boolean => {
  if (activeStepId === newVersionStepId) {
    return isNewVersionStepValid(errors);
  }
  if (activeStepId === catalogStepId) {
    return isCatalogStepValid(errors);
  }
  return true;
};

const NewVersionImageBuildWizardFooter = () => {
  const { t } = useTranslation();

  return (
    <FlightCtlWizardFooter<NewVersionWizardFormValues>
      firstStepId={newVersionStepId}
      submitStepId={reviewStepId}
      validateStep={validateStep}
      saveButtonText={t('Rebuild')}
    />
  );
};

export default NewVersionImageBuildWizardFooter;
