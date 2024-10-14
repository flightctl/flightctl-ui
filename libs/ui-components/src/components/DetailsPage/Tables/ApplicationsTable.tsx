import * as React from 'react';
import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';

type ApplicationsTableProps = {
  appsStatus: DeviceApplicationStatus[];
};

const ApplicationsTable = ({ appsStatus }: ApplicationsTableProps) => {
  const { t } = useTranslation();

  return appsStatus.length ? (
    <Table aria-label={t('Device applications table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
          <Th modifier="wrap">{t('Ready')}</Th>
          <Th modifier="wrap">{t('Restarts')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {appsStatus.map((appData) => (
          <Tr key={appData.name}>
            <Td dataLabel={t('Name')}>{appData.name}</Td>
            <Td dataLabel={t('Status')}>
              <ApplicationStatus status={appData.status} />
            </Td>
            <Td dataLabel={t('Ready')}>{appData.ready}</Td>
            <Td dataLabel={t('Restarts')}>{appData.restarts}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No applications found')}</Bullseye>
  );
};

export default ApplicationsTable;
