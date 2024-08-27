import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  ExpandableSection,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';

import CreateRepositoryForm from './CreateRepositoryForm';

import { isPromiseFulfilled } from '../../../types/typeUtils';
import { Repository, ResourceSync, ResourceSyncList } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';

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
          get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`),
        ]);

        if (isPromiseFulfilled(results[0])) {
          setRepositoryDetails(results[0].value);
          if (isPromiseFulfilled(results[1])) {
            setResourceSyncs(results[1].value.items);
          } else {
            setRsError(`${t('Failed to fetch resource syncs')} ${getErrorMessage(results[1].reason)}}`);
          }
        } else {
          setRepoError(`${t('Failed to fetch repository')} ${getErrorMessage(results[0].reason)}}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (repositoryId) {
      void fetchResources();
    }
  }, [get, repositoryId, t]);

  let content;

  if (repoError) {
    content = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        <div>{repoError}</div>
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
          canUseResourceSyncs: !rsError,
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
            {t(
              'We could not verify if this repository contains resource syncs. Changes to resource syncs are not available at the moment for this reason.',
            )}
            <ExpandableSection toggleText={t('Details')}>{rsError}</ExpandableSection>
          </Alert>
        )}
        <StackItem>{content}</StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateRepository;
