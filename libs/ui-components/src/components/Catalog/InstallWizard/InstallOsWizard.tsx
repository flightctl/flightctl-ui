import { CatalogItem } from '@flightctl/types/alpha';
import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';
import { Formik, FormikErrors, useFormikContext } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { Device, Fleet, ImageOrCatalogItemRefSpec, PatchRequest } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { buildCatalogItemRef } from '../../../utils/catalog';
import { getErrorMessage } from '../../../utils/error';
import { InstallOsFormik, reviewStepId, selectTargetStepId, specificationsStepId } from './types';
import SpecificationsStep, { isSpecsStepValid } from './steps/SpecificationsStep';
import SelectTargetStep, { isSelectTargetStepValid } from './steps/SelectTargetStep';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import UpdateSuccessPage from './UpdateSuccessPage';
import FlightCtlWizardFooter, { FlightCtlWizardFooterProps } from '../../common/FlightCtlWizardFooter';
import { useAppContext } from '../../../hooks/useAppContext';
import { useNavigate } from '../../../hooks/useNavigate';
import { isWizardStepDisabled } from '../../../utils/wizards';
import { appendJSONPatch } from '../../../utils/patch';

const getOrderedStepIds = (target: InstallOsFormik['target']) =>
  target === 'new-device'
    ? [specificationsStepId, selectTargetStepId]
    : [specificationsStepId, selectTargetStepId, reviewStepId];

const getValidStepIds = (errors: FormikErrors<InstallOsFormik>, orderedStepIds: string[]): string[] => {
  const validStepIds: string[] = [];
  if (isSpecsStepValid(errors)) {
    validStepIds.push(specificationsStepId);
  }
  if (isSelectTargetStepValid(errors)) {
    validStepIds.push(selectTargetStepId);
  }
  if (orderedStepIds.includes(reviewStepId) && validStepIds.length === orderedStepIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

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
  setError: (err: string | undefined) => void;
};

const InstallOsWizardContent = ({
  currentStep,
  setCurrentStep,
  error,
  catalogItem,
  isSuccessful,
  setError,
}: InstallOsWizardContentProps) => {
  const { t } = useTranslation();
  const { values, errors } = useFormikContext<InstallOsFormik>();
  const orderedStepIds = getOrderedStepIds(values.target);
  const validStepIds = getValidStepIds(errors, orderedStepIds);

  const canSubmit = values.target !== 'new-device' && !values.isSpecUnchanged;
  let showLeaveConfirmation = true;
  if (values.target === 'new-device' && currentStep?.id === selectTargetStepId) {
    showLeaveConfirmation = false;
  } else if (values.isSpecUnchanged && currentStep?.id === reviewStepId) {
    showLeaveConfirmation = false;
  }

  if (isSuccessful) {
    return <UpdateSuccessPage isSpecUnchanged={values.isSpecUnchanged} />;
  }

  return (
    <>
      {showLeaveConfirmation && <LeaveFormConfirmation />}
      <Wizard
        footer={
          <FlightCtlWizardFooter<InstallOsFormik>
            firstStepId={specificationsStepId}
            submitStepId={values.target === 'new-device' ? selectTargetStepId : reviewStepId}
            validateStep={validateOsWizardStep}
            saveButtonText={canSubmit ? t('Deploy') : t('Close')}
          />
        }
        onStepChange={(_, step) => {
          if (error) {
            setError(undefined);
          }
          setCurrentStep(step);
        }}
      >
        <WizardStep name={t('Specifications')} id={specificationsStepId}>
          {(!currentStep || currentStep?.id === specificationsStepId) && (
            <SpecificationsStep catalogItem={catalogItem} showNewDevice />
          )}
        </WizardStep>
        <WizardStep
          name={t('Select target')}
          id={selectTargetStepId}
          isDisabled={isWizardStepDisabled(selectTargetStepId, orderedStepIds, validStepIds)}
        >
          {currentStep?.id === selectTargetStepId && <SelectTargetStep catalogItem={catalogItem} />}
        </WizardStep>
        {values.target !== 'new-device' && (
          <WizardStep
            name={t('Review and deploy')}
            id={reviewStepId}
            isDisabled={isWizardStepDisabled(reviewStepId, orderedStepIds, validStepIds)}
          >
            {currentStep?.id === reviewStepId && <ReviewStep error={error} catalogItem={catalogItem} />}
          </WizardStep>
        )}
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
  const navigate = useNavigate();

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
      deploymentTarget: undefined,
      isSpecUnchanged: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSubmit = async (values: InstallOsFormik) => {
    setError(undefined);
    if (values.target === 'new-device') {
      navigate(-1);
      return;
    }
    const installToDevice = values.target === 'device';
    const selectedResource = installToDevice ? (values.device as Device) : (values.fleet as Fleet);
    if (!selectedResource) {
      setError(t('Deployment target not found for {{ target }}', { target: values.target }));
      return;
    }

    const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === values.version);
    if (!catalogItemVersion || !values.channel) {
      setError(t('Failed to find requested version {{ version }}', { version: values.version }));
      return;
    }

    const getResourceOs = async (
      endpoint: string,
      isDevice: boolean,
    ): Promise<ImageOrCatalogItemRefSpec | undefined> => {
      if (isDevice) {
        const res = await get<Device>(endpoint);
        return res?.spec?.os;
      } else {
        const res = await get<Fleet>(endpoint);
        return res?.spec?.template?.spec?.os;
      }
    };

    try {
      const resourceId = selectedResource.metadata.name as string;
      const endpoint = installToDevice ? `devices/${resourceId}` : `fleets/${resourceId}`;
      const currentOsSpec = await getResourceOs(endpoint, installToDevice);

      const allPatches: PatchRequest = [];
      appendJSONPatch({
        patches: allPatches,
        path: `${installToDevice ? '/spec/os' : '/spec/template/spec/os'}`,
        newValue: { catalogItemRef: buildCatalogItemRef({ catalogItem, catalogItemVersion, channel: values.channel }) },
        originalValue: currentOsSpec,
      });

      if (allPatches.length === 0) {
        setIsSuccessful(true);
      } else {
        await patch(endpoint, allPatches);
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
        setError={setError}
      />
    </Formik>
  );
};

export default InstallOsWizard;
