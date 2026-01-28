import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { Alert, Button, Content, FormGroup, Grid, Radio, Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import UploadField from '../../../form/UploadField';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AppSpecType, HelmImageAppForm } from '../../../../types/deviceSpec';

const ApplicationHelmForm = ({
  app,
  index,
  isReadOnly,
}: {
  app: HelmImageAppForm;
  index: number;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: valuesFiles }] = useField<Array<string>>(`${appFieldName}.valuesFiles`);
  const canAddValuesFile = valuesFiles && valuesFiles.every((file) => file && file.trim() !== '');

  return (
    <Grid hasGutter>
      <FormGroup label={t('Application name')} isRequired>
        <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} isDisabled={isReadOnly} />
      </FormGroup>

      {/* Field not configurable - just to display helm apps like the other app types that have OCI image references */}
      <Radio
        id={`${appFieldName}-helm-app-spec-type`}
        name={`${appFieldName}-helm-app-spec-type`}
        label={t('OCI reference URL')}
        value={AppSpecType.OCI_IMAGE}
        isDisabled={isReadOnly}
        isChecked
      />

      <FormGroupWithHelperText
        label={t('Image')}
        content={t('Reference to the OCI image or artifact containing the Helm chart.')}
        isRequired
      >
        <TextField
          aria-label={t('Image')}
          name={`${appFieldName}.image`}
          value={app.image || ''}
          isDisabled={isReadOnly}
          helperText={t('Provide a valid image reference')}
        />
      </FormGroupWithHelperText>

      <FormGroupWithHelperText label={t('Namespace')} content={t('The namespace to install the Helm chart into.')}>
        <TextField
          aria-label={t('Namespace')}
          name={`${appFieldName}.namespace`}
          value={app.namespace || ''}
          isDisabled={isReadOnly}
          placeholder={t('Type namespace here')}
        />
        <Alert
          isInline
          isPlain
          variant="info"
          className="pf-v6-u-mt-md"
          title={t('If you do not specify a namespace, the agent uses a namespace based on the application name.')}
        />
      </FormGroupWithHelperText>

      <FormGroupWithHelperText
        label={t('Values file names')}
        content={t(
          'Reference values files that are defined within the Helm application package. Files are applied in the specified order, before user-provided values.',
        )}
      >
        <FieldArray name={`${appFieldName}.valuesFiles`}>
          {({ push, remove }) => (
            <>
              {(valuesFiles || []).map((file, fileIndex) => (
                <Split hasGutter key={fileIndex} className="pf-v6-u-mb-sm">
                  <SplitItem isFilled>
                    <TextField
                      aria-label={t('Values file {{ number }}', { number: fileIndex + 1 })}
                      name={`${appFieldName}.valuesFiles.${fileIndex}`}
                      value={file}
                      isDisabled={isReadOnly}
                      helperText={t('Enter a file path relative to the Helm chart root. For example, values.yaml')}
                      placeholder={t('Type values file name here')}
                    />
                  </SplitItem>
                  {!isReadOnly && (
                    <SplitItem>
                      <Button
                        aria-label={t('Delete values file')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="end"
                        onClick={() => remove(fileIndex)}
                      />
                    </SplitItem>
                  )}
                </Split>
              ))}
              {!isReadOnly && (
                <FormGroup>
                  <Tooltip
                    className="fctl-application-helm-form__tooltip"
                    content={
                      <Content>{t('Fill in the existing values files before you can add more values files.')}</Content>
                    }
                  >
                    <Button
                      variant="link"
                      icon={<PlusCircleIcon />}
                      iconPosition="start"
                      isAriaDisabled={!canAddValuesFile}
                      onClick={() => {
                        push('');
                      }}
                    >
                      {t('Add values file')}
                    </Button>
                  </Tooltip>
                </FormGroup>
              )}
              <Alert
                isInline
                isPlain
                variant="info"
                className="pf-v6-u-mt-md"
                title={t(
                  'Order of precedence: Files are applied in the ordered listed. If the same parameter is defined in multiple files, the value in the last file takes precedence and overrides previous values.',
                )}
              />
            </>
          )}
        </FieldArray>
      </FormGroupWithHelperText>

      <FormGroupWithHelperText label={t('Inline values')} content={t('Provide a valid YAML file')}>
        <Content component="small">
          {t(
            'Enter configuration values in YAML format to be applied to the Helm chart. These values take precedence over those defined in the files listed above.',
          )}
        </Content>
        <UploadField ariaLabel={t('Inline values')} name={`${appFieldName}.valuesYaml`} isDisabled={isReadOnly} />
      </FormGroupWithHelperText>
    </Grid>
  );
};

export default ApplicationHelmForm;
