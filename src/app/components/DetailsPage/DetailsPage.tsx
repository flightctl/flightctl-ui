import { getErrorMessage } from '@app/utils/error';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';

type DetailsPageProps = {
  title: string | undefined;
  children: React.ReactNode;
  error: unknown;
  loading: boolean;
  resourceName: string;
  resourceLink: string;
};

const DetailsPage: React.FC<DetailsPageProps> = ({ title, children, error, loading, resourceLink, resourceName }) => {
  let content = children;
  if (error) {
    content = (
      <Alert isInline variant="danger" title="Failed to retrieve resource details">
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (loading) {
    content = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={resourceLink}>{resourceName}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{title}</BreadcrumbItem>
          </Breadcrumb>
        </StackItem>
        <StackItem>
          <Title headingLevel="h1" size="3xl">
            {title}
          </Title>
        </StackItem>
        <StackItem>{content}</StackItem>
      </Stack>
    </PageSection>
  );
};

export default DetailsPage;
