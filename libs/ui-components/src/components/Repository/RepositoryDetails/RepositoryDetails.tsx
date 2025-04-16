import * as React from 'react';
import { Card, CardBody, DropdownItem, DropdownList, Grid, GridItem } from '@patternfly/react-core';

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
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import EventsCard from '../../Events/EventsCard';

const RepositoryDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    navigate(ROUTE.REPOSITORIES);
  };

  const [canDelete] = useAccessReview(RESOURCE.REPOSITORY, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.REPOSITORY, VERB.PATCH);
  const [canListRS] = useAccessReview(RESOURCE.RESOURCE_SYNC, VERB.LIST);

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
    >
      {repoDetails && (
        <>
          <Grid hasGutter>
            <GridItem md={9}>
              <Card>
                <CardBody>
                  <RepositoryGeneralDetailsCard repoDetails={repoDetails} />
                </CardBody>
              </Card>
              {canListRS && repoDetails.spec.type !== RepoSpecType.HTTP && (
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
  const [allowed, loading] = useAccessReview(RESOURCE.REPOSITORY, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <RepositoryDetails />
    </PageWithPermissions>
  );
};

export default RepositoryDetailsWithPermissions;
