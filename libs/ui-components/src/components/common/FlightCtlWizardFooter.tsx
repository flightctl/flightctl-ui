import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  // eslint-disable-next-line no-restricted-imports
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from '../../hooks/useNavigate';

export type FlightCtlWizardFooterProps<T extends Record<string, unknown>> = {
  firstStepId: string;
  submitStepId: string;
  validateStep: (activeStepId: string, errors: FormikErrors<T>, values: T) => boolean;
  isReadOnly?: boolean;
  /** Text for the primary button when it will actually perform a save operation */
  saveButtonText?: string;
  /** When provided (e.g. in a modal), Cancel button calls this instead of navigate(-1) */
  onCancel?: VoidFunction;
};

const FlightCtlWizardFooter = <T extends Record<string, unknown>>({
  firstStepId,
  submitStepId,
  validateStep,
  isReadOnly = false,
  saveButtonText,
  onCancel,
}: FlightCtlWizardFooterProps<T>) => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors, values } = useFormikContext<T>();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const isSubmitStep = activeStep.id === submitStepId;
  const stepValid = validateStep(String(activeStep.id), errors, values);

  const onMoveNext = () => {
    goToNextStep();
    // Blur the button, otherwise it keeps the focus from the previous click
    buttonRef?.current?.blur();
  };

  let primaryBtn: React.ReactNode;
  if (isSubmitStep && !isReadOnly) {
    primaryBtn = (
      <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
        {saveButtonText || t('Save')}
      </Button>
    );
  } else if (isSubmitStep) {
    // Read-only "Review" step
    primaryBtn = (
      <Button variant="primary" onClick={() => navigate(-1)}>
        {t('Close')}
      </Button>
    );
  } else {
    primaryBtn = (
      <Button variant="primary" onClick={onMoveNext} isDisabled={!isReadOnly && !stepValid} ref={buttonRef}>
        {t('Next')}
      </Button>
    );
  }
  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              variant="secondary"
              onClick={goToPrevStep}
              isDisabled={String(activeStep.id) === firstStepId || isSubmitting}
            >
              {t('Back')}
            </Button>
          </ActionListItem>
          <ActionListItem>{primaryBtn}</ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button variant="link" onClick={onCancel ?? (() => navigate(-1))} isDisabled={isSubmitting}>
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default FlightCtlWizardFooter;
