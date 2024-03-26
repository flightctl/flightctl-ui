import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';
import { ResourceSync } from '@types';
import * as React from 'react';
import { RSLink } from './FleetDetails/FleetOwnerLink';
import { DeleteListActionResult } from '../ListPage/types';
import ResourceSyncStatus from '../ResourceSync/ResourceSyncStatus';

type ResourceSyncRowProps = {
  resourceSync: ResourceSync;
  deleteAction: DeleteListActionResult['deleteAction'];
  rowIndex: number;
  onRowSelect: (rs: ResourceSync) => OnSelect;
  isRowSelected: (rs: ResourceSync) => boolean;
  editLabelsAction: ({
    resourceId,
    disabledReason,
  }: {
    resourceId: string;
    disabledReason: string | undefined;
  }) => IAction;
};

const ResourceSyncRow: React.FC<ResourceSyncRowProps> = ({
  resourceSync,
  rowIndex,
  onRowSelect,
  isRowSelected,
  deleteAction,
  editLabelsAction,
}) => {
  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(resourceSync),
          isSelected: isRowSelected(resourceSync),
        }}
      />
      <Td dataLabel="Name">-</Td>
      <Td dataLabel="OS image">-</Td>
      <Td dataLabel="Label selector">-</Td>
      <Td dataLabel="Status">
        <ResourceSyncStatus resourceSync={resourceSync} />
      </Td>
      <Td dataLabel="Managed by">
        <RSLink rsName={resourceSync.metadata.name || ''} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            editLabelsAction({
              resourceId: resourceSync.metadata.name || '',
              disabledReason: 'Fleets managed by a Resourcesync cannot be edited',
            }),
            deleteAction({
              resourceId: resourceSync.metadata.name || '',
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default ResourceSyncRow;
