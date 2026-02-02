import * as React from 'react';
import { load } from 'js-yaml';
import { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import { DynamicFormConfigFormik } from './InstallWizard/types';

type useSubmitProps<F> = {
  onUpdate: (values: F) => Promise<void>;
};

export const useSubmit = <F extends Pick<DynamicFormConfigFormik, 'configureVia' | 'editorContent' | 'configSchema'>>({
  onUpdate,
}: useSubmitProps<F>): {
  onSubmit: (values: F) => Promise<boolean>;
  error?: string;
  schemaErrors?: RJSFValidationError[];
} => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const [schemaErrors, setSchemaErrors] = React.useState<RJSFValidationError[]>();

  const onSubmit = async (values: F) => {
    setError(undefined);
    setSchemaErrors(undefined);
    if (values.configureVia === 'editor') {
      let yamlContent: unknown;
      try {
        yamlContent = load(values.editorContent);
      } catch {
        setError(t('Not a valid configuration'));
        return false;
      }
      if (values.configSchema) {
        const validationData = validator.validateFormData(yamlContent, values.configSchema as RJSFSchema);
        if (validationData.errors.length) {
          setSchemaErrors(validationData.errors);
          return false;
        }
      }
    }
    try {
      await onUpdate(values);
      return true;
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  };

  return {
    onSubmit,
    error,
    schemaErrors,
  };
};
