import * as React from 'react';
import { type FieldMetaProps } from 'formik';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

type ErrorHelperTextProps = {
  meta?: FieldMetaProps<unknown>;
  touchRequired?: boolean;
  error?: React.ReactNode;
};

type DefaultHelperTextProps = {
  helperText: React.ReactNode;
};

const FlightCtlHelperText = ({ children }: React.PropsWithChildren) => (
  <FormHelperText className="pf-v6-u-mt-xs">
    <HelperText>{children}</HelperText>
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
  let content: React.ReactNode;
  if (meta) {
    content = !touchRequired || meta.touched ? meta.error : undefined;
  } else {
    content = error;
  }
  return content ? (
    <FlightCtlHelperText>
      <HelperTextItem variant="error" icon={<ExclamationCircleIcon />}>
        {content}
      </HelperTextItem>
    </FlightCtlHelperText>
  ) : null;
};

export default ErrorHelperText;
