import * as React from 'react';
import { useFormikContext } from 'formik';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';

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
  const buttonRef = React.useRef<HTMLButtonElement>();

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

  const onMoveNext = () => {
    goToNextStep();
    // Blur the button, otherwise it keeps the focus from the previous click
    buttonRef.current?.blur();
  };

  const primaryBtn = isSubmitStep ? (
    <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
      {t('Save')}
    </Button>
  ) : (
    <Button variant="primary" onClick={onMoveNext} isDisabled={!isStepValid} ref={buttonRef}>
      {t('Next')}
    </Button>
  );

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

export default EditDeviceWizardFooter;
