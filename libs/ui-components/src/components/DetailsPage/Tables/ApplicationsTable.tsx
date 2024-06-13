import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { ContainerStatus } from '@flightctl/types';
import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

type ApplicationsTableProps = {
  containers: ContainerStatus[] | undefined;
};

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ containers }) => {
  const { t } = useTranslation();
  return containers?.length ? (
    <Table aria-label={t('Device applications table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Image')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {containers.map((container) => (
          <Tr key={container.id}>
            <Td dataLabel={t('Name')}>{container.name}</Td>
            <Td dataLabel={t('Image')}>{container.image}</Td>
            <Td dataLabel={t('Status')}>{container.status}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No applications found')}</Bullseye>
  );
};

export default ApplicationsTable;
