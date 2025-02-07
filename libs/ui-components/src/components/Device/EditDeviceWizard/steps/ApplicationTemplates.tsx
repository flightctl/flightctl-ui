import * as React from 'react';

import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { ApplicationFormSpec, DeviceSpecConfigFormValues } from '../types';

import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import WithHelperText from '../../../common/WithHelperText';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { CREATING_APPLICATIONS_LINK } from '../../../../links';

import './ApplicationsForm.css';

const ApplicationSection = ({ index }: { index: number }) => {
  const { t } = useTranslation();
  const fieldName = `applications[${index}]`;
  const [{ value: app }] = useField<ApplicationFormSpec>(fieldName);

  return (
    <ExpandableFormSection
      title={t('Application {{ appNum }}', { appNum: index + 1 })}
      fieldName={fieldName}
      description={app.name || app.image}
    >
      <Grid hasGutter>
        <FormGroup
          label={
            <WithHelperText
              ariaLabel={t('Image')}
              content={
                <span>
                  {t('The application image. Learn how to create one')}{' '}
                  <LearnMoreLink text={t('here')} link={CREATING_APPLICATIONS_LINK} />
                </span>
              }
              showLabel
            />
          }
          isRequired
        >
          <TextField aria-label={t('Image')} name={`applications.${index}.image`} value={app.image} />
        </FormGroup>
        <FormGroup
          label={
            <WithHelperText
              ariaLabel={t('Application name')}
              content={t(
                'The image name will be used instead of when application name is not specified. Application name must be unique.',
              )}
              showLabel
            />
          }
        >
          <TextField aria-label={t('Application name')} name={`applications.${index}.name`} value={app.name} />
        </FormGroup>
        <FieldArray name={`applications.${index}.variables`}>
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
                        name={`applications.${index}.variables.${varIndex}.name`}
                        value={variable.name}
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem isFilled>
                    <FormGroup label={t('Value')} isRequired>
                      <TextField
                        aria-label={t('Value')}
                        name={`applications.${index}.variables.${varIndex}.value`}
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
                  {t('Add a variable')}
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
                      image: '',
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
