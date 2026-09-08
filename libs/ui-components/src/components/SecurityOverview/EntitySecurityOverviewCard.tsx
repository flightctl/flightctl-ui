import * as React from 'react';
import { CardBody, CardExpandableContent, CardHeader } from '@patternfly/react-core';
import { type OnSort } from '@patternfly/react-table';
import ShieldAltIcon from '@patternfly/react-icons/dist/js/icons/shield-alt-icon';
import {
  type CveCountsBySeverity,
  type Vulnerability,
  type VulnerabilityGroup,
  type VulnerabilityGroupList,
  type VulnerabilityList,
} from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import { type VulnerabilitySortDirection, type VulnerabilitySortField } from '../../hooks/useVulnerabilities';
import { type PaginationDetails } from '../../hooks/useTablePagination';
import { getSeverityToggleResult } from '../../utils/vulnerabilities';
import ListPageBody from '../ListPage/ListPageBody';
import DetailsPageCard, { DetailsPageCardTitle } from '../DetailsPage/DetailsPageCard';
import SecurityOverviewSummary from './SecurityOverviewSummary';
import VulnerabilitiesTable from './VulnerabilitiesTable';

type Severity = Vulnerability.severity;

type EntitySecurityOverviewCardCommonProps = {
  counts: CveCountsBySeverity;
  isSummaryLoading: boolean;
  vulnerabilities: Vulnerability[] | VulnerabilityGroup[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemCount: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedSeverities: Severity[];
  setSelectedSeverities: React.Dispatch<React.SetStateAction<Severity[]>>;
  sortBy: VulnerabilitySortField;
  sortDirection: VulnerabilitySortDirection;
  onSort: OnSort;
  isLoading: boolean;
  isUpdating: boolean;
  error: unknown;
};

type EntitySecurityOverviewCardDeviceProps = EntitySecurityOverviewCardCommonProps & {
  isSingleDevice: true;
};

type EntitySecurityOverviewCardFleetProps = EntitySecurityOverviewCardCommonProps & {
  isSingleDevice: false;
  fleetName: string;
};

type EntitySecurityOverviewCardProps = EntitySecurityOverviewCardDeviceProps | EntitySecurityOverviewCardFleetProps;

const EntitySecurityOverviewCard = ({
  counts,
  isSummaryLoading,
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
  ...scopeProps
}: EntitySecurityOverviewCardProps) => {
  const { t } = useTranslation();
  const [isTableExpanded, setIsTableExpanded] = React.useState(false);

  const onSeverityToggle = React.useCallback(
    (severity: Severity) => {
      setSelectedSeverities((currentSeverities) => {
        const { selectedSeverities: nextSeverities, expandTable } = getSeverityToggleResult(
          severity,
          currentSeverities,
        );
        if (expandTable) {
          setIsTableExpanded(true);
        }
        return nextSeverities;
      });
    },
    [setSelectedSeverities],
  );

  const pagination: Pick<
    PaginationDetails<VulnerabilityGroupList | VulnerabilityList>,
    'currentPage' | 'setCurrentPage' | 'itemCount'
  > = {
    currentPage,
    setCurrentPage,
    itemCount,
  };

  return (
    <DetailsPageCard isExpanded={isTableExpanded} isFullHeight={false}>
      <CardHeader
        onExpand={() => setIsTableExpanded((prev) => !prev)}
        toggleButtonProps={{
          'aria-label': t('Toggle security details'),
          'aria-expanded': isTableExpanded,
        }}
      >
        <DetailsPageCardTitle title={t('Security overview')} icon={<ShieldAltIcon />} />
      </CardHeader>
      <CardBody>
        <SecurityOverviewSummary
          counts={counts}
          selectedSeverities={selectedSeverities}
          onSeverityToggle={onSeverityToggle}
          isLoading={isSummaryLoading}
        />
      </CardBody>
      <CardExpandableContent>
        <CardBody>
          <ListPageBody error={error} loading={isLoading}>
            {scopeProps.isSingleDevice ? (
              <VulnerabilitiesTable
                isSingleDevice
                isUpdating={isUpdating}
                vulnerabilities={vulnerabilities as Vulnerability[]}
                selectedSeverities={selectedSeverities}
                setSelectedSeverities={setSelectedSeverities}
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                pagination={pagination}
              />
            ) : (
              <VulnerabilitiesTable
                isSingleDevice={false}
                fleetName={scopeProps.fleetName}
                isUpdating={isUpdating}
                vulnerabilities={vulnerabilities as VulnerabilityGroup[]}
                selectedSeverities={selectedSeverities}
                setSelectedSeverities={setSelectedSeverities}
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                pagination={pagination}
              />
            )}
          </ListPageBody>
        </CardBody>
      </CardExpandableContent>
    </DetailsPageCard>
  );
};

export default EntitySecurityOverviewCard;
