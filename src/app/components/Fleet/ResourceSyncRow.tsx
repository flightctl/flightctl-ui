import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';
import { ResourceSync } from '@types';
import * as React from 'react';
import { FleetOwnerLinkIcon } from './FleetDetails/FleetOwnerLink';
import { DeleteListActionResult } from '../ListPage/types';
import ResourceSyncStatus from '../ResourceSync/ResourceSyncStatus';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(resourceSync),
          isSelected: isRowSelected(resourceSync),
        }}
      />
      <Td dataLabel={t('Name')}>
        <FleetOwnerLinkIcon hasOwner>-</FleetOwnerLinkIcon>
      </Td>
      <Td dataLabel={t('OS image')}>-</Td>
      <Td dataLabel={t('Label selector')}>-</Td>
      <Td dataLabel={t('Status')}>
        <ResourceSyncStatus resourceSync={resourceSync} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            editLabelsAction({
              resourceId: resourceSync.metadata.name || '',
              disabledReason: t('Fleets managed by a Resourcesync cannot be edited'),
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
