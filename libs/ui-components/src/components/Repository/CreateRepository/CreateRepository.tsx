import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  ExpandableSection,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { Repository, ResourceSync, ResourceSyncList } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { isPromiseFulfilled } from '../../../types/typeUtils';
import { RESOURCE, VERB } from '../../../types/rbac';
import { getErrorMessage } from '../../../utils/error';
import { commonQueries } from '../../../utils/query';
import PageWithPermissions from '../../common/PageWithPermissions';

import CreateRepositoryForm from './CreateRepositoryForm';

const CreateRepository = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { repositoryId } = useParams<{ repositoryId: string }>();

  const { get } = useFetch();
  const [repoError, setRepoError] = React.useState<string>();
  const [rsError, setRsError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(!!repositoryId);
  const [repositoryDetails, setRepositoryDetails] = React.useState<Repository>();
  const [resourceSyncs, setResourceSyncs] = React.useState<ResourceSync[]>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          get<Repository>(`repositories/${repositoryId}`),
          get<ResourceSyncList>(commonQueries.getResourceSyncsByRepo(repositoryId as string)),
        ]);

        if (isPromiseFulfilled(results[0])) {
          setRepositoryDetails(results[0].value);
          if (isPromiseFulfilled(results[1])) {
            setResourceSyncs(results[1].value.items);
          } else {
            setRsError(getErrorMessage(results[1].reason));
          }
        } else {
          setRepoError(getErrorMessage(results[0].reason));
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (repositoryId) {
      void fetchResources();
    }
  }, [get, repositoryId]);

  const reloadResourceSyncs = React.useCallback(() => {
    const reload = async () => {
      try {
        setIsLoading(true);

        const rsList = await get<ResourceSyncList>(commonQueries.getResourceSyncsByRepo(repositoryId as string));
        setResourceSyncs(rsList.items);
        setRsError(undefined);
      } catch (e) {
        setRsError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    };
    void reload();
  }, [get, repositoryId]);

  let content: React.ReactNode;

  if (repoError) {
    content = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        <div>
          {t('Failed to retrieve repository details')}:{repoError}
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
      <CreateRepositoryForm
        onClose={() => navigate(-1)}
        onSuccess={(repo) => navigate({ route: ROUTE.REPO_DETAILS, postfix: repo.metadata.name })}
        repository={repositoryDetails}
        resourceSyncs={resourceSyncs}
        options={{
          isReadOnly: !!rsError,
        }}
      />
    );
  }

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={ROUTE.REPOSITORIES}>{t('Repositories')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{repositoryId ? t('Edit repository') : t('Create repository')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {repositoryId ? t('Edit repository') : t('Create repository')}
          </Title>
        </StackItem>
        {rsError && (
          <Alert isInline variant="warning" title={t('Failed to retrieve the resource syncs')}>
            {t('The repository cannot be modified at the moment because some of its details could not be obtained.')}
            <Button variant="link" onClick={reloadResourceSyncs}>
              {t('Try again')}
            </Button>
            <ExpandableSection toggleText={t('Details')}>{rsError}</ExpandableSection>
          </Alert>
        )}
        <StackItem>{content}</StackItem>
      </Stack>
    </PageSection>
  );
};

const CreateRepositoryWithPermissions = () => {
  const [allowed, loading] = useAccessReview(RESOURCE.REPOSITORY, VERB.CREATE);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <CreateRepository />
    </PageWithPermissions>
  );
};

export default CreateRepositoryWithPermissions;
