import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Device } from '@types';
import * as React from 'react';

import './IntegrityTable.css';

type IntegrityTableProps = {
  device: Device;
};

const IntegrityTable: React.FC<IntegrityTableProps> = ({ device }) => {
  return device.status?.systemInfo?.measurements ? (
    <Table aria-label="System integrity table">
      <Thead>
        <Tr>
          <Th>Type</Th>
          <Th modifier="truncate">Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(device.status.systemInfo.measurements).map((key) => (
          <Tr key={key}>
            <Td dataLabel="Type">{key}</Td>
            <Td dataLabel="Status" className="fctl-integrity-value">
              {device.status?.systemInfo?.measurements[key]}
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
