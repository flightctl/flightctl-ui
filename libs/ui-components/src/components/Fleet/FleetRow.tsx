import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';
import * as React from 'react';
import LabelsView from '../common/LabelsView';
import { Fleet } from '@flightctl/types';
import { DeleteListActionResult } from '../ListPage/types';
import FleetStatus from './FleetStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetOwnerLinkIcon, getOwnerName } from './FleetDetails/FleetOwnerLink';
import { Link, ROUTE, useNavigate } from '../../hooks/useNavigate';

type FleetRowProps = {
  fleet: Fleet;
  rowIndex: number;
  onRowSelect: (device: Fleet) => OnSelect;
  isRowSelected: (device: Fleet) => boolean;
  deleteAction: DeleteListActionResult['deleteAction'];
};

const FleetRow: React.FC<FleetRowProps> = ({ fleet, rowIndex, onRowSelect, isRowSelected, deleteAction }) => {
  const { t } = useTranslation();
  const fleetName = fleet.metadata.name || '';
  const navigate = useNavigate();

  const isManaged = !!fleet.metadata?.owner;

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
        <FleetOwnerLinkIcon hasOwner={!!getOwnerName({ owner: fleet.metadata.owner })}>
          <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>{fleetName}</Link>
        </FleetOwnerLinkIcon>
      </Td>
      <Td dataLabel={t('System image')}>{fleet.spec.template.spec.os?.image || '-'}</Td>
      <Td dataLabel={t('Label selector')}>
        <LabelsView prefix={fleetName} labels={fleet.spec.selector?.matchLabels} />
      </Td>
      <Td dataLabel={t('Status')}>
        <FleetStatus fleet={fleet} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Edit'),
              onClick: () => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetName }),
              tooltipProps: isManaged ? { content: t('Fleets managed by a Resourcesync cannot be edited') } : undefined,
              isAriaDisabled: isManaged,
            },
            deleteAction({
              resourceId: fleetName,
              disabledReason: isManaged ? t('Fleets managed by a Resourcesync cannot be deleted') : undefined,
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default FleetRow;
