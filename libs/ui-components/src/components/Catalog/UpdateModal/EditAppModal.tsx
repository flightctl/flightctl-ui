import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { RJSFValidationError } from '@rjsf/utils';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import { ApplicationProviderSpec, ContainerApplication, ImageVolumeProviderSpec } from '@flightctl/types';
import {
  Alert,
  Button,
  EmptyState,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import FlightCtlForm from '../../form/FlightCtlForm';
import { getInitialAppConfig } from '../InstallWizard/utils';
import { DynamicAppForm, isAppConfigStepValid } from '../InstallWizard/steps/AppConfigStep';
import { DynamicFormConfigFormik } from '../InstallWizard/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getFullReferenceURI } from '../utils';
import { useSubmit } from '../useSubmit';
import { validApplicationAndVolumeName } from '../../form/validations';

type EditAppModalContentProps = {
  onClose: VoidFunction;
  error: string | undefined;
  schemaErrors: RJSFValidationError[] | undefined;
  isEdit: boolean;
};

const EditAppModalContent = ({ onClose, error, schemaErrors, isEdit }: EditAppModalContentProps) => {
  const { t } = useTranslation();
  const { submitForm, isSubmitting, isValid, values, errors, dirty } = useFormikContext<AppUpdateFormik>();
  const isConfigValid = isAppConfigStepValid(values, errors);
  return (
    <>
      <ModalHeader title={isEdit ? t('Edit application') : t('Deploy application')} />
      <ModalBody>
        <FlightCtlForm>
          <DynamicAppForm isInModal isEdit={isEdit} schemaErrors={schemaErrors} />
        </FlightCtlForm>
      </ModalBody>
      <ModalFooter>
        <Stack hasGutter>
          <StackItem>
            {error && (
              <Alert
                isInline
                variant="danger"
                title={isEdit ? t('Failed to update the application') : t('Failed to deploy the application')}
              >
                {error}
              </Alert>
            )}
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <Button
                  variant="primary"
                  onClick={submitForm}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting || !isValid || !isConfigValid || !dirty}
                >
                  {isEdit ? t('Edit') : t('Deploy')}
                </Button>
              </SplitItem>
              <SplitItem>
                <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
                  {t('Cancel')}
                </Button>
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </ModalFooter>
    </>
  );
};

export type AppUpdateFormik = DynamicFormConfigFormik;

type EditAppModalProps = {
  currentApps: ApplicationProviderSpec[] | undefined;
  catalogItem: CatalogItem;
  onClose: VoidFunction;
  currentVersion: CatalogItemVersion;
  currentChannel: string;
  onSubmit: (catalogItem: CatalogItem, version: string, channel: string, values: AppUpdateFormik) => Promise<void>;
  appSpec?: ApplicationProviderSpec;
  exisingLabels: Record<string, string> | undefined;
};

const EditAppModal = ({
  currentApps,
  catalogItem,
  onClose,
  currentVersion,
  onSubmit,
  appSpec,
  currentChannel,
  exisingLabels,
}: EditAppModalProps) => {
  const { t } = useTranslation();
  const { get } = useFetch();

  const [initialValues, setInitialValues] = React.useState<DynamicFormConfigFormik>();

  const validationSchema = Yup.object({
    appName: validApplicationAndVolumeName(t)
      .required(t('Application name is required'))
      .test('is-unique', t('Application with the same name already exists.'), (value) => {
        if (appSpec || !currentApps?.length) {
          return true;
        }
        return !currentApps.some((app) => app.name === value);
      }),
  });

  React.useEffect(() => {
    (async () => {
      const appConfig = getInitialAppConfig(catalogItem, currentVersion.version, appSpec, exisingLabels);

      const assetCatalogItems = appConfig.selectedAssets.map((sa) => {
        return get<CatalogItem>(`catalogs/${sa.assetCatalog}/items/${sa.assetItemName}`);
      });

      const results = await Promise.allSettled(assetCatalogItems);
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          const volumeIdx = appConfig.selectedAssets[idx].volumeIndex;
          const volumes = (appSpec as ContainerApplication).volumes;
          const volume = volumes ? volumes[volumeIdx] : undefined;
          const imgRef = (volume as ImageVolumeProviderSpec).image?.reference;
          const v = r.value.spec.versions.find((v) => getFullReferenceURI(r.value.spec.reference.uri, v) === imgRef);
          appConfig.selectedAssets[idx].assetVersion = v?.version || '';
          appConfig.selectedAssets[idx].assetItem = r.value;
        }
      });
      setInitialValues(appConfig);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    onSubmit: submit,
    error,
    schemaErrors,
  } = useSubmit<DynamicFormConfigFormik>({
    onUpdate: async (values) => {
      await onSubmit(catalogItem, currentVersion.version, currentChannel, values);
    },
  });

  return (
    <Modal isOpen onClose={onClose} variant="medium">
      {initialValues ? (
        <Formik<AppUpdateFormik>
          validationSchema={validationSchema}
          initialValues={initialValues}
          validateOnMount
          onSubmit={async (values) => {
            const success = await submit(values);
            if (success) {
              onClose();
            }
          }}
        >
          <EditAppModalContent onClose={onClose} error={error} schemaErrors={schemaErrors} isEdit={!!appSpec} />
        </Formik>
      ) : (
        <EmptyState titleText={t('Loading application details')} headingLevel="h4" icon={Spinner} />
      )}
    </Modal>
  );
};

export default EditAppModal;
