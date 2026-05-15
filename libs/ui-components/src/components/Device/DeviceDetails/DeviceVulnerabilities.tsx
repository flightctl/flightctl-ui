import * as React from 'react';

import { CardBody, CardTitle } from '@patternfly/react-core';
import { VulnerabilityList } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { useVulnerabilities } from '../../../hooks/useVulnerabilities';
import ListPageBody from '../../ListPage/ListPageBody';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';
import VulnerabilitiesTable from '../../SecurityOverview/VulnerabilitiesTable';

const DeviceVulnerabilities = ({ deviceId }: { deviceId: string }) => {
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
  } = useVulnerabilities<VulnerabilityList>({
    endpoint: `vulnerabilities/devices/${deviceId}`,
  });

  return (
    <DetailsPageCard>
      <CardTitle>{t('Security overview')}</CardTitle>
      <CardBody>
        <ListPageBody error={error} loading={isLoading}>
          <VulnerabilitiesTable
            isSingleDevice
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
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceVulnerabilities;
