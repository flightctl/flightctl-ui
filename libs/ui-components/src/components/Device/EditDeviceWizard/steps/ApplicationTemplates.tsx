import * as React from 'react';

import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { TFunction } from 'i18next';

import { AppType } from '@flightctl/types';
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

import './ApplicationsForm.css';

const appSpecTypeOptions = (t: TFunction) => ({
  [AppSpecType.INLINE]: t('Inline application'),
  [AppSpecType.OCI_IMAGE]: t('Image based application'),
});

const appFormatOptions = (t: TFunction) => ({
  [AppType.AppTypeCompose]: t('Compose'),
  [AppType.AppTypeQuadlet]: t('Quadlet'),
});

const ApplicationSection = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, { error }, { setValue }] = useField<AppForm>(appFieldName);
  const isImageIncomplete = app.specType === AppSpecType.OCI_IMAGE && !('image' in app);
  const isComposeIncomplete = app.appType === AppType.AppTypeCompose && !('files' in app);
  const isQuadletIncomplete = app.appType === AppType.AppTypeQuadlet && !('files' in app);
  const shouldResetApp = isComposeIncomplete || isQuadletIncomplete || isImageIncomplete;

  // @ts-expect-error Formik error object includes "variables"
  const appVarsError = typeof error?.variables === 'string' ? (error.variables as string) : undefined; // eslint-disable @typescript-eslint/no-unsafe-assignment

  const appTypes = appSpecTypeOptions(t);
  const appFormats = appFormatOptions(t);

  React.useEffect(() => {
    // When switching specType, the app becomes "incomplete" and we must add the required fields for the new type
    if (shouldResetApp) {
      if (app.appType === AppType.AppTypeCompose || app.appType === AppType.AppTypeQuadlet) {
        setValue(
          {
            specType: AppSpecType.INLINE,
            appType: app.appType || AppType.AppTypeCompose,
            name: app.name || '',
            files: [{ path: '', content: '' }],
            variables: [],
          } as AppForm,
          false,
        );
      } else {
        setValue(
          {
            specType: AppSpecType.OCI_IMAGE,
            name: app.name || '',
            image: '',
            variables: [],
          } as AppForm,
          false,
        );
      }
    }
  }, [shouldResetApp, app.appType, app.name, setValue]);

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

        {!isImageAppForm(app) && (
          <FormGroup label={t('Application format')} isRequired>
            <FormSelect
              items={appFormats}
              name={`${appFieldName}.appType`}
              placeholderText={t('Select an application format')}
              isDisabled={isReadOnly}
            />
          </FormGroup>
        )}

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

        {isImageAppForm(app) && <ApplicationImageForm app={app} index={index} isReadOnly={isReadOnly} />}
        {isInlineAppForm(app) && <ApplicationInlineForm app={app} index={index} isReadOnly={isReadOnly} />}

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
