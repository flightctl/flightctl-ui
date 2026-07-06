import * as React from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ApplicationPort } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { toFormPortMappingWithProtocol } from '../Device/EditDeviceWizard/deviceSpecUtils';

type ApplicationPortsTableProps = {
  ports: ApplicationPort[];
  targetPortLabel: string;
  withProtocol?: boolean;
};

const ApplicationPortsTable = ({ ports, targetPortLabel, withProtocol }: ApplicationPortsTableProps) => {
  const { t } = useTranslation();

  if (ports.length === 0) {
    return null;
  }

  // We map the ports including the "protocol" property.
  // Later we use "withProtocol" to determine if the protocol should be displayed
  const mappedPorts = ports.map(toFormPortMappingWithProtocol);

  return (
    <Table aria-label={t('Published ports')} variant="compact" borders={false}>
      <Thead>
        <Tr>
          <Th>{t('Host port')}</Th>
          <Th>{targetPortLabel}</Th>
          {withProtocol && <Th>{t('Protocol')}</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {mappedPorts.map((mappedPort) => {
          return (
            <Tr key={`${mappedPort.hostPort}-${mappedPort.targetPort}-${mappedPort.protocol || '-'}`}>
              <Td>{mappedPort.hostPort || '-'}</Td>
              <Td>{mappedPort.targetPort || '-'}</Td>
              {withProtocol && <Td>{mappedPort.protocol.toUpperCase()}</Td>}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ApplicationPortsTable;
