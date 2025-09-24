import * as React from 'react';
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

import { getErrorMessage } from '../../utils/error';
import DetailsNotFound from './DetailsNotFound';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, Route } from '../../hooks/useNavigate';
import ErrorBoundary from '../common/ErrorBoundary';

import './DetailsPage.css';

export type DetailsPageProps = {
  id: string;
  breadcrumbTitle?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  error: unknown;
  loading: boolean;
  resourceType: 'Fleets' | 'Devices' | 'Repositories' | 'Enrollment requests';
  resourceTypeLabel: string;
  resourceLink: Route;
  actions?: React.ReactNode;
  nav?: React.ReactNode;
  banner?: React.ReactNode;
};

const DetailsPage = ({
  id,
  breadcrumbTitle,
  title,
  children,
  error,
  loading,
  resourceLink,
  resourceType,
  resourceTypeLabel,
  actions,
  nav,
  banner,
}: DetailsPageProps) => {
  const { t } = useTranslation();
  let content = children;
  if (error) {
    const msg = getErrorMessage(error);
    if (msg === 'Error 404: Not Found') {
      return <DetailsNotFound kind={resourceType} id={id} />;
    }
    content = (
      <Alert isInline variant="danger" title={t('Failed to retrieve resource details')}>
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
            <Link to={resourceLink}>{resourceTypeLabel}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{breadcrumbTitle || id}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant="light">
        <Split hasGutter>
          <SplitItem isFilled>
            <Title headingLevel="h1" size="3xl" role="heading">
              {title || id}
            </Title>
          </SplitItem>
          <SplitItem>{actions}</SplitItem>
        </Split>
      </PageSection>
      {banner}
      {nav && (
        <PageSection variant="light" type="nav" className="fctl-details-page__nav">
          {nav}
        </PageSection>
      )}
      <PageSection>
        <ErrorBoundary>{content}</ErrorBoundary>
      </PageSection>
    </>
  );
};

export default DetailsPage;
