import * as React from 'react';
import { type FieldMetaProps } from 'formik';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useTranslation } from '../../hooks/useTranslation';

type ErrorHelperTextProps = {
  meta?: FieldMetaProps<unknown>;
  touchRequired?: boolean;
  error?: React.ReactNode;
};

type DefaultHelperTextProps = {
  helperText: React.ReactNode;
};

const FlightCtlHelperText = ({
  isLiveRegion = false,
  children,
}: React.PropsWithChildren<{ isLiveRegion?: boolean }>) => (
  <FormHelperText className="pf-v6-u-mt-xs">
    <HelperText isLiveRegion={isLiveRegion}>{children}</HelperText>
  </FormHelperText>
);

export const DefaultHelperText = ({ helperText }: DefaultHelperTextProps) => {
  return helperText ? (
    <FlightCtlHelperText>
      <HelperTextItem variant="default">{helperText}</HelperTextItem>
    </FlightCtlHelperText>
  ) : null;
};

const ErrorHelperText = ({ meta, error, touchRequired = true }: ErrorHelperTextProps) => {
  const { t } = useTranslation();
  let content: React.ReactNode;
  if (meta) {
    content = !touchRequired || meta.touched ? meta.error : undefined;
  } else {
    content = error;
  }
  return content ? (
    <FlightCtlHelperText isLiveRegion>
      <HelperTextItem variant="error" icon={<ExclamationCircleIcon />} screenReaderText={t('Validation error')}>
        {content}
      </HelperTextItem>
    </FlightCtlHelperText>
  ) : null;
};

export default ErrorHelperText;
