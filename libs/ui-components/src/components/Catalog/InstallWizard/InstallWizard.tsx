import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  EmptyState,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CatalogItemCategory } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import ErrorBoundary from '../../common/ErrorBoundary';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import InstallOsWizard from './InstallOsWizard';
import InstallAppWizard from './InstallAppWizard';
import { useAppContext } from '../../../hooks/useAppContext';
import { useCatalogItem } from '../useCatalogs';
import { getErrorMessage } from '../../../utils/error';

const InstallWizard = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { catalogId, itemId } = useParams() as { catalogId: string; itemId: string };
  const [catalogItem, loading, error] = useCatalogItem(catalogId, itemId);

  let content: React.ReactNode;
  if (error) {
    content = (
      <Alert isInline variant="danger" title={t('Failed to load catalog item')}>
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (loading) {
    content = <EmptyState titleText={t('Loading catalog item')} headingLevel="h4" icon={Spinner} />;
  } else if (catalogItem?.spec.category === CatalogItemCategory.CatalogItemCategorySystem) {
    content = <InstallOsWizard catalogItem={catalogItem} />;
  } else if (catalogItem?.spec.category === CatalogItemCategory.CatalogItemCategoryApplication) {
    content = <InstallAppWizard catalogItem={catalogItem} />;
  }

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.CATALOG}>{t('Software Catalog')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{catalogItem?.spec.displayName || itemId}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Stack>
          <StackItem>
            <Title headingLevel="h1" size="3xl">
              {t('Install {{name}}', { name: catalogItem?.spec.displayName || itemId })}
            </Title>
          </StackItem>
          <StackItem>
            {catalogItem?.spec.shortDescription && (
              <Content component={ContentVariants.small}>{catalogItem.spec.shortDescription}</Content>
            )}
          </StackItem>
        </Stack>
      </PageSection>
      <PageSection hasBodyWrapper={false} type="wizard">
        <ErrorBoundary>{content}</ErrorBoundary>
      </PageSection>
    </>
  );
};

export default InstallWizard;
