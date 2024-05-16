import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Fleet } from '@flightctl/types';
import LabelsView from '../common/LabelsView';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetOwnerLinkIcon, getOwnerName } from './FleetDetails/FleetOwnerLink';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import FleetStatus from './FleetStatus';
import DisplayName from '../common/DisplayName';

type FleetRowProps = {
  fleet: Fleet;
  rowIndex: number;
  onRowSelect: (fleet: Fleet) => OnSelect;
  isRowSelected: (fleet: Fleet) => boolean;
  onDeleteClick: () => void;
};

const FleetRow: React.FC<FleetRowProps> = ({ fleet, rowIndex, onRowSelect, isRowSelected, onDeleteClick }) => {
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
        <FleetOwnerLinkIcon ownerName={getOwnerName(fleet.metadata.owner)}>
          <DisplayName name={fleetName} routeLink={ROUTE.FLEET_DETAILS} />
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
              tooltipProps: isManaged
                ? { content: t('Fleets managed by a resource sync cannot be edited') }
                : undefined,
              isAriaDisabled: isManaged,
            },
            {
              title: t('Delete'),
              onClick: onDeleteClick,
            },
          ]}
        />
      </Td>
    </Tr>
  );
};

export default FleetRow;
