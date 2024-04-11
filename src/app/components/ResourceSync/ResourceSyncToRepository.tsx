import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '@app/hooks/useFetch';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ResourceSync } from '@types';
import { Trans, useTranslation } from 'react-i18next';

const ResourceSyncToRepository = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { get } = useFetch();

  const [error, setError] = React.useState<string>();
  const { rsId } = useParams() as { rsId: string };

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const rsDetails = await get<ResourceSync>(`resourcesyncs/${rsId}`);

        const repository = rsDetails.spec.repository;
        if (repository) {
          setError(undefined);
          navigate(`/devicemanagement/repositories/${repository}/resourcesyncs#${rsId}`);
        } else {
          setError(t('Resourcesync {{rsId}} is not linked to a repository', { rsId }));
        }
      } catch (e) {
        setError(t('Resourcesync {{rsId}} could not be found', { rsId }));
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
              Could not find the details for the resourcesync <strong>{rsId}</strong>
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
