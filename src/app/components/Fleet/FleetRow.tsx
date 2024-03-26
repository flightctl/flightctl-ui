import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';
import * as React from 'react';
import { Link } from 'react-router-dom';
import LabelsView from '../common/LabelsView';
import FleetOwnerLink from './FleetDetails/FleetOwnerLink';
import { Fleet } from '@types';
import { DeleteListActionResult } from '../ListPage/types';
import FleetStatus from './FleetStatus';

const canDeleteResource = (fleet: Fleet) =>
  fleet.metadata?.owner ? 'Fleets managed by a Resourcesync cannot be deleted' : undefined;

type FleetRowProps = {
  fleet: Fleet;
  rowIndex: number;
  onRowSelect: (device: Fleet) => OnSelect;
  isRowSelected: (device: Fleet) => boolean;
  editLabelsAction: ({
    resourceId,
    disabledReason,
  }: {
    resourceId: string;
    disabledReason: string | undefined;
  }) => IAction;
  deleteAction: DeleteListActionResult['deleteAction'];
};

const FleetRow: React.FC<FleetRowProps> = ({
  fleet,
  rowIndex,
  onRowSelect,
  isRowSelected,
  editLabelsAction,
  deleteAction,
}) => {
  const fleetName = fleet.metadata.name || '';
  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(fleet),
          isSelected: isRowSelected(fleet),
        }}
      />
      <Td dataLabel="Name">
        <Link to={`${fleetName}`}>{fleetName}</Link>
      </Td>
      <Td dataLabel="OS image">{fleet.spec.template.spec.os?.image || '-'}</Td>
      <Td dataLabel="Label selector">
        <LabelsView prefix={fleetName} labels={fleet.spec.selector?.matchLabels} />
      </Td>
      <Td dataLabel="Status">
        <FleetStatus fleet={fleet} />
      </Td>
      <Td dataLabel="Managed by">
        <FleetOwnerLink owner={fleet.metadata?.owner} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            editLabelsAction({
              resourceId: fleetName,
              disabledReason: fleet.metadata?.owner ? 'Fleets managed by a Resourcesync cannot be edited' : undefined,
            }),
            deleteAction({
              resourceId: fleetName,
              disabledReason: canDeleteResource(fleet),
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default FleetRow;
