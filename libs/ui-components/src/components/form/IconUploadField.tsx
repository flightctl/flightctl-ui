import * as React from 'react';
import { useField } from 'formik';
import { FileUpload, FormGroup, TextInput } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import ErrorHelperText from './FieldHelperText';

const MAX_ICON_BYTES = 256 * 1024;
const ACCEPTED_IMAGE_TYPES = {
  'image/svg+xml': ['.svg'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

type IconUploadFieldProps = {
  name: string;
  isDisabled?: boolean;
};

const IconUploadField = ({ name, isDisabled }: IconUploadFieldProps) => {
  const { t } = useTranslation();
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [field, meta, { setValue, setTouched }] = useField<string>(name);

  const fieldId = `iconuploadfield-${name}`;
  const hasError = meta.touched && !!meta.error;
  const hasValue = !!field.value;

  if (isDisabled) {
    return (
      <FormGroup fieldId={fieldId}>
        {hasValue ? (
          <img src={field.value} alt="" style={{ maxHeight: 64, maxWidth: 64, objectFit: 'contain' }} />
        ) : (
          <TextInput id={fieldId} name={name} value={field.value} aria-label={t('Icon')} isDisabled />
        )}
      </FormGroup>
    );
  }

  return (
    <FormGroup fieldId={fieldId}>
      <FileUpload
        id={fieldId}
        type="dataURL"
        value={field.value}
        filename={filename}
        filenamePlaceholder={t('Drag an image or browse to upload')}
        browseButtonText={t('Browse...')}
        clearButtonText={t('Clear')}
        isLoading={isLoading}
        validated={isRejected || hasError ? 'error' : 'default'}
        hideDefaultPreview
        onDataChange={(_event, data) => {
          void setValue(data, true);
          void setTouched(true);
          setIsRejected(false);
        }}
        onFileInputChange={(_event, file) => {
          setFilename(file.name);
          setIsRejected(false);
        }}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        onClearClick={() => {
          setFilename('');
          void setValue('', true);
          void setTouched(true);
          setIsRejected(false);
        }}
        dropzoneProps={{
          accept: ACCEPTED_IMAGE_TYPES,
          maxSize: MAX_ICON_BYTES,
          onDropRejected: () => setIsRejected(true),
        }}
      >
        {hasValue && <img src={field.value} alt="" style={{ maxHeight: 64, maxWidth: 64, objectFit: 'contain' }} />}
      </FileUpload>
      {isRejected && <ErrorHelperText error={t('File must be an image under 256 KB.')} />}
      <ErrorHelperText meta={meta} />
    </FormGroup>
  );
};

export default IconUploadField;
