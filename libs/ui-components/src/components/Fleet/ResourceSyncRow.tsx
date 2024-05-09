import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';
import { ResourceSync } from '@flightctl/types';
import * as React from 'react';
import { FleetOwnerLinkIcon } from './FleetDetails/FleetOwnerLink';
import { DeleteListActionResult } from '../ListPage/types';
import ResourceSyncStatus from '../ResourceSync/ResourceSyncStatus';
import { useTranslation } from '../../hooks/useTranslation';

type ResourceSyncRowProps = {
  resourceSync: ResourceSync;
  deleteAction: DeleteListActionResult['deleteAction'];
  rowIndex: number;
  onRowSelect: (rs: ResourceSync) => OnSelect;
  isRowSelected: (rs: ResourceSync) => boolean;
};

const ResourceSyncRow: React.FC<ResourceSyncRowProps> = ({
  resourceSync,
  rowIndex,
  onRowSelect,
  isRowSelected,
  deleteAction,
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
      <Td dataLabel={t('System image')}>-</Td>
      <Td dataLabel={t('Label selector')}>-</Td>
      <Td dataLabel={t('Status')}>
        <ResourceSyncStatus resourceSync={resourceSync} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Edit'),
              tooltipProps: t('Fleets managed by a resource sync cannot be edited'),
              isAriaDisabled: true,
            },
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
