import { CatalogItem } from '@flightctl/types/alpha';
import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { Device, Fleet } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getOsPatches } from '../utils';
import { getErrorMessage } from '../../../utils/error';
import { InstallOsFormik, reviewStepId, selectTargetStepId, specificationsStepId } from './types';
import SpecificationsStep, { isSpecsStepValid } from './steps/SpecificationsStep';
import SelectTargetStep, { isSelectTargetStepValid } from './steps/SelectTargetStep';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import UpdateSuccessPage from './UpdateSuccessPage';
import FlightCtlWizardFooter, { FlightCtlWizardFooterProps } from '../../common/FlightCtlWizardFooter';
import { useAppContext } from '../../../hooks/useAppContext';

export const validateOsWizardStep: FlightCtlWizardFooterProps<InstallOsFormik>['validateStep'] = (
  activeStepId,
  errors,
) => {
  if (activeStepId === specificationsStepId) return isSpecsStepValid(errors);
  if (activeStepId === selectTargetStepId) return isSelectTargetStepValid(errors);
  return true;
};

type InstallOsWizardContentProps = {
  currentStep: WizardStepType | undefined;
  setCurrentStep: (step: WizardStepType) => void;
  error: string | undefined;
  catalogItem: CatalogItem;
  isSuccessful: boolean;
};

const InstallOsWizardContent = ({
  currentStep,
  setCurrentStep,
  error,
  catalogItem,
  isSuccessful,
}: InstallOsWizardContentProps) => {
  const { t } = useTranslation();
  const { errors } = useFormikContext<InstallOsFormik>();
  return isSuccessful ? (
    <UpdateSuccessPage />
  ) : (
    <>
      <LeaveFormConfirmation />
      <Wizard
        footer={
          <FlightCtlWizardFooter<InstallOsFormik>
            firstStepId={specificationsStepId}
            submitStepId={reviewStepId}
            validateStep={validateOsWizardStep}
            saveButtonText={t('Deploy')}
          />
        }
        onStepChange={(_, step) => setCurrentStep(step)}
      >
        <WizardStep name={t('Specifications')} id={specificationsStepId}>
          {(!currentStep || currentStep?.id === specificationsStepId) && (
            <SpecificationsStep catalogItem={catalogItem} showNewDevice />
          )}
        </WizardStep>
        <WizardStep name={t('Select target')} id={selectTargetStepId} isDisabled={!isSpecsStepValid(errors)}>
          {currentStep?.id === selectTargetStepId && <SelectTargetStep />}
        </WizardStep>
        <WizardStep
          name={t('Review')}
          id={reviewStepId}
          isDisabled={!isSpecsStepValid(errors) || !isSelectTargetStepValid(errors)}
        >
          {currentStep?.id === reviewStepId && <ReviewStep isApp={false} error={error} />}
        </WizardStep>
      </Wizard>
    </>
  );
};

type InstallOsWizardProps = {
  catalogItem: CatalogItem;
};

const InstallOsWizard = ({ catalogItem }: InstallOsWizardProps) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const [isSuccessful, setIsSuccessful] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const { patch, get } = useFetch();

  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get('channel') || '';
  const version = searchParams.get('version') || '';

  const validationSchema = Yup.lazy((values: InstallOsFormik) =>
    Yup.object({
      target: Yup.string().required(t('Target must be selected')),
      device: values.target === 'device' ? Yup.object().required(t('Device must be selected')) : Yup.object(),
      fleet: values.target === 'fleet' ? Yup.object().required(t('Fleet must be selected')) : Yup.object(),
      channel: Yup.string().required(t('Channel must be selected')),
      version: Yup.string().required(t('Version must be selected')),
    }),
  );

  const initialValues = React.useMemo<InstallOsFormik>(
    () => ({
      version,
      channel,
      target: undefined,
      fleet: undefined,
      device: undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSubmit = async (values: InstallOsFormik) => {
    setError(undefined);
    if (values.target !== 'fleet' && values.target !== 'device') {
      return;
    }
    const selectedDevice = values.device;
    const selectedFleet = values.fleet;
    const installToDevice = values.target === 'device';
    const resourceId = installToDevice
      ? `devices/${selectedDevice?.metadata.name}`
      : `fleets/${selectedFleet?.metadata.name}`;

    try {
      const res = await get<Device | Fleet>(resourceId);
      const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === values.version);

      if (!catalogItemVersion || !values.channel) {
        return;
      }
      const currentOsImage = installToDevice
        ? (res as Device)?.spec?.os?.image
        : (res as Fleet)?.spec.template.spec.os?.image;
      const allPatches = getOsPatches({
        currentOsImage,
        currentLabels: res?.metadata.labels,
        catalogItem,
        catalogItemVersion,
        channel: values.channel,
        specPath: installToDevice ? '/' : '/spec/template/',
      });

      if (!allPatches.length) {
        setIsSuccessful(true);
      } else {
        await patch(resourceId, allPatches);
        setIsSuccessful(true);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Formik<InstallOsFormik>
      validationSchema={validationSchema}
      initialValues={initialValues}
      validateOnMount
      onSubmit={onSubmit}
    >
      <InstallOsWizardContent
        catalogItem={catalogItem}
        currentStep={currentStep}
        error={error}
        isSuccessful={isSuccessful}
        setCurrentStep={setCurrentStep}
      />
    </Formik>
  );
};

export default InstallOsWizard;
