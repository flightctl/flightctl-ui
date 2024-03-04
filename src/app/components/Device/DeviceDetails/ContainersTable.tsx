import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Device } from '@types';
import * as React from 'react';

const ContainersTable = ({ device }: { device: Device }) => {
  return device.status?.containers ? (
    <Table aria-label="Device containers table">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th modifier="wrap">Image</Th>
          <Th modifier="wrap">Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {device.status.containers.map((container) => (
          <Tr key={container.id}>
            <Td dataLabel="Name">{container.name}</Td>
            <Td dataLabel="Image">{container.image}</Td>
            <Td dataLabel="Status">{container.status}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>No containers found</Bullseye>
  );
};

export default ContainersTable;
