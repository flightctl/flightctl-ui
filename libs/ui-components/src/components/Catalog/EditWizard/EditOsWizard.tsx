import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import { Formik, FormikErrors, useFormikContext } from 'formik';
import * as Yup from 'yup';
import semver from 'semver';

import { useTranslation } from '../../../hooks/useTranslation';
import { InstallSpecFormik } from '../InstallWizard/types';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { getUpdates } from '../utils';
import UpdateStep, { isUpdateStepValid } from './steps/UpdateStep';
import { getErrorMessage } from '../../../utils/error';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';

const versionStepId = 'version-step';
const reviewStepId = 'review-step';

const validateUpdateWizardStep = (activeStepId: string, errors: FormikErrors<InstallSpecFormik>) => {
  if (activeStepId === versionStepId) return isUpdateStepValid(errors);
  return true;
};

type WizardContentProps = {
  currentVersion: CatalogItemVersion;
  catalogItem: CatalogItem;
  error: string | undefined;
  setError: (err: string | undefined) => void;
  isEdit: boolean;
};

const WizardContent: React.FC<WizardContentProps> = ({ currentVersion, catalogItem, error, setError, isEdit }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const { values } = useFormikContext<InstallSpecFormik>();

  const isVersionStepValid = !!values.version;

  return (
    <>
      <LeaveFormConfirmation />
      <Wizard
        footer={
          <FlightCtlWizardFooter<InstallSpecFormik>
            firstStepId={versionStepId}
            submitStepId={reviewStepId}
            validateStep={(activeStepId, errors) => validateUpdateWizardStep(activeStepId, errors)}
            saveButtonText={isEdit ? t('Update') : t('Deploy')}
          />
        }
        onStepChange={(_, step) => {
          if (error) {
            setError(undefined);
          }
          setCurrentStep(step);
        }}
      >
        <WizardStep name={t('Version')} id={versionStepId}>
          {(!currentStep || currentStep?.id === versionStepId) && (
            <UpdateStep catalogItem={catalogItem} currentVersion={currentVersion} isEdit={isEdit} />
          )}
        </WizardStep>
        <WizardStep name={t('Review')} id={reviewStepId} isDisabled={!isVersionStepValid}>
          {currentStep?.id === reviewStepId && <ReviewStep error={error} isEdit={isEdit} />}
        </WizardStep>
      </Wizard>
    </>
  );
};

type EditOsWizardProps = {
  catalogItem: CatalogItem;
  currentVersion: CatalogItemVersion;
  onUpdate: (catalogItemVersion: CatalogItemVersion, values: InstallSpecFormik) => Promise<void>;
  currentChannel: string;
  currentLabels: Record<string, string> | undefined;
  isEdit: boolean;
  version: string;
  channel: string;
};

const EditOsWizard: React.FC<EditOsWizardProps> = ({
  catalogItem,
  currentVersion,
  onUpdate,
  currentChannel,
  isEdit,
  version,
  channel,
}) => {
  const [error, setError] = React.useState<string>();
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    version: Yup.string().required(t('Version must be selected')),
  });

  const latestVersion = getUpdates(catalogItem, currentChannel, currentVersion.version).sort((a, b) =>
    semver.rcompare(a.version, b.version),
  )[0]?.version;

  return (
    <Formik<InstallSpecFormik>
      validationSchema={validationSchema}
      initialValues={{
        version: isEdit ? latestVersion || currentVersion.version : version,
        channel: isEdit ? currentChannel : channel,
      }}
      validateOnMount
      onSubmit={async (values) => {
        const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === values.version);
        if (!catalogItemVersion) {
          setError(t('Version {{version}} not found', { version: values.version }));
          return;
        }
        try {
          await onUpdate(catalogItemVersion, values);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      <WizardContent
        currentVersion={currentVersion}
        catalogItem={catalogItem}
        error={error}
        setError={setError}
        isEdit={isEdit}
      />
    </Formik>
  );
};

export default EditOsWizard;
