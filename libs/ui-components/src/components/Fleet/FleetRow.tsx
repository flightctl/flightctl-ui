import * as React from 'react';
import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Fleet } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { getFleetRolloutStatusWarning } from '../../utils/status/fleet';

import { FleetOwnerLinkIcon, getOwnerName } from './FleetDetails/FleetOwnerLink';
import FleetStatus from './FleetStatus';
import ResourceLink from '../common/ResourceLink';
import FleetDevicesCount from './FleetDetails/FleetDevicesCount';

type FleetRowProps = {
  fleet: Fleet;
  rowIndex: number;
  onRowSelect: (fleet: Fleet) => OnSelect;
  isRowSelected: (fleet: Fleet) => boolean;
  onDeleteClick: () => void;
  canDelete: boolean;
  canEdit: boolean;
};

const useFleetActions = (fleetName: string, isManaged: boolean, canEdit: boolean) => {
  const actions: IAction[] = [];
  const navigate = useNavigate();
  const { t } = useTranslation();

  actions.push({
    title: t('View fleet details'),
    onClick: () => navigate({ route: ROUTE.FLEET_DETAILS, postfix: fleetName }),
  });

  // If users can't edit, the wizard will be in read-only mode
  actions.push({
    title: isManaged || !canEdit ? t('View fleet configurations') : t('Edit fleet configurations'),
    onClick: () => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetName }),
  });
  return actions;
};

const FleetRow: React.FC<FleetRowProps> = ({
  fleet,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onDeleteClick,
  canDelete,
  canEdit,
}) => {
  const { t } = useTranslation();
  const fleetName = fleet.metadata.name || '';

  const isManaged = !!fleet.metadata?.owner;
  const actions = useFleetActions(fleetName, isManaged, canEdit);
  const fleetRolloutError = getFleetRolloutStatusWarning(fleet, t);

  if (canDelete) {
    actions.push({
      title: t('Delete fleet'),
      onClick: onDeleteClick,
      tooltipProps: isManaged
        ? {
            content: t(
              "This fleet is managed by a resource sync and cannot be directly deleted. Either remove this fleet's definition from the resource sync configuration, or delete the resource sync first.",
            ),
          }
        : undefined,
      isAriaDisabled: isManaged,
    });
  }

  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(fleet),
          isSelected: isRowSelected(fleet),
        }}
      />
      <Td dataLabel={t('Name')}>
        <FleetOwnerLinkIcon ownerName={getOwnerName(fleet.metadata.owner)}>
          <ResourceLink id={fleetName} routeLink={ROUTE.FLEET_DETAILS} />
        </FleetOwnerLinkIcon>
      </Td>
      <Td dataLabel={t('System image')}>{fleet.spec.template.spec.os?.image || '-'}</Td>
      <Td dataLabel={t('Up-to-date/devices')}>
        <FleetDevicesCount
          fleetId={fleetName}
          devicesSummary={fleet.status?.devicesSummary}
          error={fleetRolloutError}
        />
      </Td>
      <Td dataLabel={t('Status')}>
        <FleetStatus fleet={fleet} />
      </Td>
      <Td isActionCell>
        <ActionsColumn items={actions} />
      </Td>
    </Tr>
  );
};

export default FleetRow;
