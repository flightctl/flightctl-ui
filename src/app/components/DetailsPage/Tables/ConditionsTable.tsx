import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Condition } from '@types';
import * as React from 'react';

type ConditionsTableProps = {
  conditions: Array<Condition> | undefined;
  type: string;
};

const ConditionsTable: React.FC<ConditionsTableProps> = ({ conditions, type }) => {
  return conditions?.length ? (
    <Table aria-label={`${type} conditions table`}>
      <Thead>
        <Tr>
          <Th>Type</Th>
          <Th modifier="wrap">Status</Th>
          <Th modifier="wrap">Reason</Th>
          <Th modifier="wrap">Message</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map((condition) => (
          <Tr key={condition.type}>
            <Td dataLabel="Type">{condition.type}</Td>
            <Td dataLabel="Status">{condition.status}</Td>
            <Td dataLabel="Reason">{condition.reason || '-'}</Td>
            <Td dataLabel="Message">{condition.message || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>No conditions found</Bullseye>
  );
};

export default ConditionsTable;
