import * as React from 'react';
import { Button, ModalFooter } from '@patternfly/react-core';
import { Formik } from 'formik';
import type { RJSFValidationError } from '@rjsf/utils';

import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlForm from '../form/FlightCtlForm';
import type { DynamicFormConfigFormik } from '../Catalog/InstallWizard/types';
import { isAppConfigStepValid } from '../Catalog/InstallWizard/steps/AppConfigStep';
import { type CatalogAdvancedConfigValues, validateCatalogAdvancedConfig } from './catalogCompositionUtils';
import CatalogAdvancedConfigStep from './CatalogAdvancedConfigStep';

export type CatalogAddSettingsStepProps = {
  initialValues: DynamicFormConfigFormik;
  onBack: VoidFunction;
  onConfirm: (advancedConfig: CatalogAdvancedConfigValues) => void;
};

const CatalogAddSettingsStep = ({ initialValues, onBack, onConfirm }: CatalogAddSettingsStepProps) => {
  const { t } = useTranslation();
  const [schemaErrors, setSchemaErrors] = React.useState<RJSFValidationError[] | undefined>();

  const validateAdvancedConfig = (values: DynamicFormConfigFormik) => {
    const result = validateCatalogAdvancedConfig(values, t);
    setSchemaErrors(result.schemaErrors);
    return Object.keys(result.errors).length > 0 ? result.errors : undefined;
  };

  return (
    <Formik<DynamicFormConfigFormik>
      enableReinitialize
      initialValues={initialValues}
      validate={validateAdvancedConfig}
      onSubmit={(values) => {
        onConfirm({
          configureVia: values.configureVia,
          editorContent: values.editorContent,
          formValues: values.formValues,
        });
      }}
    >
      {({ submitForm, isSubmitting, isValid, values, errors }) => (
        <>
          <FlightCtlForm>
            <CatalogAdvancedConfigStep schemaErrors={schemaErrors} />
          </FlightCtlForm>
          <ModalFooter>
            <Button
              variant="link"
              onClick={() => {
                setSchemaErrors(undefined);
                onBack();
              }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="primary"
              onClick={() => void submitForm()}
              isDisabled={isSubmitting || !isValid || !isAppConfigStepValid(values, errors)}
            >
              {t('Add to template')}
            </Button>
          </ModalFooter>
        </>
      )}
    </Formik>
  );
};

export default CatalogAddSettingsStep;
