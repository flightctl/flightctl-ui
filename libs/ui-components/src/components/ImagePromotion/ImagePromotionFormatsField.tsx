import * as React from 'react';
import { Button, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import type { ExportFormatType } from '@flightctl/types/imagebuilder';
import type { ImagePromotionFormValues } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { getExportFormatLabel } from '../../utils/imageBuilds';

type ImagePromotionFormatsFieldProps = {
  isEdit?: boolean;
  canAmendExportFormats: boolean;
  availableFormats?: ExportFormatType[];
};

const ImagePromotionFormatsField = ({
  isEdit,
  canAmendExportFormats,
  availableFormats,
}: ImagePromotionFormatsFieldProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ImagePromotionFormValues>();

  const hasExports = availableFormats?.length || values.exportFormats.length;
  const extraFormats = availableFormats?.filter((f) => !values.exportFormats.includes(f)) || [];
  const emptyFormatsMessage = isEdit ? t('No additional formats') : t('No formats selected');

  return (
    <FormGroup label={t('Formats')}>
      {hasExports ? (
        <Stack>
          <StackItem>{values.exportFormats.map((format) => getExportFormatLabel(t, format)).join(', ')}</StackItem>
          {extraFormats?.map((f) => {
            const isIncluded = values.additionalExportFormats?.includes(f);
            const exportLabel = getExportFormatLabel(t, f);
            return (
              <StackItem key={f}>
                <Button
                  isInline
                  variant="link"
                  isDisabled={isEdit && !canAmendExportFormats}
                  onClick={() => {
                    const newFormats = isIncluded
                      ? values.additionalExportFormats?.filter((format) => format !== f)
                      : [...(values.additionalExportFormats || []), f];
                    setFieldValue('additionalExportFormats', newFormats);
                  }}
                >
                  {isIncluded
                    ? t('Remove {{ exportLabel }}', { exportLabel })
                    : t('Add {{ exportLabel }}', { exportLabel })}
                </Button>
              </StackItem>
            );
          })}
        </Stack>
      ) : (
        emptyFormatsMessage
      )}
    </FormGroup>
  );
};

export default ImagePromotionFormatsField;
