import * as React from 'react';

import {
  Button,
  Content,
  FormGroup,
  FormSection,
  Grid,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { AppType } from '@flightctl/types';
import {
  AppForm,
  AppSpecType,
  DeviceSpecConfigFormValues,
  isComposeImageAppForm,
  isComposeInlineAppForm,
  isHelmImageAppForm,
  isQuadletImageAppForm,
  isQuadletInlineAppForm,
  isSingleContainerAppForm,
} from '../../../../types/deviceSpec';
import { createInitialAppForm } from '../deviceSpecUtils';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import RadioField from '../../../form/RadioField';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { appTypeOptions } from '../../../../utils/apps';
import ApplicationImageForm from './ApplicationImageForm';
import ApplicationInlineForm from './ApplicationInlineForm';
import ApplicationContainerForm from './ApplicationContainerForm';
import ApplicationHelmForm from './ApplicationHelmForm';
import ApplicationVolumeForm from './ApplicationVolumeForm';
import ApplicationIntegritySettings from './ApplicationIntegritySettings';

import './ApplicationsForm.css';

const ApplicationSection = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, { error }, { setValue }] = useField<AppForm>(appFieldName);
  const { appType, specType, name: appName } = app;

  const isContainer = isSingleContainerAppForm(app);
  const isHelm = isHelmImageAppForm(app);
  const isQuadlet = isQuadletImageAppForm(app) || isQuadletInlineAppForm(app);
  const isImageIncomplete = !isContainer && specType === AppSpecType.OCI_IMAGE && !('image' in app);
  const isInlineIncomplete = !isContainer && specType === AppSpecType.INLINE && !('files' in app);
  const isContainerIncomplete = isContainer && (!('ports' in app) || !('volumes' in app));
  const isHelmIncomplete = isHelm && !('valuesFiles' in app);

  const shouldResetApp = isInlineIncomplete || isImageIncomplete || isContainerIncomplete || isHelmIncomplete;

  // @ts-expect-error Formik error object includes "variables"
  const appVarsError = typeof error?.variables === 'string' ? (error.variables as string) : undefined; // eslint-disable @typescript-eslint/no-unsafe-assignment

  const appTypesOptions = appTypeOptions(t);

  React.useEffect(() => {
    // When switching types we must ensure all mandatory fields are initialized for the new type
    if (shouldResetApp) {
      const app = createInitialAppForm(appType, specType, appName || '');
      setValue(app, false);
    }
  }, [shouldResetApp, specType, appType, appName, setValue]);

  return (
    <ExpandableFormSection
      title={app.name || t('Application {{ appNum }}', { appNum: index + 1 })}
      fieldName={appFieldName}
    >
      <Grid hasGutter>
        <FormGroup label={t('Application type')} isRequired>
          <FormSelect
            items={appTypesOptions}
            name={`${appFieldName}.appType`}
            placeholderText={t('Select an application type')}
            isDisabled={isReadOnly}
          />
        </FormGroup>

        {isContainer ? (
          <ApplicationContainerForm app={app} index={index} isReadOnly={isReadOnly} />
        ) : isHelm ? (
          <ApplicationHelmForm app={app} index={index} isReadOnly={isReadOnly} />
        ) : (
          <>
            <FormGroupWithHelperText
              label={t('Definition source')}
              isRequired
              content={
                <Stack hasGutter>
                  <StackItem>
                    <strong>{t('Configuration Sources')}:</strong>
                  </StackItem>
                  <StackItem>
                    <u>
                      <li>
                        <strong>{t('OCI reference')}</strong> -{' '}
                        {t('Pull definitions from container registry (reusable, versioned).')}
                      </li>
                      <li>
                        <strong>{t('Inline')}</strong> -{' '}
                        {t('Define application files directly in this interface (custom, one-off).')}
                      </li>
                    </u>
                  </StackItem>
                </Stack>
              }
            >
              <Split hasGutter>
                <SplitItem>
                  <RadioField
                    id={`${appFieldName}-spec-type-image`}
                    name={`${appFieldName}.specType`}
                    label={t('OCI reference URL')}
                    checkedValue={AppSpecType.OCI_IMAGE}
                    isDisabled={isReadOnly}
                  />
                </SplitItem>
                <SplitItem>
                  <RadioField
                    id={`${appFieldName}-spec-type-inline`}
                    name={`${appFieldName}.specType`}
                    label={t('Inline')}
                    checkedValue={AppSpecType.INLINE}
                    isDisabled={isReadOnly}
                  />
                </SplitItem>{' '}
              </Split>
            </FormGroupWithHelperText>

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

            {(isQuadletImageAppForm(app) || isComposeImageAppForm(app)) && (
              <ApplicationImageForm app={app} index={index} isReadOnly={isReadOnly} />
            )}
            {(isQuadletInlineAppForm(app) || isComposeInlineAppForm(app)) && (
              <ApplicationInlineForm app={app} index={index} isReadOnly={isReadOnly} />
            )}
            {isQuadlet && <ApplicationIntegritySettings index={index} isReadOnly={isReadOnly} />}
          </>
        )}

        {!isHelm && (
          <>
            <ApplicationVolumeForm
              appFieldName={appFieldName}
              volumes={app.volumes || []}
              isReadOnly={isReadOnly}
              isSingleContainerApp={isContainer}
            />
            <FieldArray name={`${appFieldName}.variables`}>
              {({ push, remove }) => (
                <>
                  {app.variables?.map((variable, varIndex) => (
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
                        style={{ paddingInline: 0 }}
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
          </>
        )}
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
      <>
        <Content component="p">
          {t(
            'Configure containerized applications and services that will run on your fleet devices. You can deploy single containers, Quadlet applications for advanced container orchestration or inline applications with custom files.',
          )}
        </Content>
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
                        push(createInitialAppForm(AppType.AppTypeContainer, AppSpecType.OCI_IMAGE));
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
      </>
    </FormGroupWithHelperText>
  );
};

export default ApplicationTemplates;
