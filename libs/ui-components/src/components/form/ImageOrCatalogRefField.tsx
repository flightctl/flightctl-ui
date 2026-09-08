import * as React from 'react';
import { useField } from 'formik';
import { TextInput, type TextInputProps } from '@patternfly/react-core';

import type { ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCatalogItemRef } from '../../utils/catalog';
import { useResolvedCatalogRef } from '../Catalog/useResolvedCatalogRef';
import { DefaultHelperText } from './FieldHelperText';

export interface ImageOrCatalogRefFieldProps extends TextInputProps {
  name: string;
  helperText?: React.ReactNode;
}

// Field for an OCI image or catalog item reference
// Currently the Form only allows editing the image field.
// If the value is set as a catalog item reference, the field is read-only.
const ImageOrCatalogRefField = ({ name, helperText, ...props }: ImageOrCatalogRefFieldProps) => {
  const { t } = useTranslation();
  const [field, meta, { setValue }] = useField<ImageOrCatalogItemRefSpec>({
    name,
  });

  const val = field.value;
  const catalogRef = val?.catalogItemRef;
  const fieldId = `textfield-${name}`;

  // Resolve the catalog item reference to get the image URI and the correct display value
  const hasCatalogRef = !!catalogRef;
  const resolved = useResolvedCatalogRef(catalogRef);

  const value = hasCatalogRef ? resolved?.imageUri : val?.image;
  const isReadOnly = props.isDisabled || hasCatalogRef;
  return (
    <>
      <TextInput
        {...field}
        {...props}
        value={value || ''}
        onChange={(_event, value) => void setValue({ image: value })}
        readOnlyVariant={isReadOnly ? 'default' : undefined}
        id={fieldId}
        data-testid={fieldId}
        validated={meta.touched && !!meta.error ? 'error' : 'default'}
      />
      <DefaultHelperText
        helperText={
          hasCatalogRef && isReadOnly
            ? t(
                'This image is defined by the Software Catalog ({{ catalogItemRef }}) and cannot be edited directly. To change the image, update the catalog item.',
                {
                  catalogItemRef: formatCatalogItemRef(catalogRef),
                },
              )
            : helperText
        }
      />
    </>
  );
};

export default ImageOrCatalogRefField;
