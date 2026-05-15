import * as React from 'react';

import { useVulnerabilities } from '../../../hooks/useVulnerabilities';
import ListPageBody from '../../ListPage/ListPageBody';
import VulnerabilitiesTable from '../../SecurityOverview/VulnerabilitiesTable';

const FleetVulnerabilities = ({ fleetId }: { fleetId: string }) => {
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
    <ListPageBody error={error} loading={isLoading}>
      <VulnerabilitiesTable
        fleetName={fleetId}
        vulnerabilities={vulnerabilities}
        isSingleDevice={false}
        isUpdating={isUpdating}
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
  );
};

export default FleetVulnerabilities;
