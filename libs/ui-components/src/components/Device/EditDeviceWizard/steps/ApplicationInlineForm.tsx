import * as React from 'react';
import { FieldArray } from 'formik';
import { Button, FormGroup, Grid, Split, SplitItem } from '@patternfly/react-core';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { useTranslation } from '../../../../hooks/useTranslation';
import CheckboxField from '../../../form/CheckboxField';
import UploadField from '../../../form/UploadField';
import TextField from '../../../form/TextField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { InlineAppForm } from '../../../../types/deviceSpec';

const MAX_INLINE_FILE_SIZE_BYTES = 1024 * 1024;

type InlineApplicationFileFormProps = {
  file: InlineAppForm['files'][0];
  fileFieldName: string;
  fileIndex: number;
};

const InlineApplicationFileForm = ({ file, fileIndex, fileFieldName }: InlineApplicationFileFormProps) => {
  const { t } = useTranslation();
  return (
    <ExpandableFormSection
      title={t('File {{ fileNum }}', { fileNum: fileIndex + 1 })}
      fieldName={fileFieldName}
      description={file.path}
    >
      <Grid hasGutter>
        <FormGroup label={t('File path on the device (relative)')} isRequired>
          <TextField name={`${fileFieldName}.path`} />
        </FormGroup>
        <UploadField label={t('Content')} name={`${fileFieldName}.content`} maxFileBytes={MAX_INLINE_FILE_SIZE_BYTES} />

        <FormGroup>
          <CheckboxField name={`${fileFieldName}.base64`} label={t('Content is base64 encoded')} />
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

const ApplicationInlineForm = ({ app, index }: { app: InlineAppForm; index: number }) => {
  const { t } = useTranslation();

  return (
    <FieldArray name={`applications.${index}.files`}>
      {({ push, remove }) => (
        <>
          {app.files?.map((file, fileIndex) => {
            const fieldName = `applications[${index}].files[${fileIndex}]`;
            return (
              <Split key={fileIndex} hasGutter>
                <SplitItem isFilled>
                  <InlineApplicationFileForm file={file} fileIndex={fileIndex} fileFieldName={fieldName} />
                </SplitItem>
                {app.files.length > 1 && (
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
        </>
      )}
    </FieldArray>
  );
};

export default ApplicationInlineForm;
