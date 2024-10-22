import * as React from 'react';

import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { ApplicationFormSpec, DeviceSpecConfigFormValues } from '../types';

import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';

import './ApplicationsForm.css';

const ApplicationSection = ({ index }: { index: number }) => {
  const { t } = useTranslation();
  const fieldName = `applications[${index}]`;
  const [{ value: app }] = useField<ApplicationFormSpec>(fieldName);

  return (
    <ExpandableFormSection title={t('Application')} fieldName={fieldName} description={app.name || app.image}>
      <Grid hasGutter>
        <FormGroup label={t('Image')} isRequired>
          <TextField aria-label={t('Image')} name={`applications.${index}.image`} value={app.image} />
        </FormGroup>
        <FormGroup label={t('Application name')}>
          <TextField
            aria-label={t('Application name')}
            name={`applications.${index}.name`}
            value={app.name}
            helperText={t('The image name will be used if no name is specified')}
          />
        </FormGroup>
        <FieldArray name={`applications.${index}.variables`}>
          {({ push, remove }) => (
            <FormSection>
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
            </FormSection>
          )}
        </FieldArray>
      </Grid>
    </ExpandableFormSection>
  );
};

const ApplicationsForm = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();

  return (
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
  );
};

export default ApplicationsForm;
