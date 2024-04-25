import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DeviceSystemdUnitStatus } from '@flightctl/types';
import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

type SystemdTableProps = {
  systemdUnits: DeviceSystemdUnitStatus[] | undefined;
};

const SystemdTable: React.FC<SystemdTableProps> = ({ systemdUnits }) => {
  const { t } = useTranslation();
  return systemdUnits?.length ? (
    <Table aria-label={t('Device systemd table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Loaded state')}</Th>
          <Th modifier="wrap">{t('Active state')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {systemdUnits.map((unit) => (
          <Tr key={`${unit.name}`}>
            <Td dataLabel={t('Name')}>{unit.name}</Td>
            <Td dataLabel={t('Loaded state')}>{unit.loadState}</Td>
            <Td dataLabel={t('Active state')}>{unit.activeState}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No systemd units found')}</Bullseye>
  );
};

export default SystemdTable;
