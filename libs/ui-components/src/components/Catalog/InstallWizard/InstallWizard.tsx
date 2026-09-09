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
import { useCatalogItemFromParams } from '../useCatalogItemsLookup';
import { getErrorMessage } from '../../../utils/error';
import { usePermissionsContext } from '../../common/PermissionsContext';
import PageWithPermissions from '../../common/PageWithPermissions';
import { RESOURCE, VERB } from '../../../types/rbac';
import { CatalogItemLabel } from '../CatalogItemLabels';
import TruncatedText from '../../common/TruncatedText';

const InstallWizard = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const params = useParams() as { catalogId: string; itemId: string };
  const { item: catalogItem, isLoading, error } = useCatalogItemFromParams(params);

  let content: React.ReactNode;
  if (error) {
    content = (
      <Alert isInline variant="danger" title={t('Failed to load catalog item')}>
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (isLoading) {
    content = <EmptyState titleText={t('Loading catalog item')} headingLevel="h4" icon={Spinner} />;
  } else if (catalogItem?.spec.category === CatalogItemCategory.CatalogItemCategorySystem) {
    content = <InstallOsWizard catalogItem={catalogItem} />;
  } else if (catalogItem?.spec.category === CatalogItemCategory.CatalogItemCategoryApplication) {
    content = <InstallAppWizard catalogItem={catalogItem} />;
  }

  const titleEl = catalogItem ? (
    <CatalogItemLabel item={catalogItem} shortened />
  ) : (
    <TruncatedText text={params.itemId} maxChars={30} />
  );

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.CATALOG}>{t('Software Catalog')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{titleEl}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Stack>
          <StackItem>
            <Title headingLevel="h1" size="3xl">
              {t('Deploy')} {titleEl}
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

const installWizardPermissions = [{ kind: RESOURCE.CATALOG_ITEM, verb: VERB.GET }];

const InstallWizardWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canGetItem] = checkPermissions(installWizardPermissions);
  return (
    <PageWithPermissions allowed={canGetItem} loading={loading}>
      <InstallWizard />
    </PageWithPermissions>
  );
};

export default InstallWizardWithPermissions;
