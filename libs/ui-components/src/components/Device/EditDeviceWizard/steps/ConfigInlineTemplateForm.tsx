import * as React from 'react';
import { Button, FormGroup, Grid, Split, SplitItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { FieldArray, useField, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import FormSelectTypeahead from '../../../form/FormSelectTypeahead';
import TextField from '../../../form/TextField';
import UploadField from '../../../form/UploadField';
import CheckboxField from '../../../form/CheckboxField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { DeviceSpecConfigFormValues, InlineConfigTemplate } from '../../../../types/deviceSpec';
import { formatFileMode } from '../deviceSpecUtils';

const MAX_INLINE_FILE_SIZE_BYTES = 1024 * 1024;

const FileForm = ({ fieldName, index, isReadOnly }: { fieldName: string; index: number; isReadOnly?: boolean }) => {
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
    <ExpandableFormSection
      title={t('File {{ fileNum }}', { fileNum: index + 1 })}
      fieldName={fieldName}
      description={file.path}
    >
      <Grid hasGutter>
        <FormGroup label={t('File path on the device')} isRequired>
          <TextField name={`${fieldName}.path`} isDisabled={isReadOnly} />
        </FormGroup>
        <UploadField
          label={t('Content')}
          name={`${fieldName}.content`}
          maxFileBytes={MAX_INLINE_FILE_SIZE_BYTES}
          isDisabled={isReadOnly}
        />
        <FormGroup>
          <CheckboxField name={`${fieldName}.base64`} label={t('Content is base64 encoded')} isDisabled={isReadOnly} />
        </FormGroup>
        <FormGroup label={t('Permissions')}>
          <FormSelectTypeahead
            name={`${fieldName}.permissions`}
            placeholderText={t('Select permissions')}
            helperText={t('Select from the list or type in the permission code in octal notation')}
            defaultId="0644"
            items={permissions}
            isValidTypedItem={(value) => {
              try {
                if (value !== '' && value.length === 4) {
                  const valNum = Number(`0o${value}`);
                  return Number.isFinite(valNum) && valNum >= 0 && valNum <= 0o7777;
                }
              } catch {
                return false;
              }
              return false;
            }}
            transformTypedItem={formatFileMode}
            isDisabled={isReadOnly}
          />
        </FormGroup>
        <FormGroup label={t('User')}>
          <TextField name={`${fieldName}.user`} placeholder="root" isDisabled={isReadOnly} />
        </FormGroup>
        <FormGroup label={t('Group')}>
          <TextField name={`${fieldName}.group`} placeholder="root" isDisabled={isReadOnly} />
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

type ConfigInlineTemplateFormProps = {
  index: number;
  isReadOnly?: boolean;
};

const ConfigInlineTemplateForm = ({ index, isReadOnly }: ConfigInlineTemplateFormProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<DeviceSpecConfigFormValues>();
  const inlineConfig = values.configTemplates[index] as InlineConfigTemplate;
  const configCount = inlineConfig.files?.length || 0;

  React.useEffect(() => {
    if (configCount === 0) {
      setFieldValue(`configTemplates.${index}.files`, [
        {
          path: '',
          content: '',
        },
      ]);
    }
    // eslint-disable-next-line
  }, []);

  if (isReadOnly && configCount === 0) {
    return null;
  }

  return (
    <FieldArray name={`configTemplates.${index}.files`}>
      {({ push, remove }) => (
        <>
          {inlineConfig.files?.map((_, fileIndex) => {
            const fieldName = `configTemplates[${index}].files[${fileIndex}]`;
            return (
              <Split key={fileIndex} hasGutter>
                <SplitItem isFilled>
                  <FileForm index={fileIndex} fieldName={fieldName} isReadOnly={isReadOnly} />
                </SplitItem>
                {!isReadOnly && configCount > 1 && (
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
  );
};

export default ConfigInlineTemplateForm;
