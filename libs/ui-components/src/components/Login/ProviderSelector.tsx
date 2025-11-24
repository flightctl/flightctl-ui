import * as React from 'react';
import { Button, Card, CardBody, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';

import { AuthProvider } from '@flightctl/types';
import fcLogo from '@fctl-assets/bgimages/flight-control-logo.svg';
import rhemLogo from '@fctl-assets/bgimages/RHEM-logo.svg';

import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
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
  const { settings } = useAppContext();

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
    <>
      <Card isLarge>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <img
                src={settings.isRHEM ? (rhemLogo as string) : (fcLogo as string)}
                alt={settings.isRHEM ? 'Red Hat Edge Manager' : 'Flight Control'}
              />
            </StackItem>

            <StackItem>
              <CardTitle>
                <Title headingLevel="h2" size="lg">
                  {t('Choose login method')}
                </Title>
              </CardTitle>
            </StackItem>

            <StackItem>
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
            </StackItem>
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};

export default ProviderSelector;
