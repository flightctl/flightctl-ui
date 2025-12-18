import * as React from 'react';
import { Card, CardBody, DropdownItem, DropdownList, Grid, GridItem, Nav, NavList } from '@patternfly/react-core';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { RepoSpecType, Repository, ResourceKind } from '@flightctl/types';

import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import RepositoryGeneralDetailsCard from './RepositoryGeneralDetailsCard';
import RepositoryResourceSyncsCard from './RepositoryResourceSyncsCard';
import DeleteRepositoryModal from './DeleteRepositoryModal';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import EventsCard from '../../Events/EventsCard';
import NavItem from '../../NavItem/NavItem';

const repositoryDetailsPermissions = [
  { kind: RESOURCE.REPOSITORY, verb: VERB.DELETE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.PATCH },
  { kind: RESOURCE.RESOURCE_SYNC, verb: VERB.LIST },
];
const RepositoryDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error, refetch] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    navigate(ROUTE.REPOSITORIES);
  };

  const { checkPermissions } = usePermissionsContext();
  const [canDelete, canEdit, canListRS] = checkPermissions(repositoryDetailsPermissions);

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={repositoryId}
      title={repoDetails?.metadata.name as string}
      resourceLink={ROUTE.REPOSITORIES}
      resourceType="Repositories"
      resourceTypeLabel={t('Repositories')}
      actions={
        (canDelete || canEdit) && (
          <DetailsPageActions>
            <DropdownList>
              {canEdit && (
                <DropdownItem onClick={() => navigate({ route: ROUTE.REPO_EDIT, postfix: repositoryId })}>
                  {t('Edit repository')}
                </DropdownItem>
              )}
              {canDelete && (
                <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>{t('Delete repository')}</DropdownItem>
              )}
            </DropdownList>
          </DetailsPageActions>
        )
      }
      nav={
        <Nav variant="horizontal-subnav">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            <NavItem to="yaml">{t('YAML')}</NavItem>
          </NavList>
        </Nav>
      }
    >
      {repoDetails && (
        <>
          <Routes>
            <Route index element={<Navigate to="details" replace />} />

            <Route
              path="details"
              element={
                <Grid hasGutter>
                  <GridItem md={9}>
                    <Card>
                      <CardBody>
                        <RepositoryGeneralDetailsCard repoDetails={repoDetails} />
                      </CardBody>
                    </Card>
                    {canListRS && repoDetails.spec.type === RepoSpecType.GIT && (
                      <Card>
                        <CardBody>
                          <RepositoryResourceSyncsCard repositoryId={repositoryId} />
                        </CardBody>
                      </Card>
                    )}
                  </GridItem>
                  <GridItem md={3}>
                    <EventsCard kind={ResourceKind.REPOSITORY} objId={repositoryId} />
                  </GridItem>
                </Grid>
              }
            />
            <Route path="yaml" element={<YamlEditor apiObj={repoDetails} refetch={refetch} canEdit={canEdit} />} />
          </Routes>
          {isDeleteModalOpen && (
            <DeleteRepositoryModal
              onClose={() => setIsDeleteModalOpen(false)}
              onDeleteSuccess={onDeleteSuccess}
              repositoryId={repositoryId}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
};

const RepositoryDetailsWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <RepositoryDetails />
    </PageWithPermissions>
  );
};

export default RepositoryDetailsWithPermissions;
