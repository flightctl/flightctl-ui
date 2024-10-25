import * as React from 'react';
import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { FieldArray, useField, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import TextField from '../../../form/TextField';
import SwitchField from '../../../form/SwitchField';
import UploadField from '../../../form/UploadField';
import { DeviceSpecConfigFormValues } from '../types';
import { InlineConfigTemplate } from '../../../../types/deviceSpec';

import { formatFileMode } from '../deviceSpecUtils';

const MAX_INLINE_FILE_SIZE_BYTES = 1024 * 1024;

const FileForm = ({ fieldName }: { fieldName: string }) => {
  const { t } = useTranslation();
  const [{ value: file }] = useField<InlineConfigTemplate['files'][0]>(fieldName);

  const permissions = React.useMemo(
    () => ({
      '0777': t('(0777) Read, write, and execute permissions for all users.'),
      '0755': t("(0755) Read and execute permission for all users. The file's owner also has write permission."),
      '0750': t(
        "(0750) Read and execute permission for the owner and group. The file's owner also has write permission.",
      ),
      '0700': t("(0700) Read, write, and execute permissions for the file's owner only."),
      '0666': t('(0666) Read and write permissions for all users. No execute permissions for others.'),
      '0664': t('(0664) Read and write permissions for the owner and group. Read-only permission for all others.'),
      '0660': t('(0660) Read and write permissions for the owner and group.'),
      '0644': t('(0644) Read and write permissions for the owner. Read-only permission for all others.'),
      '0640': t('(0640) Read and write permissions for the owner, and read-only permission for the group.'),
      '0600': t('(0600) Read and write permissions for the owner.'),
      '0400': t('(0400) Read permission for the owner.'),
    }),
    [t],
  );

  return (
    <ExpandableFormSection title={t('File')} fieldName={fieldName} description={file.path}>
      <Grid hasGutter>
        <FormGroup label={t('File path on the device')} isRequired>
          <TextField name={`${fieldName}.path`} />
        </FormGroup>
        <UploadField
          label={t('Content')}
          name={`${fieldName}.content`}
          maxFileBytes={MAX_INLINE_FILE_SIZE_BYTES}
          isRequired
        />
        <SwitchField label={t('Content is base64 encoded')} name={`${fieldName}.base64`} />
        <FormGroup label={t('Permissions')}>
          <FormSelectTypeahead
            name={`${fieldName}.permissions`}
            placeholderText={t('Select permissions')}
            helperText={t('Select from the list or type in the permission code in octal notation')}
            defaultId="0644"
            items={permissions}
            validateNewItem={(value) => {
              try {
                if (value !== '' && value.length <= 4) {
                  const valNum = Number(`0o${value}`);
                  if (isFinite(valNum) && valNum >= 0 && valNum <= 0o7777) {
                    return undefined;
                  }
                }
              } catch {
                return t('Invalid permissions');
              }
              return t('Invalid permissions');
            }}
            transformNewItem={formatFileMode}
          />
        </FormGroup>
        <FormGroup label={t('User')}>
          <TextField name={`${fieldName}.user`} placeholder="root" />
        </FormGroup>
        <FormGroup label={t('Group')}>
          <TextField name={`${fieldName}.group`} placeholder="root" />
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

type ConfigInlineTemplateFormProps = {
  index: number;
};

const ConfigInlineTemplateForm = ({ index }: ConfigInlineTemplateFormProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<DeviceSpecConfigFormValues>();
  const inlineConfig = values.configTemplates[index] as InlineConfigTemplate;
  React.useEffect(() => {
    if (!inlineConfig.files?.length) {
      setFieldValue(`configTemplates.${index}.files`, [
        {
          path: '',
          content: '',
        },
      ]);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <FieldArray name={`configTemplates.${index}.files`}>
      {({ push, remove }) => (
        <>
          {inlineConfig.files?.map((_, fileIndex) => {
            const fieldName = `configTemplates[${index}].files[${fileIndex}]`;
            return (
              <FormSection key={fileIndex}>
                <Split hasGutter>
                  <SplitItem isFilled>
                    <FileForm fieldName={fieldName} />
                  </SplitItem>
                  {inlineConfig.files.length > 1 && (
                    <SplitItem>
                      <Button
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="start"
                        onClick={() => remove(fileIndex)}
                      />
                    </SplitItem>
                  )}
                </Split>
              </FormSection>
            );
          })}
          <FormSection>
            <FormGroup>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                iconPosition="start"
                onClick={() => {
                  push({
                    path: '',
                    content: '',
                  });
                }}
              >
                {t('Add file')}
              </Button>
            </FormGroup>
          </FormSection>
        </>
      )}
    </FieldArray>
  );
};

export default ConfigInlineTemplateForm;
