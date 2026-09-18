import * as React from 'react';
import { Alert, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import CheckboxField from '../form/CheckboxField';
import CatalogApplicationNameField from './CatalogApplicationNameField';

export type CatalogConfigureFieldsProps = {
  requiresAdvancedConfig: boolean;
};

export const AdvancedConfigControl = ({ requiresAdvancedConfig }: { requiresAdvancedConfig: boolean }) => {
  const { t } = useTranslation();
  if (requiresAdvancedConfig) {
    return (
      <Alert isInline variant="info" title={t('Additional information required')}>
        {t(
          'This version needs required configuration before it can be added to the template. Continue to provide those values.',
        )}
      </Alert>
    );
  }
  return (
    <CheckboxField
      name="wantAdvancedConfig"
      label={t('Configure advanced settings')}
      description={t('Optionally override catalog defaults or provide additional settings for this application.')}
    />
  );
};

/** Shared name + optional advanced-settings controls for catalog configure steps. */
const CatalogDefinitionFields = ({
  requiresAdvancedConfig,
  children,
}: React.PropsWithChildren<CatalogConfigureFieldsProps>) => {
  return (
    <>
      <StackItem>
        <CatalogApplicationNameField />
      </StackItem>
      {children}
      <StackItem>
        <AdvancedConfigControl requiresAdvancedConfig={requiresAdvancedConfig} />
      </StackItem>
    </>
  );
};

export default CatalogDefinitionFields;
