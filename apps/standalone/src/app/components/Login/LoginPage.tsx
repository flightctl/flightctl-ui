import * as React from 'react';
import { Alert, Bullseye, Spinner } from '@patternfly/react-core';

import { AuthConfig, AuthProvider } from '@flightctl/types';
import { ProviderType } from '@flightctl/ui-components/src/types/extraTypes';
import ProviderSelector from '@flightctl/ui-components/src/components/Login/ProviderSelector';
import TokenLoginForm from '@flightctl/ui-components/src/components/Login/TokenLoginForm';
import { useFetch } from '@flightctl/ui-components/src/hooks/useFetch';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { getProviderDisplayName } from '@flightctl/ui-components/src/utils/authProvider';

import LoginPageLayout from './LoginPageLayout';
import { loginAPI } from '../../utils/apiCalls';

const redirectToProviderLogin = async (provider: AuthProvider) => {
  const response = await fetch(`${loginAPI}?provider=${provider.metadata.name}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Login redirect failed with status ${response.status}`);
  }

  const { url } = (await response.json()) as { url?: string };
  if (!url) {
    throw new Error('Login redirect URL missing in response');
  }
  window.location.href = url;
};

const LoginPage = () => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [providers, setProviders] = React.useState<AuthProvider[]>([]);
  const [userSelectedProvider, setUserSelectedProvider] = React.useState<AuthProvider | null>(null);
  const [defaultProviderName, setDefaultProviderName] = React.useState<string>('');
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const handleProviderSelect = async (provider: AuthProvider) => {
    // Prevent multiple clicks while redirect is in progress
    if (isRedirecting) {
      return;
    }

    setUserSelectedProvider(provider);

    // For k8s token providers, we will show the TokenLoginForm.
    // For other providers, we will redirect to their OAuth flow.
    if (provider.spec.providerType !== ProviderType.K8s) {
      setIsRedirecting(true);
      try {
        await redirectToProviderLogin(provider);
      } catch (err) {
        setIsRedirecting(false);
        setUserSelectedProvider(null);
        setError(
          t('Failed to initiate login with {{ providerName}} ', {
            providerName: getProviderDisplayName(provider, t) || (provider.metadata.name as string),
          }),
        );
      }
    }
  };

  React.useEffect(() => {
    const loadAuthConfig = async () => {
      try {
        const config = await get<AuthConfig>('auth/config');
        const providers = (config?.providers || [])
          .filter((provider) => provider.spec.enabled !== false)
          .sort((a, b) => {
            if (a.metadata.name === config.defaultProvider) {
              return -1;
            }
            if (b.metadata.name === config.defaultProvider) {
              return 1;
            }
            return 0;
          });
        if (providers.length > 0) {
          setProviders(providers);
          setDefaultProviderName(config.defaultProvider || '');
          if (providers.length === 1 && providers[0].spec.providerType !== ProviderType.K8s) {
            setIsRedirecting(true);
            try {
              await redirectToProviderLogin(providers[0]);
            } catch (err) {
              setIsRedirecting(false);
              setError(t('Failed to initiate login'));
            }
          }
        } else {
          setError(t('No authentication providers found. Please contact your administrator.'));
        }
      } catch (err) {
        setError(t('Failed to load the authentication providers'));
      } finally {
        setLoading(false);
      }
    };

    void loadAuthConfig();
    // Prevent the UI going to a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <Bullseye>
        <Alert variant="danger" title="Error" isInline>
          {error}
        </Alert>
      </Bullseye>
    );
  }

  const selectedProvider = userSelectedProvider || (providers.length === 1 ? providers[0] : null);
  if (selectedProvider?.spec.providerType === ProviderType.K8s) {
    return (
      <TokenLoginForm
        provider={selectedProvider}
        onBack={
          userSelectedProvider
            ? () => {
                setUserSelectedProvider(null);
              }
            : undefined
        }
      />
    );
  }

  if (selectedProvider) {
    return (
      <>
        {t('Redirecting to login for {{ provider }}...', {
          provider: getProviderDisplayName(selectedProvider, t) || selectedProvider.metadata.name,
        })}
        <Spinner size="lg" />
      </>
    );
  }

  return (
    <LoginPageLayout>
      <ProviderSelector
        providers={providers}
        defaultProviderName={defaultProviderName}
        onProviderSelect={handleProviderSelect}
        disabled={isRedirecting}
      />
    </LoginPageLayout>
  );
};

export default LoginPage;
