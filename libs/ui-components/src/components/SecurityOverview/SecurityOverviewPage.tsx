import * as React from 'react';
import { Alert, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { useVulnerabilities } from '../../hooks/useVulnerabilities';
import { useVulnerabilitiesEnabled } from '../../hooks/useServicesEnabled';
import PageWithPermissions from '../common/PageWithPermissions';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';

import VulnerabilitiesTable from './VulnerabilitiesTable';
import SecurityOverviewEmptyState from './VulnerabilitiesEmptyState';

const SecurityOverviewPageContent = () => {
  const { t } = useTranslation();

  const {
    vulnerabilities,
    currentPage,
    setCurrentPage,
    itemCount,
    search,
    setSearch,
    selectedSeverities,
    setSelectedSeverities,
    sortBy,
    sortDirection,
    onSort,
    isLoading,
    isUpdating,
    error,
  } = useVulnerabilities();

  const hasFiltersEnabled = selectedSeverities.length > 0 || search.trim() !== '';
  if (itemCount === 0 && !hasFiltersEnabled && !isLoading && !isUpdating) {
    // The link to this page is only shown when some vulnerabilities are present.
    // If the user navigates to it directly, we show the empty state assuming there are some devices
    return <SecurityOverviewEmptyState hasDevices />;
  }

  return (
    <ListPage title={t('Security overview')}>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={ROUTE.ROOT}>{t('Overview')}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{t('Security overview')}</BreadcrumbItem>
      </Breadcrumb>
      <ListPageBody error={error} loading={isLoading}>
        <VulnerabilitiesTable
          isSingleDevice={false}
          isUpdating={isUpdating}
          vulnerabilities={vulnerabilities}
          selectedSeverities={selectedSeverities}
          setSelectedSeverities={setSelectedSeverities}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={onSort}
          pagination={{ currentPage, setCurrentPage, itemCount }}
        />
      </ListPageBody>
    </ListPage>
  );
};

const SecurityOverviewPageWithPermissions = () => {
  const { t } = useTranslation();

  const [vulnerabilitiesEnabled, canListVulnerabilities, isLoading] = useVulnerabilitiesEnabled();
  if (!vulnerabilitiesEnabled) {
    return <Alert isInline variant="info" title={t('Vulnerability reporting is not enabled in this environment.')} />;
  }

  return (
    <PageWithPermissions allowed={canListVulnerabilities} loading={isLoading}>
      <SecurityOverviewPageContent />
    </PageWithPermissions>
  );
};

export default SecurityOverviewPageWithPermissions;
