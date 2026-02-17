import * as React from 'react';
import { FieldMetaProps, useField } from 'formik';
import { FileUpload, FormGroup, TextArea } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

type UploadFieldProps = {
  name: string;
  isRequired?: boolean;
  ariaLabel: string;
  isDisabled?: boolean;
  getErrorText?: (error: string) => React.ReactNode | undefined;
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  maxFileBytes?: number;
};

const ONE_MB = 1024 * 1024;

const UploadMaxFileSizeHelperText = ({ maxFileBytes }: { maxFileBytes: number }) => {
  const { t } = useTranslation();

  const showKB = maxFileBytes < ONE_MB;
  const maxFileSize = maxFileBytes / (showKB ? 1024 : ONE_MB);

  const helperText = showKB
    ? t('Max file size {{ maxFileSize }} KB', { maxFileSize })
    : t('Max file size {{ maxFileSize }} MB', { maxFileSize });

  return <DefaultHelperText helperText={helperText} />;
};

const UploadErrorHelperText = ({
  meta,
  isUploading,
  isRejected,
}: {
  meta?: FieldMetaProps<unknown>;
  isUploading: boolean;
  isRejected: boolean;
}) => {
  const { t } = useTranslation();

  if (isRejected) {
    return <ErrorHelperText error={t('File exceeds maximum allowed size.')} />;
  } else if (!isUploading && !!meta?.error) {
    return <ErrorHelperText meta={meta} />;
  }
  return null;
};

const UploadField = ({ ariaLabel, maxFileBytes, isRequired, name }: UploadFieldProps) => {
  const { t } = useTranslation();
  const fieldId = `fileuploadfield-${name}`;

  const [filename, setFilename] = React.useState<string>();
  const [isFileUploading, setIsFileUploading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);

  const [field, meta, { setValue, setTouched }] = useField<string | File>(name);
  const isValid = !isRejected && !((meta.touched || filename) && meta.error);

  const handleFileRejected = (clearValue: boolean) => {
    setIsRejected(true);
    void setTouched(true);
    if (clearValue) {
      void setValue('');
    }
  };

  const handleFileChange = (_event, file: string) => {
    if (maxFileBytes) {
      const contentFile = new TextEncoder().encode(file);
      if (contentFile.length > maxFileBytes) {
        handleFileRejected(false);
        return;
      }
    }

    // To prevent timing issues with validations, we must touch the field before we set the new value
    void setTouched(true);
    void setValue(file, true);
    setIsRejected(false);
  };

  return (
    <FormGroup fieldId={fieldId} aria-label={ariaLabel} isRequired={isRequired}>
      <FileUpload
        type="text"
        id={field.name}
        isRequired={isRequired}
        filenamePlaceholder={t('Drag a file or browse to upload')}
        browseButtonText={t('Browse...')}
        clearButtonText={t('Clear')}
        allowEditingUploadedText
        style={{ resize: 'vertical' }}
        validated={isValid || isFileUploading ? 'default' : 'error'}
        value={field.value as string}
        filename={filename ? t('Content loaded from: {{ filename }}', { filename }) : ''}
        onDataChange={handleFileChange}
        onTextChange={handleFileChange}
        onFileInputChange={(_event, file) => {
          if (maxFileBytes && file.size > maxFileBytes) {
            handleFileRejected(true);
          } else {
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
          onDropRejected: () => handleFileRejected(true),
        }}
        onClearClick={() => {
          setFilename('');
          if (!isRequired) {
            void setTouched(false);
          }
          void setValue('');
        }}
      />
      {maxFileBytes && <UploadMaxFileSizeHelperText maxFileBytes={maxFileBytes} />}
      <UploadErrorHelperText meta={meta} isUploading={isFileUploading} isRejected={isRejected} />
    </FormGroup>
  );
};

const UploadFieldWrapper = ({ name, ariaLabel, maxFileBytes, isRequired, ...rest }: UploadFieldProps) => {
  const [{ value }] = useField<string>(name);

  if (rest.isDisabled) {
    return <TextArea aria-label={ariaLabel} name={name} value={value} {...rest} isDisabled />;
  }
  return (
    <UploadField name={name} ariaLabel={ariaLabel} maxFileBytes={maxFileBytes} isRequired={isRequired} {...rest} />
  );
};

export default UploadFieldWrapper;
