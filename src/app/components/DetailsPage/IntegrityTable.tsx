import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';

import './IntegrityTable.css';

type IntegrityTableProps = {
  measurements: Record<string, string> | undefined;
};

const IntegrityTable: React.FC<IntegrityTableProps> = ({ measurements }) => {
  return measurements ? (
    <Table aria-label="System integrity table">
      <Thead>
        <Tr>
          <Th>Type</Th>
          <Th modifier="truncate">Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(measurements).map((key) => (
          <Tr key={key}>
            <Td dataLabel="Type">{key}</Td>
            <Td dataLabel="Status" className="fctl-integrity-value">
              {measurements[key]}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>No system integrity measurements found.</Bullseye>
  );
};

export default IntegrityTable;
