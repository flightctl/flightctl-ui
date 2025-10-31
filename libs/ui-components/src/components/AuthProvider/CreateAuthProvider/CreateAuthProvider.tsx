import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import { AuthProvider } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';
import { getErrorMessage } from '../../../utils/error';
import PageWithPermissions from '../../common/PageWithPermissions';

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
  } else {
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

  let title: string;
  if (!!authProviderDetails) {
    title = t('Edit authentication provider');
  } else {
    title = t('Add authentication provider');
  }

  return (
    <>
      <PageSection variant="light" type="breadcrumb">
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
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl">
          {title}
        </Title>
        <TextContent>
          <Text component={TextVariants.small}>
            {t("Set up how users will sign in and which organization they'll be assigned to.")}
          </Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} className="pf-v5-u-pt-0">
        {content}
      </PageSection>
    </>
  );
};

const CreateAuthProviderWithPermissions = () => {
  const {
    router: { useParams },
  } = useAppContext();
  const { authProviderId } = useParams<{ authProviderId: string }>();
  const [createAllowed, createLoading] = useAccessReview(RESOURCE.AUTH_PROVIDER, VERB.CREATE);
  const [patchAllowed, patchLoading] = useAccessReview(RESOURCE.AUTH_PROVIDER, VERB.PATCH);
  return (
    <PageWithPermissions
      allowed={authProviderId ? patchAllowed : createAllowed}
      loading={authProviderId ? patchLoading : createLoading}
    >
      <CreateAuthProvider authProviderId={authProviderId} />
    </PageWithPermissions>
  );
};

export default CreateAuthProviderWithPermissions;
