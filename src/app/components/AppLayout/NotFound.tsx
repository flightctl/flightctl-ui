import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText="404 Page not found"
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>We didn&apos;t find a page that matches the address you navigated to.</EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={() => navigate('/')}>Take me home</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export default NotFound;
