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
import { AppForm, AppSpecType, DeviceSpecConfigFormValues } from '../../../../types/deviceSpec';
import { createInitialAppForm } from '../deviceSpecUtils';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import RadioField from '../../../form/RadioField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { appTypeOptions } from '../../../../utils/apps';
import ApplicationImageForm from './ApplicationImageForm';
import ApplicationInlineForm from './ApplicationInlineForm';
import ApplicationContainerForm from './ApplicationContainerForm';
import ApplicationHelmForm from './ApplicationHelmForm';
import ApplicationVolumeForm from './ApplicationVolumeForm';
import ApplicationVariablesForm from './ApplicationVariablesForm';
import ApplicationIntegritySettings from './ApplicationIntegritySettings';

import './ApplicationsForm.css';

const ApplicationSection = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, , { setValue }] = useField<AppForm>(appFieldName);
  const { appType, specType, name: appName } = app;

  const isContainer = app.appType === AppType.AppTypeContainer;
  const isHelm = app.appType === AppType.AppTypeHelm;
  const isQuadlet = app.appType === AppType.AppTypeQuadlet;
  const isCompose = app.appType === AppType.AppTypeCompose;

  // Each AppForm type has all data structures it needs initialized with safe defaults (eg. empty arrays, etc).
  // However, when the user switches to a type that doesn't have those fields, we must reset the app to define the missing fields.
  const isContainerIncomplete = isContainer && !('ports' in app);
  const isHelmIncomplete = isHelm && !('valuesFiles' in app);
  const isQuadletComposeIncomplete = (isQuadlet || isCompose) && !('volumes' in app);

  const shouldResetApp = isContainerIncomplete || isHelmIncomplete || isQuadletComposeIncomplete;

  const appTypesOptions = appTypeOptions(t);

  React.useEffect(() => {
    if (shouldResetApp) {
      const initialApp = createInitialAppForm(appType, appName || '');
      setValue(initialApp, false);
    }
  }, [shouldResetApp, appType, appName, setValue]);

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
          <ApplicationContainerForm index={index} isReadOnly={isReadOnly} />
        ) : isHelm ? (
          <ApplicationHelmForm index={index} isReadOnly={isReadOnly} />
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
                    isDisabled={isReadOnly}
                    checkedValue={AppSpecType.OCI_IMAGE}
                  />
                </SplitItem>
                <SplitItem>
                  <RadioField
                    id={`${appFieldName}-spec-type-inline`}
                    name={`${appFieldName}.specType`}
                    label={t('Inline')}
                    isDisabled={isReadOnly}
                    checkedValue={AppSpecType.INLINE}
                  />
                </SplitItem>{' '}
              </Split>
            </FormGroupWithHelperText>

            <FormGroupWithHelperText
              label={t('Application name')}
              content={
                specType === AppSpecType.INLINE
                  ? t('The unique identifier for this application.')
                  : t('If not specified, the image name will be used. Application name must be unique.')
              }
              isRequired={specType === AppSpecType.INLINE}
            >
              <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} isDisabled={isReadOnly} />
            </FormGroupWithHelperText>

            {specType === AppSpecType.OCI_IMAGE && <ApplicationImageForm index={index} isReadOnly={isReadOnly} />}
            {specType === AppSpecType.INLINE && (
              <ApplicationInlineForm files={app.files || []} index={index} isReadOnly={isReadOnly} />
            )}
          </>
        )}

        {(isQuadlet || isContainer) && <ApplicationIntegritySettings index={index} isReadOnly={isReadOnly} />}

        {!isHelm && (
          <>
            <ApplicationVolumeForm
              appFieldName={appFieldName}
              isReadOnly={isReadOnly}
              isSingleContainerApp={isContainer}
            />
            <ApplicationVariablesForm appFieldName={appFieldName} isReadOnly={isReadOnly} />
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
                        push(createInitialAppForm(AppType.AppTypeContainer));
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
