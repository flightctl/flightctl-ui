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
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { Trans, useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';

interface DetailsNotFoundProps {
  kind: string;
  id: string;
}

const getKindMsgs = (t: TFunction, kind: string, id: string) => {
  switch (kind) {
    case 'Fleets':
      return {
        title: t('Fleet not found'),
        msg: (
          <Trans t={t}>
            We could not find the fleet with id <strong>{id}</strong>
          </Trans>
        ),
      };
    case 'Devices':
      return {
        title: t('Device not found'),
        msg: (
          <Trans t={t}>
            We could not find the device with id <strong>{id}</strong>
          </Trans>
        ),
      };
    case 'Repositories':
      return {
        title: t('Repository not found'),
        msg: (
          <Trans t={t}>
            We could not find the repository with id <strong>{id}</strong>
          </Trans>
        ),
      };
    case 'Enrollment requests':
      return {
        title: t('Enrollment request not found'),
        msg: (
          <Trans t={t}>
            We could not find the enrollment request with id <strong>{id}</strong>
          </Trans>
        ),
      };
    default:
      return {
        title: kind.toLowerCase(),
        msg: '',
      };
  }
};

const DetailsNotFound = ({ kind, id }: DetailsNotFoundProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tryAgain = () => {
    navigate(0);
  };

  const { title, msg } = getKindMsgs(t, kind, id);

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText={title}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>
          <Stack>
            <StackItem>{msg}</StackItem>
            <StackItem>
              <small>{t('This page will continue to attempt to fetch the details')}</small>
            </StackItem>
          </Stack>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="primary" onClick={() => navigate(ROUTE.ROOT)}>
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
