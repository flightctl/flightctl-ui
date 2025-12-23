import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { TFunction } from 'i18next';
import { CubesIcon } from '@patternfly/react-icons/dist/js/icons/cubes-icon';

import ListPageBody from '../ListPage/ListPageBody';
import Table, { ApiSortTableColumn } from '../Table/Table';
import { useTranslation } from '../../hooks/useTranslation';
import AuthProviderRow from './AuthProviderRow';
import { useAuthProviders } from './useAuthProviders';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import PageWithPermissions from '../common/PageWithPermissions';
import { usePermissionsContext } from '../common/PermissionsContext';
import { RESOURCE, VERB } from '../../types/rbac';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import DeleteAuthProviderModal from './AuthProviderDetails/DeleteAuthProviderModal';

const getColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Name'),
  },
  {
    name: t('Display name'),
  },
  {
    name: t('Type'),
  },
  {
    name: t('Issuer/Authorization URL'),
  },
  {
    name: t('Status'),
  },
];

const CreateAuthProviderButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canCreate] = checkPermissions([{ kind: RESOURCE.AUTH_PROVIDER, verb: VERB.CREATE }]);

  return (
    canCreate && (
      <Button variant="primary" onClick={() => navigate(ROUTE.AUTH_PROVIDER_CREATE)}>
        {t('Add authentication provider')}
      </Button>
    )
  );
};

const AuthProviderEmptyState = () => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={CubesIcon} titleText={t('Add your first authentication providers')}>
      <EmptyStateBody>
        {t('Connect OIDC and OAuth2 providers to enable additional secure authentication options for your users.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <CreateAuthProviderButton />
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

const AuthProvidersTable = () => {
  const { t } = useTranslation();

  const providerColumns = React.useMemo(() => getColumns(t), [t]);
  const { providers, isLoading, error, isUpdating, refetch } = useAuthProviders();
  const [deleteModalProviderId, setDeleteModalProviderId] = React.useState<string>();

  return (
    <ListPageBody error={error} loading={isLoading}>
      <Table
        aria-label={t('Authentication providers list')}
        loading={isUpdating}
        columns={providerColumns}
        emptyData={providers.length === 0}
      >
        <Tbody>
          {providers.map((provider) => {
            const providerId = provider.metadata.name as string;
            return (
              <AuthProviderRow
                key={providerId}
                provider={provider}
                onDeleteClick={() => {
                  setDeleteModalProviderId(providerId);
                }}
              />
            );
          })}
        </Tbody>
      </Table>
      {!isUpdating && providers.length === 0 && <AuthProviderEmptyState />}
      {deleteModalProviderId && (
        <DeleteAuthProviderModal
          authProviderId={deleteModalProviderId}
          onClose={() => setDeleteModalProviderId(undefined)}
          onDeleteSuccess={() => {
            setDeleteModalProviderId(undefined);
            refetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

const AuthProvidersPage = () => {
  const { t } = useTranslation();

  const { checkPermissions, loading } = usePermissionsContext();
  const [canList] = checkPermissions([{ kind: RESOURCE.AUTH_PROVIDER, verb: VERB.LIST }]);
  const navigate = useNavigate();

  return (
    <PageWithPermissions allowed={canList} loading={loading}>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="3xl">
              {t('Authentication')}
            </Title>
            <Content component={ContentVariants.small}>{t('Manage authentication providers')}</Content>
          </StackItem>
          <StackItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Title headingLevel="h2" size="lg">
                    {t('Authentication providers')}
                  </Title>
                </ToolbarItem>
                <ToolbarItem variant="separator" />
                <ToolbarItem>
                  <Button variant="primary" onClick={() => navigate(ROUTE.AUTH_PROVIDER_CREATE)}>
                    {t('Add authentication provider')}
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </StackItem>
          <AuthProvidersTable />
        </Stack>
      </PageSection>
    </PageWithPermissions>
  );
};

export default AuthProvidersPage;
