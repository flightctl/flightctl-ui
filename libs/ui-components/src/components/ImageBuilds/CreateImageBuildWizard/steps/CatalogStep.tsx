import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import ImagePromotionForm from '../../../ImagePromotion/ImagePromotionForm';
import { ImagePromotionFormValues } from '../../../ImagePromotion/types';
import FlightCtlForm from '../../../form/FlightCtlForm';
import CheckboxField from '../../../form/CheckboxField';
import { useTranslation } from '../../../../hooks/useTranslation';

export type CatalogStepValues = ImagePromotionFormValues & {
  promoteToCatalog: boolean;
};

export const catalogStepId = 'catalog';

export const isCatalogStepValid = (errors: FormikErrors<CatalogStepValues>) => {
  return !errors.name && !errors.catalog && !errors.new && !errors.existing;
};
const CatalogStep = ({ canPromote }: { canPromote: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<CatalogStepValues>();

  return (
    <Stack hasGutter>
      {!canPromote && (
        <StackItem>
          <Alert isInline variant="info" title={t('You do not have permissions to promote builds to the catalog')} />
        </StackItem>
      )}
      <StackItem>
        <FlightCtlForm>
          <CheckboxField
            name="promoteToCatalog"
            label={t('Add to the software catalog testing channel upon successful build')}
            isDisabled={!canPromote}
          />
        </FlightCtlForm>
      </StackItem>
      {canPromote && values.promoteToCatalog && (
        <StackItem>
          <ImagePromotionForm />
        </StackItem>
      )}
    </Stack>
  );
};

export default CatalogStep;
