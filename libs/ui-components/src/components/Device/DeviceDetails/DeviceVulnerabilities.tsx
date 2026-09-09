import * as React from 'react';

import { type VulnerabilityList } from '@flightctl/types/alpha';

import { useDeviceVulnerabilitySummary } from '../../../hooks/useVulnerabilitySummary';
import { useVulnerabilities } from '../../../hooks/useVulnerabilities';
import EntitySecurityOverviewCard from '../../SecurityOverview/EntitySecurityOverviewCard';

const DeviceVulnerabilities = ({ deviceId }: { deviceId: string }) => {
  const { counts, isLoading: isSummaryLoading } = useDeviceVulnerabilitySummary(deviceId);
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
    <EntitySecurityOverviewCard
      isSingleDevice
      counts={counts}
      isSummaryLoading={isSummaryLoading}
      vulnerabilities={vulnerabilities}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      itemCount={itemCount}
      search={search}
      setSearch={setSearch}
      selectedSeverities={selectedSeverities}
      setSelectedSeverities={setSelectedSeverities}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      isLoading={isLoading}
      isUpdating={isUpdating}
      error={error}
    />
  );
};

export default DeviceVulnerabilities;
