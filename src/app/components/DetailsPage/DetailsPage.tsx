import { getErrorMessage } from '@app/utils/error';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  Spinner,
  Split,
  SplitItem,
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
  actions?: React.ReactNode;
  nav?: React.ReactNode;
};

const DetailsPage: React.FC<DetailsPageProps> = ({
  title,
  children,
  error,
  loading,
  resourceLink,
  resourceName,
  actions,
  nav,
}) => {
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
    <>
      <PageSection variant="light" type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={resourceLink}>{resourceName}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{title}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant="light">
        <Split hasGutter>
          <SplitItem isFilled>
            <Title headingLevel="h1" size="3xl">
              {title}
            </Title>
          </SplitItem>
          <SplitItem>{actions}</SplitItem>
        </Split>
      </PageSection>
      {nav && (
        <PageSection variant="light" type="nav">
          {nav}
        </PageSection>
      )}
      <PageSection>{content}</PageSection>
    </>
  );
};

export default DetailsPage;
