import * as React from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  Content,
  Flex,
  FlexItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import type { RJSFValidationError } from '@rjsf/utils';

import type { CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import type { CatalogAppForm } from '../../types/deviceSpec';
import FlightCtlModal from '../common/FlightCtlModal';
import FlightCtlForm from '../form/FlightCtlForm';
import {
  type CatalogAdvancedConfigValues,
  getAppNameValidationSchema,
  isAdvancedConfigRequired,
  renameCatalogAppForm,
  updateCatalogAppFormConfig,
  validateCatalogAdvancedConfig,
} from './catalogCompositionUtils';
import type { DynamicFormConfigFormik } from '../Catalog/InstallWizard/types';
import { getInitialAppConfig } from '../Catalog/InstallWizard/utils';
import { isAppConfigStepValid } from '../Catalog/InstallWizard/steps/AppConfigStep';

import CatalogAdvancedConfigStep from './CatalogAdvancedConfigStep';
import CatalogDefinitionFields from './CatalogDefinitionFields';
import { getCatalogRefDisplayName } from '../../utils/catalog';

type EditAppFormValues = DynamicFormConfigFormik & {
  wantAdvancedConfig: boolean;
};

enum Step {
  UpdateName = 'update-name',
  AddSettings = 'add-settings',
}

type CatalogEditAppModalProps = {
  catalogItem: CatalogItem;
  appForm: CatalogAppForm;
  onClose: VoidFunction;
  onSave: (app: CatalogAppForm) => void;
};

const CatalogEditAppModal = ({ catalogItem, appForm, onClose, onSave }: CatalogEditAppModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState<Step>(Step.UpdateName);
  const [schemaErrors, setSchemaErrors] = React.useState<RJSFValidationError[] | undefined>();

  const isUpdateNameStep = step === Step.UpdateName;

  const requiresAdvancedConfig = React.useMemo(() => {
    // This check is only necessary in the first step.
    if (!isUpdateNameStep) {
      return false;
    }
    return isAdvancedConfigRequired(catalogItem, appForm.catalogItemRef.version, appForm.apiApp);
  }, [isUpdateNameStep, catalogItem, appForm.catalogItemRef.version, appForm.apiApp]);

  const initialValues = React.useMemo<EditAppFormValues>(
    () => ({
      ...getInitialAppConfig(catalogItem, appForm.catalogItemRef.version, appForm.apiApp),
      wantAdvancedConfig: true,
    }),
    [catalogItem, appForm],
  );

  const handleClose = () => {
    setStep(Step.UpdateName);
    setSchemaErrors(undefined);
    onClose();
  };

  return (
    <FlightCtlModal variant="medium" isOpen>
      <ModalHeader>
        <Flex>
          <FlexItem>
            <Content component="h2">{t('Edit application')}</Content>
          </FlexItem>
          <FlexItem>
            <Content component="p">
              {t(`Catalog item: {{name}}`, {
                name: getCatalogRefDisplayName(appForm.catalogItemRef, catalogItem),
              })}
            </Content>
          </FlexItem>
        </Flex>
      </ModalHeader>
      <Formik<EditAppFormValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={getAppNameValidationSchema(t)}
        validate={(values) => {
          if (isUpdateNameStep) {
            return {};
          }
          const result = validateCatalogAdvancedConfig(values, t);
          setSchemaErrors(result.schemaErrors);
          return result.errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          if (isUpdateNameStep) {
            if (requiresAdvancedConfig || values.wantAdvancedConfig) {
              // Sync onSubmit returns undefined → Formik leaves isSubmitting true unless we clear it.
              setSubmitting(false);
              setStep(Step.AddSettings);
            } else {
              onSave(renameCatalogAppForm(appForm, values.appName));
              handleClose();
            }
            return;
          }

          const advancedConfig: CatalogAdvancedConfigValues = {
            configureVia: values.configureVia,
            editorContent: values.editorContent,
            formValues: values.formValues,
          };
          onSave(
            updateCatalogAppFormConfig({
              appForm,
              catalogItem,
              appName: values.appName,
              advancedConfig,
            }),
          );
          handleClose();
        }}
      >
        {({ values, submitForm, isSubmitting, errors }) => {
          const goToAdvancedConfig = requiresAdvancedConfig || values.wantAdvancedConfig;
          const canProceedConfigure = !errors.appName;
          const canSaveAdvanced = isAppConfigStepValid(values, errors);

          return (
            <>
              <ModalBody>
                <FlightCtlForm>
                  {isUpdateNameStep ? (
                    <CatalogDefinitionFields requiresAdvancedConfig={requiresAdvancedConfig} />
                  ) : (
                    <CatalogAdvancedConfigStep schemaErrors={schemaErrors} />
                  )}
                </FlightCtlForm>
              </ModalBody>
              <ModalFooter>
                <ActionList style={{ justifyContent: 'normal' }}>
                  <ActionListGroup>
                    <ActionListItem>
                      {isUpdateNameStep ? (
                        <Button variant="secondary" isDisabled>
                          {t('Back')}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSchemaErrors(undefined);
                            setStep(Step.UpdateName);
                          }}
                          isDisabled={isSubmitting}
                        >
                          {t('Back')}
                        </Button>
                      )}
                    </ActionListItem>
                    <ActionListItem>
                      <Button
                        variant="primary"
                        onClick={() => void submitForm()}
                        isDisabled={isSubmitting || (isUpdateNameStep ? !canProceedConfigure : !canSaveAdvanced)}
                      >
                        {isUpdateNameStep && goToAdvancedConfig ? t('Next') : t('Save')}
                      </Button>
                    </ActionListItem>
                  </ActionListGroup>
                  <ActionListGroup>
                    <ActionListItem>
                      <Button variant="link" onClick={handleClose} isDisabled={isSubmitting}>
                        {t('Cancel')}
                      </Button>
                    </ActionListItem>
                  </ActionListGroup>
                </ActionList>
              </ModalFooter>
            </>
          );
        }}
      </Formik>
    </FlightCtlModal>
  );
};

export default CatalogEditAppModal;
