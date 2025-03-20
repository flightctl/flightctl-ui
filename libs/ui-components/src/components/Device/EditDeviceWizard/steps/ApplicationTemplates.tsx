import * as React from 'react';

import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { DeviceSpecConfigFormValues } from '../types';
import { AppForm, AppSpecType, isImageAppForm, isInlineAppForm } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import WithHelperText from '../../../common/WithHelperText';
import ApplicationImageForm from './ApplicationImageForm';
import ApplicationInlineForm from './ApplicationInlineForm';

import './ApplicationsForm.css';

const ApplicationSection = ({ index }: { index: number }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, , { setValue }] = useField<AppForm>(appFieldName);
  const isInlineIncomplete = app.specType === AppSpecType.INLINE && !('files' in app);
  const isImageIncomplete = app.specType === AppSpecType.OCI_IMAGE && !('image' in app);

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
          name: app.name || '',
          image: '',
          variables: [],
        },
        false,
      );
    }
  }, [isImageIncomplete, isInlineIncomplete, app.name, setValue]);

  const appNameLabel =
    app.specType === AppSpecType.OCI_IMAGE ? (
      <WithHelperText
        ariaLabel={t('Application name')}
        content={t(
          'The image will be used instead when application name is not specified. Application name must be unique.',
        )}
        showLabel
      />
    ) : (
      t('Application name')
    );

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
          />
        </FormGroup>

        <FormGroup label={appNameLabel} isRequired={app.specType === AppSpecType.INLINE}>
          <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} />
        </FormGroup>

        {isImageAppForm(app) && <ApplicationImageForm app={app} index={index} />}
        {isInlineAppForm(app) && <ApplicationInlineForm app={app} index={index} />}

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
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem isFilled>
                    <FormGroup label={t('Value')} isRequired>
                      <TextField
                        aria-label={t('Value')}
                        name={`${appFieldName}.variables.${varIndex}.value`}
                        value={variable.value}
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem>
                    <Button
                      aria-label={t('Delete variable')}
                      variant="link"
                      icon={<MinusCircleIcon />}
                      iconPosition="end"
                      onClick={() => remove(varIndex)}
                    />
                  </SplitItem>
                </Split>
              ))}
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
            </>
          )}
        </FieldArray>
      </Grid>
    </ExpandableFormSection>
  );
};

const ApplicationTemplates = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();

  return (
    <FormGroup
      label={
        <WithHelperText
          ariaLabel={t('Application workloads')}
          content={t('Define the application workloads that shall run on the device.')}
          showLabel
        />
      }
    >
      <FieldArray name="applications">
        {({ push, remove }) => (
          <>
            {values.applications.map((_app, index) => (
              <FormSection key={index}>
                <Split hasGutter>
                  <SplitItem isFilled>
                    <ApplicationSection index={index} />
                  </SplitItem>
                  <SplitItem>
                    <Button
                      aria-label={t('Delete application')}
                      variant="link"
                      icon={<MinusCircleIcon />}
                      iconPosition="start"
                      onClick={() => remove(index)}
                    />
                  </SplitItem>
                </Split>
              </FormSection>
            ))}
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
          </>
        )}
      </FieldArray>
    </FormGroup>
  );
};

export default ApplicationTemplates;
