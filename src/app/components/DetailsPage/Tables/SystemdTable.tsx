import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DeviceSystemdUnitStatus } from '@types';
import * as React from 'react';

type SystemdTableProps = {
  systemdUnits: DeviceSystemdUnitStatus[] | undefined;
};

const SystemdTable: React.FC<SystemdTableProps> = ({ systemdUnits }) => {
  return systemdUnits?.length ? (
    <Table aria-label="Device systemd table">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th modifier="wrap">Loaded state</Th>
          <Th modifier="wrap">Active state</Th>
        </Tr>
      </Thead>
      <Tbody>
        {systemdUnits.map((unit) => (
          <Tr key={unit.name}>
            <Td dataLabel="Name">{unit.name}</Td>
            <Td dataLabel="Loaded state">{unit.loadState}</Td>
            <Td dataLabel="Active state">{unit.activeState}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>No systemd units found</Bullseye>
  );
};

export default SystemdTable;
