import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { Button, Content, FormGroup, FormSection, Grid, Split, SplitItem, Switch } from '@patternfly/react-core';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import CheckboxField from '../../../form/CheckboxField';
import UploadField from '../../../form/UploadField';
import TextField from '../../../form/TextField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import {
  ComposeInlineAppForm,
  QuadletInlineAppForm,
  RUN_AS_DEFAULT_USER,
  RUN_AS_ROOT_USER,
  isQuadletInlineAppForm,
} from '../../../../types/deviceSpec';

const MAX_INLINE_FILE_SIZE_BYTES = 1024 * 1024;

type InlineApplicationFileFormProps = {
  file: (QuadletInlineAppForm | ComposeInlineAppForm)['files'][0];
  fileFieldName: string;
  fileIndex: number;
  isReadOnly?: boolean;
};

const InlineApplicationFileForm = ({ file, fileIndex, fileFieldName, isReadOnly }: InlineApplicationFileFormProps) => {
  const { t } = useTranslation();
  return (
    <ExpandableFormSection
      title={t('File {{ fileNum }}', { fileNum: fileIndex + 1 })}
      fieldName={fileFieldName}
      description={file.path}
    >
      <Grid hasGutter>
        <FormGroup label={t('File path on the device (relative)')} isRequired>
          <TextField name={`${fileFieldName}.path`} isDisabled={isReadOnly} />
        </FormGroup>

        <FormGroup label={t('Content')}>
          <UploadField
            ariaLabel={t('Content')}
            name={`${fileFieldName}.content`}
            maxFileBytes={MAX_INLINE_FILE_SIZE_BYTES}
            isDisabled={isReadOnly}
          />
        </FormGroup>

        <FormGroup>
          <CheckboxField
            name={`${fileFieldName}.base64`}
            label={t('Content is base64 encoded')}
            isDisabled={isReadOnly}
          />
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

const ApplicationInlineForm = ({
  app,
  index,
  isReadOnly,
}: {
  app: QuadletInlineAppForm | ComposeInlineAppForm;
  index: number;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const isQuadlet = isQuadletInlineAppForm(app);
  const [{ value: runAs }, , { setValue: setRunAs }] = useField<string | undefined>(`${appFieldName}.runAs`);
  const isRootless = runAs !== RUN_AS_ROOT_USER;

  if (isReadOnly && !app.files?.length) {
    return null;
  }

  return (
    <Grid hasGutter>
      <FieldArray name={`applications.${index}.files`}>
        {({ push, remove }) => (
          <>
            {app.files?.map((file, fileIndex) => {
              const fieldName = `applications[${index}].files[${fileIndex}]`;
              return (
                <Split key={fileIndex} hasGutter>
                  <SplitItem isFilled>
                    <InlineApplicationFileForm
                      file={file}
                      fileIndex={fileIndex}
                      fileFieldName={fieldName}
                      isReadOnly={isReadOnly}
                    />
                  </SplitItem>
                  {!isReadOnly && app.files.length > 1 && (
                    <SplitItem>
                      <Button
                        aria-label={t('Delete file')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="start"
                        onClick={() => remove(fileIndex)}
                      />
                    </SplitItem>
                  )}
                </Split>
              );
            })}

            {!isReadOnly && (
              <FormGroup>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  iconPosition="start"
                  onClick={() => {
                    push({
                      path: '',
                      content: '',
                      base64: false,
                    });
                  }}
                >
                  {t('Add file')}
                </Button>
              </FormGroup>
            )}
          </>
        )}
      </FieldArray>
      {isQuadlet && (
        <FormSection title={t('Access & permissions')}>
          <FormGroup>
            <Switch
              id={`${appFieldName}-system-integrity-switch`}
              aria-label={t('System integrity protection')}
              label={isRootless ? t('System integrity protection enabled') : t('System integrity protection disabled')}
              isChecked={isRootless}
              onChange={async (_, checked) => {
                await setRunAs(checked ? RUN_AS_DEFAULT_USER : RUN_AS_ROOT_USER);
              }}
              isDisabled={isReadOnly}
            />
            <DefaultHelperText
              helperText={
                <Content component="small">
                  {t(
                    'Prevents this workload from modifying critical host operating system files. We recommend keeping this enabled to maintain system integrity.',
                  )}
                </Content>
              }
            />
          </FormGroup>
          {isRootless && (
            <FormGroup label={t('Rootless user identity')} isRequired>
              <TextField
                aria-label={t('Rootless user identity')}
                name={`${appFieldName}.runAs`}
                value={runAs || RUN_AS_DEFAULT_USER}
                isDisabled
                readOnly
                helperText={t(
                  "By default, workloads run as the '{{ runAsUser }}' user. To specify a custom user identity, edit the application configuration via YAML or CLI.",
                  {
                    runAsUser: RUN_AS_DEFAULT_USER,
                  },
                )}
              />
            </FormGroup>
          )}
        </FormSection>
      )}
    </Grid>
  );
};

export default ApplicationInlineForm;
