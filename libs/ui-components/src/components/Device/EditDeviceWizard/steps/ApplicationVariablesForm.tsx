import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { VariablesForm } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import ErrorHelperText from '../../../form/FieldHelperText';

type ApplicationVariablesFormProps = {
  appFieldName: string;
  isReadOnly?: boolean;
};

const ApplicationVariablesForm = ({ appFieldName, isReadOnly }: ApplicationVariablesFormProps) => {
  const { t } = useTranslation();
  const [{ value: variables = [] }, { error }] = useField<VariablesForm>(`${appFieldName}.variables`);

  // @ts-expect-error Formik error object includes "variables"
  const appVarsError = typeof error?.variables === 'string' ? (error.variables as string) : undefined;

  return (
    <FormGroup label={t('Environment variables')} className="fctl-application-variables-form">
      <FieldArray name={`${appFieldName}.variables`}>
        {({ push, remove }) => (
          <>
            {variables.map((_variable, variableIndex) => {
              const variableFieldName = `${appFieldName}.variables[${variableIndex}]`;
              return (
                <FormSection key={variableIndex}>
                  <Split hasGutter>
                    <SplitItem isFilled>
                      <Grid hasGutter>
                        <FormGroup label={t('Name')} isRequired>
                          <TextField
                            name={`${variableFieldName}.name`}
                            aria-label={t('Variable name')}
                            isDisabled={isReadOnly}
                          />
                        </FormGroup>
                        <FormGroup label={t('Value')} isRequired>
                          <TextField
                            name={`${variableFieldName}.value`}
                            aria-label={t('Variable value')}
                            isDisabled={isReadOnly}
                          />
                        </FormGroup>
                      </Grid>
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Delete variable')}
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => remove(variableIndex)}
                        />
                      </SplitItem>
                    )}
                  </Split>
                </FormSection>
              );
            })}
            <ErrorHelperText error={appVarsError} />
            {!isReadOnly && (
              <FormGroup>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  iconPosition="start"
                  onClick={() => push({ name: '', value: '' })}
                >
                  {t('Add variable')}
                </Button>
              </FormGroup>
            )}
          </>
        )}
      </FieldArray>
    </FormGroup>
  );
};

export default ApplicationVariablesForm;
