import * as React from 'react';
import { useFetch } from '../../hooks/useFetch';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ResourceSync } from '@flightctl/types';
import { Trans } from 'react-i18next';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { useAppContext } from '../../hooks/useAppContext';

const ResourceSyncToRepository = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { get } = useFetch();

  const [error, setError] = React.useState<string>();
  const {
    router: { useParams },
  } = useAppContext();
  const { rsId } = useParams() as { rsId: string };

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const rsDetails = await get<ResourceSync>(`resourcesyncs/${rsId}`);

        const repository = rsDetails.spec.repository;
        if (repository) {
          setError(undefined);
          navigate({ route: ROUTE.REPO_DETAILS, postfix: `${repository}#${rsId}` });
        } else {
          setError(t('Resource sync {{rsId}} is not linked to a repository', { rsId }));
        }
      } catch (e) {
        setError(t('Resource sync {{rsId}} could not be found', { rsId }));
      }
    };

    void fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, navigate, rsId]);

  return (
    <PageSection variant="light">
      <Title headingLevel="h1" size="3xl">
        {t('Resource sync {{rsId}}', { rsId })}
      </Title>
      {error ? (
        <EmptyState>
          <EmptyStateHeader>
            <Trans t={t}>
              Could not find the details for the resource sync <strong>{rsId}</strong>
            </Trans>
          </EmptyStateHeader>
          <EmptyStateBody>{error}</EmptyStateBody>
        </EmptyState>
      ) : (
        <Bullseye>
          <Spinner />
        </Bullseye>
      )}
    </PageSection>
  );
};

export default ResourceSyncToRepository;
