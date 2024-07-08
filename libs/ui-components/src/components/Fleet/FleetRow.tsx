import * as React from 'react';
import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Fleet } from '@flightctl/types';
import LabelsView from '../common/LabelsView';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetOwnerLinkIcon, getOwnerName } from './FleetDetails/FleetOwnerLink';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import FleetStatus from './FleetStatus';
import ResourceLink from '../common/ResourceLink';

type FleetRowProps = {
  fleet: Fleet;
  rowIndex: number;
  onRowSelect: (fleet: Fleet) => OnSelect;
  isRowSelected: (fleet: Fleet) => boolean;
  onDeleteClick: () => void;
};

const useFleetActions = (fleetName: string, isManaged: boolean) => {
  const actions: IAction[] = [];
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isManaged) {
    actions.push({
      title: t("View fleet's configuration"),
      onClick: () => navigate({ route: ROUTE.FLEET_DETAILS, postfix: fleetName }),
    });
  } else {
    actions.push({
      title: t('Edit'),
      onClick: () => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetName }),
    });
  }
  return actions;
};

const FleetRow: React.FC<FleetRowProps> = ({ fleet, rowIndex, onRowSelect, isRowSelected, onDeleteClick }) => {
  const { t } = useTranslation();
  const fleetName = fleet.metadata.name || '';

  const isManaged = !!fleet.metadata?.owner;
  const actions = useFleetActions(fleetName, !!fleet.metadata?.owner);
  actions.push({
    title: t('Delete'),
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
      <Td dataLabel={t('Label selector')}>
        <LabelsView prefix={fleetName} labels={fleet.spec.selector?.matchLabels} variant="collapsed" />
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
