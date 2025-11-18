import * as React from 'react';

import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import { FormGroup, FormSection } from '@patternfly/react-core/dist/esm/components/Form';
import { Grid } from '@patternfly/react-core/dist/esm/layouts/Grid';
import { Split, SplitItem } from '@patternfly/react-core/dist/esm/layouts/Split';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import {
  AppForm,
  AppSpecType,
  DeviceSpecConfigFormValues,
  isImageAppForm,
  isInlineAppForm,
} from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import ApplicationImageForm from './ApplicationImageForm';
import ApplicationInlineForm from './ApplicationInlineForm';
import ApplicationContainerForm from './ApplicationContainerForm';

import './ApplicationsForm.css';

const ApplicationSection = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, { error }, { setValue }] = useField<AppForm>(appFieldName);
  const isInlineIncomplete = app.specType === AppSpecType.INLINE && !('files' in app);
  const isImageIncomplete = app.specType === AppSpecType.OCI_IMAGE && !('image' in app);
  // @ts-expect-error Formik error object includes "variables"
  const appVarsError = typeof error?.variables === 'string' ? (error.variables as string) : undefined; // eslint-disable @typescript-eslint/no-unsafe-assignment

  const appTypes = React.useMemo(() => {
    return {
      [AppSpecType.INLINE]: t('Inline application'),
      [AppSpecType.OCI_IMAGE]: t('Image based application'),
    };
  }, [t]);

  React.useEffect(() => {
    // When switching types, setting the new required fields and clearing those from the old type
    if (isInlineIncomplete) {
      setValue(
        {
          specType: AppSpecType.INLINE,
          appType: (app.appType || ('compose' as unknown as AppForm['appType'])),
          inlineFormat: 'compose',
          name: app.name || '',
          files: [{ path: '', content: '' }],
          variables: [],
        },
        false,
      );
    } else if (isImageIncomplete) {
      setValue(
        {
          specType: AppSpecType.OCI_IMAGE,
          appType: app.appType,
          name: app.name || '',
          image: '',
          variables: [],
        },
        false,
      );
    }
  }, [isImageIncomplete, isInlineIncomplete, app.name, app.appType, setValue]);

  return (
    <ExpandableFormSection
      title={t('Application {{ appNum }}', { appNum: index + 1 })}
      fieldName={appFieldName}
      description={app.name}
    >
      <Grid hasGutter>
        <FormGroup label={t('Application type')} isRequired>
          <FormSelect
            items={appTypes}
            name={`${appFieldName}.specType`}
            placeholderText={t('Select an application type')}
            isDisabled={isReadOnly}
          />
        </FormGroup>

        <FormGroupWithHelperText
          label={t('Application name')}
          content={
            app.specType === AppSpecType.INLINE
              ? t('The unique identifier for this application.')
              : t('If not specified, the image name will be used. Application name must be unique.')
          }
          isRequired={app.specType === AppSpecType.INLINE}
        >
          <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} isDisabled={isReadOnly} />
        </FormGroupWithHelperText>

        {isInlineAppForm(app) && (
          <FormGroup label={t('Application format')} isRequired>
            {/* UI-only format selector; 'container' maps to quadlet on submit */}
            <FormSelect
              items={{
                compose: t('Compose'),
                quadlet: t('Quadlet'),
                container: t('Container'),
              }}
              name={`${appFieldName}.inlineFormat`}
              placeholderText={t('Select a format')}
              isDisabled={isReadOnly}
            />
          </FormGroup>
        )}

        {isImageAppForm(app) && <ApplicationImageForm app={app} index={index} isReadOnly={isReadOnly} />}
        {isInlineAppForm(app) && app.inlineFormat !== 'container' && (
          <ApplicationInlineForm app={app} index={index} isReadOnly={isReadOnly} />
        )}
        {isInlineAppForm(app) && app.inlineFormat === 'container' && (
          <ApplicationContainerForm app={app} index={index} isReadOnly={isReadOnly} />
        )}

        <FieldArray name={`${appFieldName}.variables`}>
          {({ push, remove }) => (
            <>
              {app.variables.map((variable, varIndex) => (
                <Split hasGutter key={varIndex}>
                  <SplitItem className="fctl-application-template__variable-name">
                    <FormGroup label={t('Variable {{ number }}', { number: varIndex + 1 })} />
                  </SplitItem>
                  <SplitItem>
                    <FormGroup label={t('Name')} isRequired>
                      <TextField
                        aria-label={t('Name')}
                        name={`${appFieldName}.variables.${varIndex}.name`}
                        value={variable.name}
                        isDisabled={isReadOnly}
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem isFilled>
                    <FormGroup label={t('Value')} isRequired>
                      <TextField
                        aria-label={t('Value')}
                        name={`${appFieldName}.variables.${varIndex}.value`}
                        value={variable.value}
                        isDisabled={isReadOnly}
                      />
                    </FormGroup>
                  </SplitItem>
                  {!isReadOnly && (
                    <SplitItem>
                      <Button
                        aria-label={t('Delete variable')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="end"
                        onClick={() => remove(varIndex)}
                      />
                    </SplitItem>
                  )}
                </Split>
              ))}
              <ErrorHelperText error={appVarsError} />
              {!isReadOnly && (
                <FormGroup>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    iconPosition="start"
                    onClick={() => {
                      push({ name: '', value: '' });
                    }}
                  >
                    {t('Add an application variable')}
                  </Button>
                </FormGroup>
              )}
            </>
          )}
        </FieldArray>
      </Grid>
    </ExpandableFormSection>
  );
};

const ApplicationTemplates = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  if (isReadOnly && values.applications.length === 0) {
    return null;
  }

  return (
    <FormGroupWithHelperText
      label={t('Application workloads')}
      content={t('Define the application workloads that shall run on the device.')}
    >
      <FieldArray name="applications">
        {({ push, remove }) => (
          <>
            {values.applications.map((_app, index) => (
              <FormSection key={index}>
                <Split hasGutter>
                  <SplitItem isFilled>
                    <ApplicationSection index={index} isReadOnly={isReadOnly} />
                  </SplitItem>
                  {!isReadOnly && (
                    <SplitItem>
                      <Button
                        aria-label={t('Delete application')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="start"
                        onClick={() => remove(index)}
                      />
                    </SplitItem>
                  )}
                </Split>
              </FormSection>
            ))}

            {!isReadOnly && (
              <FormSection>
                <FormGroup>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    iconPosition="start"
                    onClick={() => {
                      push({
                        name: '',
                        variables: [],
                      });
                    }}
                  >
                    {t('Add application')}
                  </Button>
                </FormGroup>
              </FormSection>
            )}
          </>
        )}
      </FieldArray>
    </FormGroupWithHelperText>
  );
};

export default ApplicationTemplates;
