import * as React from 'react';
import { FormikErrors } from 'formik';
import { useTranslation } from '../../../hooks/useTranslation';
import { FleetFormValues } from './../../../types/deviceSpec';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
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

const validateStep = (activeStepId: string, errors: FormikErrors<FleetFormValues>) => {
  if (activeStepId === generalInfoStepId) {
    return isGeneralInfoStepValid(errors);
  } else if (activeStepId === deviceTemplateStepId) {
    return isDeviceTemplateStepValid(errors);
  } else if (activeStepId === updatePolicyStepId) {
    return isUpdatePolicyStepValid(errors);
  }
  return true;
};

const CreateFleetWizardFooter = ({ isReadOnly, isEdit }: CreateFleetWizardFooterProps) => {
  const { t } = useTranslation();
  return (
    <FlightCtlWizardFooter<FleetFormValues>
      firstStepId={generalInfoStepId}
      submitStepId={reviewStepId}
      validateStep={validateStep}
      saveButtonText={isEdit ? t('Save') : t('Create fleet')}
      isReadOnly={isReadOnly}
    />
  );
};

export default CreateFleetWizardFooter;
