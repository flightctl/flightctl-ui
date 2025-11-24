import * as React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { AuthProvider } from '@flightctl/types';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import AuthProviderDetailsTab from './AuthProviderDetailsTab';
import DeleteAuthProviderModal from './DeleteAuthProviderModal';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import { usePermissionsContext } from '../../common/PermissionsContext';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import NavItem from '../../NavItem/NavItem';

const authProviderDetailsPermissions = [
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.DELETE },
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.PATCH },
];

const AuthProviderDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { authProviderId } = useParams() as { authProviderId: string };
  const [authProviderDetails, isLoading, error, refetch] = useFetchPeriodically<Required<AuthProvider>>({
    endpoint: `authproviders/${authProviderId}`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    navigate(ROUTE.AUTH_PROVIDERS);
  };

  const { checkPermissions } = usePermissionsContext();
  const [canDelete, canEdit] = checkPermissions(authProviderDetailsPermissions);

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={authProviderId}
      title={authProviderDetails?.metadata.name as string}
      resourceLink={ROUTE.AUTH_PROVIDERS}
      resourceType="Authentication providers"
      resourceTypeLabel={t('Authentication providers')}
      actions={
        (canDelete || canEdit) && (
          <DetailsPageActions>
            <DropdownList>
              {canEdit && (
                <DropdownItem onClick={() => navigate({ route: ROUTE.AUTH_PROVIDER_EDIT, postfix: authProviderId })}>
                  {t('Edit authentication provider')}
                </DropdownItem>
              )}
              {canDelete && (
                <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>
                  {t('Delete authentication provider')}
                </DropdownItem>
              )}
            </DropdownList>
          </DetailsPageActions>
        )
      }
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            <NavItem to="yaml">{t('YAML')}</NavItem>
          </NavList>
        </Nav>
      }
    >
      {authProviderDetails && (
        <>
          <Routes>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<AuthProviderDetailsTab authProvider={authProviderDetails} />} />
            <Route path="yaml" element={<YamlEditor apiObj={authProviderDetails} refetch={refetch} />} />
          </Routes>
          {isDeleteModalOpen && (
            <DeleteAuthProviderModal
              onClose={() => setIsDeleteModalOpen(false)}
              onDeleteSuccess={onDeleteSuccess}
              authProviderId={authProviderId}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
};

const AuthProviderDetailsWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.AUTH_PROVIDER, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <AuthProviderDetails />
    </PageWithPermissions>
  );
};

export default AuthProviderDetailsWithPermissions;
