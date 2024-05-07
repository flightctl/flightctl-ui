import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
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

import { isPromiseRejected } from '../../../types/typeUtils';
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
  const [errors, setErrors] = React.useState<string[]>();
  const [isLoading, setIsLoading] = React.useState(!!repositoryId);
  const [repositoryDetails, setRepositoryDetails] = React.useState<Repository>();
  const [resourceSyncs, setResourceSyncs] = React.useState<ResourceSync[]>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          await get<Repository>(`repositories/${repositoryId}`),
          await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`),
        ]);

        const rejectedPromises = results.filter(isPromiseRejected);
        if (rejectedPromises.length === 0) {
          setRepositoryDetails((results[0] as PromiseFulfilledResult<Repository>).value);
          setResourceSyncs((results[1] as PromiseFulfilledResult<ResourceSyncList>).value.items);
        } else {
          const errors: string[] = [];
          if (isPromiseRejected(results[0])) {
            errors.push(`${t('Failed to fetch repository')} ${getErrorMessage(results[0].reason)}}`);
          }
          if (isPromiseRejected(results[1])) {
            errors.push(`${t('Failed to fetch resource syncs')} ${getErrorMessage(results[1].reason)}}`);
          }
          setErrors(errors);
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

  if (errors?.length) {
    content = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {errors.map((e, index) => (
          <div key={index}>{e}</div>
        ))}
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
        <StackItem>{content}</StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateRepository;
