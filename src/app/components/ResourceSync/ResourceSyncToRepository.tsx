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

const ResourceSyncToRepository = () => {
  const navigate = useNavigate();
  const { get } = useFetch();

  const [error, setError] = React.useState<string>();
  const { rsId } = useParams() as { rsId: string };

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const rsDetails = await get(`resourcesyncs/${rsId}`);

        const repository = rsDetails.spec?.repository;
        if (repository) {
          setError(undefined);
          navigate(`/administration/repositories/${repository}/resourcesyncs#${rsId}`);
        } else {
          setError(`Resourcesync ${rsId} is not linked to a repository`);
        }
      } catch (e) {
        setError(`Resourcesync ${rsId} could not be found`);
      }
    };

    void fetchDetails();
  }, [get, navigate, rsId]);

  return (
    <PageSection variant="light">
      <Title headingLevel="h1" size="3xl">
        Resource sync {rsId}
      </Title>
      {error ? (
        <EmptyState>
          <EmptyStateHeader>
            Could not find the details for the resourcesync <strong>{rsId}</strong>
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
