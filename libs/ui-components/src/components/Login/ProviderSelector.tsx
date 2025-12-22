import * as React from 'react';
import { Button, Stack, StackItem } from '@patternfly/react-core';

import { AuthProvider } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { isOAuth2Provider } from '../AuthProvider/CreateAuthProvider/types';
import { getProviderDisplayName } from '../../utils/authProvider';
import { DynamicAuthProviderSpec } from '../../types/extraTypes';

type ProviderSelectorProps = {
  providers: AuthProvider[];
  defaultProviderName: string;
  onProviderSelect: (provider: AuthProvider) => void;
  disabled?: boolean;
};

// Returns a unique key for a provider.
// Theoretically there could be multiple providers with the same name across different organizations.
const getProviderKey = (provider: AuthProvider): string => {
  const name = provider.metadata.name as string;
  const issuerUrl = 'issuer' in provider.spec ? provider.spec.issuer : 'issuer';
  const clientId = 'clientId' in provider.spec ? provider.spec.clientId : 'clientId';
  return `${name}-${issuerUrl}-${clientId}`;
};

const ProviderSelector = ({
  providers,
  defaultProviderName,
  onProviderSelect,
  disabled = false,
}: ProviderSelectorProps) => {
  const { t } = useTranslation();

  const duplicateProviderNames = React.useMemo(() => {
    // Record of provider names and display names that are duplicates
    const result: Record<string, boolean> = {};

    providers.forEach((provider) => {
      const displayName = getProviderDisplayName(provider, t) || (provider.metadata.name as string);
      if (result[displayName] === undefined) {
        result[displayName] = false;
      } else {
        result[displayName] = true;
      }
    });

    return result;
  }, [providers, t]);

  return (
    <Stack hasGutter>
      {providers.map((provider) => {
        const displayName = getProviderDisplayName(provider, t);

        const isDuplicateName = duplicateProviderNames[displayName];
        let details: string | undefined;
        if (isDuplicateName) {
          const spec = provider.spec as DynamicAuthProviderSpec;
          if (isOAuth2Provider(spec)) {
            details = spec.authorizationUrl || spec.clientId || '';
          } else {
            details = spec.issuer || spec.clientId || '';
          }
        }
        return (
          <StackItem key={getProviderKey(provider)}>
            <Button
              variant={defaultProviderName === provider.metadata.name ? 'primary' : 'secondary'}
              isBlock
              size="lg"
              onClick={() => onProviderSelect(provider)}
              isDisabled={disabled}
            >
              {t('Log in with {{ providerName }}', { providerName: getProviderDisplayName(provider, t) })}
            </Button>
            {isDuplicateName && <small>{details}</small>}
          </StackItem>
        );
      })}
    </Stack>
  );
};

export default ProviderSelector;
