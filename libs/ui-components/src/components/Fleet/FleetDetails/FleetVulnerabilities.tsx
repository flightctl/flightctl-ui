import * as React from 'react';

import { useFleetVulnerabilitySummary } from '../../../hooks/useVulnerabilitySummary';
import { useVulnerabilities } from '../../../hooks/useVulnerabilities';
import EntitySecurityOverviewCard from '../../SecurityOverview/EntitySecurityOverviewCard';

const FleetVulnerabilities = ({ fleetId }: { fleetId: string }) => {
  const { counts, isLoading: isSummaryLoading } = useFleetVulnerabilitySummary(fleetId);
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
  } = useVulnerabilities({
    endpoint: `vulnerabilities/fleets/${fleetId}`,
  });

  return (
    <EntitySecurityOverviewCard
      isSingleDevice={false}
      fleetName={fleetId}
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

export default FleetVulnerabilities;
