import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';
import * as React from 'react';
import LabelsView from '../common/LabelsView';
import { Fleet } from '@flightctl/types';
import { DeleteListActionResult } from '../ListPage/types';
import FleetStatus from './FleetStatus';
import { useTranslation } from 'react-i18next';
import { FleetOwnerLinkIcon, getOwnerName } from './FleetDetails/FleetOwnerLink';
import { Link, ROUTE } from '../../hooks/useNavigate';

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
  const { t } = useTranslation();
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
      <Td dataLabel={t('Name')}>
        <FleetOwnerLinkIcon hasOwner={!!getOwnerName({ owner: fleet.metadata.owner })}>
          <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetName }}>{fleetName}</Link>
        </FleetOwnerLinkIcon>
      </Td>
      <Td dataLabel={t('OS image')}>{fleet.spec.template.spec.os?.image || '-'}</Td>
      <Td dataLabel={t('Label selector')}>
        <LabelsView prefix={fleetName} labels={fleet.spec.selector?.matchLabels} />
      </Td>
      <Td dataLabel={t('Status')}>
        <FleetStatus fleet={fleet} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            editLabelsAction({
              resourceId: fleetName,
              disabledReason: fleet.metadata?.owner
                ? t('Fleets managed by a Resourcesync cannot be edited')
                : undefined,
            }),
            deleteAction({
              resourceId: fleetName,
              disabledReason: fleet.metadata?.owner
                ? t('Fleets managed by a Resourcesync cannot be deleted')
                : undefined,
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default FleetRow;
