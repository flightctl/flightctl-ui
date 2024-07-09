import * as React from 'react';
import { FieldMetaProps } from 'formik';

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

export const DefaultHelperText = ({ helperText }: DefaultHelperTextProps) => {
  return helperText ? (
    <FormHelperText>
      <HelperText>
        <HelperTextItem variant="default">{helperText}</HelperTextItem>
      </HelperText>
    </FormHelperText>
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
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {content}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  ) : null;
};

export default ErrorHelperText;
