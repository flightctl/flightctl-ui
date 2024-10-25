import * as React from 'react';
import { FieldMetaProps, useField } from 'formik';
import { FileUpload, FormGroup } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

type UploadFieldProps = {
  name: string;
  isRequired?: boolean;
  label: string;
  getErrorText?: (error: string) => React.ReactNode | undefined;
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  maxFileBytes?: number;
};

const UploadHelperText = ({ meta, isUploading, isRejected, maxFileBytes }: { meta?: FieldMetaProps<unknown>;isUploading:boolean; isRejected:boolean; maxFileBytes?: number }) => {
  const {t} = useTranslation();

  const maxFileMB = (maxFileBytes || 0) / (1024 * 1024);

  const defaultContent = maxFileBytes ?  <DefaultHelperText helperText={t('Max file size {{ maxFileSize }} MB', { maxFileSize: maxFileMB})} /> : null;
  if (isRejected) {
    return (
      <>
        {defaultContent}
        <ErrorHelperText
          error={t('Content exceeds max file size of {{ maxFileSize }} MB', {
            maxFileSize: maxFileMB,
          })}
        />
      </>
    )
  } else if (!isUploading && !!meta?.error) {
    return (
      <>
        {defaultContent}
        <ErrorHelperText meta={meta} />
      </>
    )
  }
  return defaultContent;
}

const UploadField = ({ label, maxFileBytes, isRequired, name }: UploadFieldProps) => {
  const { t } = useTranslation();
  const fieldId = `fileuploadfield-${name}`;

  const [filename, setFilename] = React.useState<string>();
  const [isFileUploading, setIsFileUploading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);

  const [field, meta, { setValue, setTouched }] = useField<string | File>(name);
  const isValid = !isRejected && !((meta.touched || filename) && meta.error);

  const handleFileRejected = () => {
    setIsRejected(true);
    void setTouched(true);
    void setValue('');
  };

  const handleFileChange = (_event, file: string) => {
    void setValue(file);
    void setTouched(true);
    setIsRejected(false);
  };

  return (
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired}>
      <FileUpload
        type="text"
        id={field.name}
        isRequired={isRequired}
        filenamePlaceholder={t('Drag a file or browse to upload')}
        browseButtonText={t('Browse...')}
        clearButtonText={t('Clear')}
        style={{ resize: 'vertical' }}
        validated={isValid || isFileUploading ? 'default' : 'error'}
        value={field.value as string}
        filename={filename ? t('Content loaded from: {{ filename }}', { filename }) : ''}
        onDataChange={handleFileChange}
        onTextChange={handleFileChange}
        onFileInputChange={(_event, file) => {
          if (!maxFileBytes || file.size <= maxFileBytes) {
            setFilename(file.name);
            setIsRejected(false);
          }
        }}
        onReadStarted={() => {
          setIsFileUploading(true);
          setIsRejected(false);
        }}
        onReadFinished={() => setIsFileUploading(false)}
        isLoading={isFileUploading}
        dropzoneProps={{
          maxSize: maxFileBytes,
          onDropRejected: handleFileRejected,
        }}
        onClearClick={() => {
          setFilename('');
          void setValue('');
          void setTouched(false);
        }}
      />

      <UploadHelperText maxFileBytes={maxFileBytes} meta={meta} isUploading={isFileUploading} isRejected={isRejected}  />

    </FormGroup>
  );
};

export default UploadField;
