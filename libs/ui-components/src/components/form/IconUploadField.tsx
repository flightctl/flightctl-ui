import * as React from 'react';
import { useField } from 'formik';
import { FileUpload, FormGroup, TextInput } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

const MAX_ICON_BYTES = 256 * 1024;
const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  'image/svg+xml': ['.svg'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_IMAGE_TYPES);
const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_IMAGE_TYPES).flat();

const isAcceptedIconFile = (file: File): boolean => {
  if (file.size > MAX_ICON_BYTES) {
    return false;
  }
  if (file.type && ACCEPTED_MIME_TYPES.includes(file.type)) {
    return true;
  }
  const nameLower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
};

type IconUploadFieldProps = {
  name: string;
  isDisabled?: boolean;
};

const IconUploadField = ({ name, isDisabled }: IconUploadFieldProps) => {
  const { t } = useTranslation();
  const rejectedFileMsg = t(
    'The provided icon file is invalid. Please upload a valid SVG, PNG, JPEG, or WebP image under 256 KB.',
  );
  const isRejectedRef = React.useRef(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [field, meta, { setValue, setTouched, setError }] = useField<string>({
    name,
    validate: () => (isRejectedRef.current ? rejectedFileMsg : undefined),
  });

  const hasError = meta.touched && !!meta.error;
  const hasValue = !!field.value;
  const fieldId = `iconuploadfield-${name}`;

  const applyRejection = React.useCallback(() => {
    isRejectedRef.current = true;
    setIsRejected(true);
    setError(rejectedFileMsg);
    void setTouched(true, false);
  }, [rejectedFileMsg, setError, setTouched]);

  const clearRejection = React.useCallback(() => {
    isRejectedRef.current = false;
    setIsRejected(false);
    setError(undefined);
  }, [setError]);

  // Schema validation can wipe a manual setError; re-apply while still rejected (see NameField).
  React.useEffect(() => {
    if (isRejectedRef.current && !meta.error) {
      setError(rejectedFileMsg);
    }
  }, [meta.error, rejectedFileMsg, setError]);

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
        // Default PF rule is !filename && !value; keep Clear available after a rejection.
        isClearButtonDisabled={!filename && !hasValue && !isRejected}
        isLoading={isLoading}
        validated={isRejected || hasError ? 'error' : 'default'}
        hideDefaultPreview
        onDataChange={(_event, data) => {
          clearRejection();
          void setValue(data, true);
          void setTouched(true);
        }}
        onFileInputChange={(_event, file) => {
          // "onFileInputChange" triggers after "onDropRejected" for browse action, rejection must be kept.
          if (isAcceptedIconFile(file)) {
            setFilename(file.name);
            clearRejection();
          } else {
            applyRejection();
          }
        }}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        onClearClick={() => {
          setFilename('');
          clearRejection();
          void setValue('', true);
          void setTouched(true);
        }}
        dropzoneProps={{
          accept: ACCEPTED_IMAGE_TYPES,
          maxSize: MAX_ICON_BYTES,
          validator: (file) =>
            isAcceptedIconFile(file) ? null : { message: rejectedFileMsg, code: 'file-invalid-type' },
          onDropRejected: (rejections) => {
            const rejectedName = rejections[0]?.file?.name;
            if (rejectedName) {
              setFilename(rejectedName);
            }
            applyRejection();
          },
        }}
      >
        {hasValue && <img src={field.value} alt="" style={{ maxHeight: 64, maxWidth: 64, objectFit: 'contain' }} />}
      </FileUpload>
      <DefaultHelperText helperText={t('File must be an SVG, PNG, JPEG, or WebP image under 256 KB')} />
      {(isRejected || hasError) && (
        <ErrorHelperText error={typeof meta.error === 'string' ? meta.error : rejectedFileMsg} />
      )}
    </FormGroup>
  );
};

export default IconUploadField;
