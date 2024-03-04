import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Device } from '@types';
import * as React from 'react';

type ConditionsTableProps = {
  device: Device;
};

const ConditionsTable: React.FC<ConditionsTableProps> = ({ device }) => {
  return device.status?.conditions?.length ? (
    <Table aria-label="Device conditions table">
      <Thead>
        <Tr>
          <Th>Type</Th>
          <Th modifier="wrap">Status</Th>
          <Th modifier="wrap">Reason</Th>
        </Tr>
      </Thead>
      <Tbody>
        {device.status?.conditions?.map((condition) => (
          <Tr key={condition.type}>
            <Td dataLabel="Type">{condition.type}</Td>
            <Td dataLabel="Status">{condition.status}</Td>
            <Td dataLabel="Reason">{condition.reason || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>No conditions found</Bullseye>
  );
};

export default ConditionsTable;
