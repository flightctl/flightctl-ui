import * as React from 'react';
import { Alert, Breadcrumb, BreadcrumbItem, Bullseye, PageSection, Spinner, Title } from '@patternfly/react-core';

import { AuthProvider } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import { ProviderType, isDynamicAuthProvider } from '../../../types/extraTypes';
import { getErrorMessage } from '../../../utils/error';
import PageWithPermissions from '../../common/PageWithPermissions';
import { usePermissionsContext } from '../../common/PermissionsContext';

import CreateAuthProviderForm from './CreateAuthProviderForm';

const CreateAuthProvider = ({ authProviderId }: { authProviderId: string | undefined }) => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(!!authProviderId);
  const [authProviderDetails, setAuthProviderDetails] = React.useState<AuthProvider>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchAuthProvider = async () => {
      setIsLoading(true);
      try {
        const provider = await get<AuthProvider>(`authproviders/${authProviderId}`);
        // API should not return non-dynamic providers, but we add the check for safety
        if (!isDynamicAuthProvider(provider)) {
          throw new Error('Authentication providers of type ' + provider.spec.providerType + ' cannot be modified');
        }
        setAuthProviderDetails(provider);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    };

    if (authProviderId) {
      void fetchAuthProvider();
    }
  }, [get, authProviderId]);

  let title: string | undefined;
  let content: React.ReactNode;

  if (error) {
    content = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        <div>
          {t('Failed to retrieve authentication provider details')}: {error}
        </div>
      </Alert>
    );
  } else if (isLoading) {
    content = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (authProviderDetails?.spec.providerType === ProviderType.OAuth2) {
    content = (
      <PageSection hasBodyWrapper={false}>
        <Alert isInline variant="danger" title={t('Not allowed')}>
          {t('OAuth2 providers can only be edited via the YAML editor')}
        </Alert>
      </PageSection>
    );
  } else {
    title = authProviderDetails ? t('Edit authentication provider') : t('Add authentication provider');
    content = (
      <CreateAuthProviderForm
        authProvider={authProviderDetails}
        onClose={() => navigate(ROUTE.AUTH_PROVIDERS)}
        onSuccess={(authProvider) =>
          navigate({ route: ROUTE.AUTH_PROVIDER_DETAILS, postfix: authProvider.metadata.name })
        }
      />
    );
  }

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.AUTH_PROVIDERS}>{t('Authentication providers')}</Link>
          </BreadcrumbItem>
          {authProviderId && (
            <BreadcrumbItem>
              <Link to={{ route: ROUTE.AUTH_PROVIDER_DETAILS, postfix: authProviderId }}>{authProviderId}</Link>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem isActive>{title}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      {title && (
        <PageSection hasBodyWrapper={false}>
          <Title headingLevel="h1" size="3xl">
            {title}
          </Title>
        </PageSection>
      )}
      <PageSection hasBodyWrapper={false}>{content}</PageSection>
    </>
  );
};

const createAuthProviderPermissions = [
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.CREATE },
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.PATCH },
];

const CreateAuthProviderWithPermissions = () => {
  const {
    router: { useParams },
  } = useAppContext();
  const { authProviderId } = useParams<{ authProviderId: string }>();
  const { checkPermissions, loading } = usePermissionsContext();
  const [createAllowed, patchAllowed] = checkPermissions(createAuthProviderPermissions);
  return (
    <PageWithPermissions allowed={authProviderId ? patchAllowed : createAllowed} loading={loading}>
      <CreateAuthProvider authProviderId={authProviderId} />
    </PageWithPermissions>
  );
};

export default CreateAuthProviderWithPermissions;
