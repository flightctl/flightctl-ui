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
  if (file.type) {
    return ACCEPTED_MIME_TYPES.includes(file.type);
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
  // PatternFly does not cancel in-flight FileReaders. Each accepted read gets an id so that
  // a subsequent selection does not affect in-flight completions / rejections.
  const selectionIdRef = React.useRef(0);
  const readIdByFileRef = React.useRef(new WeakMap<File, number>());
  const completedReadIdRef = React.useRef<number | null>(null);
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

  const invalidateInFlightReads = React.useCallback(() => {
    selectionIdRef.current += 1;
    completedReadIdRef.current = null;
    setIsLoading(false);
  }, []);

  const applyRejection = React.useCallback(() => {
    invalidateInFlightReads();
    isRejectedRef.current = true;
    setIsRejected(true);
    setError(rejectedFileMsg);
    void setTouched(true, false);
  }, [invalidateInFlightReads, rejectedFileMsg, setError, setTouched]);

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
          // PF calls onReadFinished then onDataChange for the same read; use the id captured there.
          if (completedReadIdRef.current !== selectionIdRef.current) {
            return;
          }
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
        onReadStarted={(_event, file) => {
          const readId = ++selectionIdRef.current;
          readIdByFileRef.current.set(file, readId);
          setIsLoading(true);
        }}
        onReadFinished={(_event, file) => {
          const readId = readIdByFileRef.current.get(file) ?? null;
          completedReadIdRef.current = readId;
          if (readId === selectionIdRef.current) {
            setIsLoading(false);
          }
        }}
        onClearClick={() => {
          invalidateInFlightReads();
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
