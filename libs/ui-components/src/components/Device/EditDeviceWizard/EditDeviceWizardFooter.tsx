import * as React from 'react';
import { FormikErrors } from 'formik';

import { EditDeviceFormValues } from '../../../types/deviceSpec';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import { reviewDeviceStepId } from './steps/ReviewDeviceStep';
import { deviceUpdatePolicyStepId, isUpdatePolicyStepValid } from './steps/DeviceUpdateStep';

const validateStep = (activeStepId: string, errors: FormikErrors<EditDeviceFormValues>) => {
  switch (activeStepId) {
    case generalInfoStepId:
      return isGeneralInfoStepValid(errors);
    case deviceTemplateStepId:
      return isDeviceTemplateStepValid(errors);
    case deviceUpdatePolicyStepId:
      return isUpdatePolicyStepValid(errors);
    default:
      return true;
  }
};

const EditDeviceWizardFooter = () => (
  <FlightCtlWizardFooter<EditDeviceFormValues>
    firstStepId={generalInfoStepId}
    submitStepId={reviewDeviceStepId}
    validateStep={validateStep}
  />
);

export default EditDeviceWizardFooter;
