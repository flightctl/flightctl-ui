import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { useTranslation } from 'react-i18next';

interface DetailsNotFoundProps {
  kind: string;
  id: string;
}

const getKindTitle = (kind: string) => {
  switch (kind) {
    case 'Fleets':
      return 'fleet';
    case 'Devices':
      return 'device';
    case 'Repositories':
      return 'repository';
    case 'Enrollment requests':
      return 'Enrollment request';
    default:
      return kind.toLowerCase();
  }
};

const DetailsNotFound = ({ kind, id }: DetailsNotFoundProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tryAgain = () => {
    navigate('/refresh');
  };

  const kindTitle = getKindTitle(kind);

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText={`${getKindTitle(kind)} not found`}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>
          <Stack>
            <StackItem>
              We couldn&apos;t find the {kindTitle} with id <strong>{id}</strong>
            </StackItem>
            <StackItem>
              <small>This page will continue to attempt to fetch the details</small>
            </StackItem>
          </Stack>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="primary" onClick={() => navigate('/')}>
              {t('Take me home')}
            </Button>
          </EmptyStateActions>
          <EmptyStateActions>
            <Button variant="link" onClick={tryAgain}>
              {t('Try refreshing manually')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export default DetailsNotFound;
