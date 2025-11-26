import * as React from 'react';
import { Bullseye, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';

type ApplicationsTableProps = {
  // Contains the statuses of all detected applications
  appsStatus: DeviceApplicationStatus[];
  // List of apps as defined the device / fleet spec
  specApps: string[];
};

const emptyAppDetails: Partial<DeviceApplicationStatus> = {
  name: '',
  ready: '-',
  restarts: 0,
  embedded: false,
};

const ApplicationsTable = ({ appsStatus, specApps }: ApplicationsTableProps) => {
  const { t } = useTranslation();

  // Includes applications already reported in status as well as those that are only in the spec yet
  const allAppNames: string[] = [];
  specApps.forEach((app) => {
    allAppNames.push(app);
  });
  appsStatus.forEach((appStatus) => {
    if (!allAppNames.includes(appStatus.name)) {
      allAppNames.push(appStatus.name);
    }
  });

  return allAppNames.length ? (
    <Table aria-label={t('Device applications table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
          <Th modifier="wrap">{t('Ready')}</Th>
          <Th modifier="wrap">{t('Restarts')}</Th>
          <Th modifier="wrap">{t('Type')}</Th>
          <Th modifier="wrap">{t('Embedded')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {allAppNames.map((appName) => {
          const appDetails = appsStatus.find((app) => app.name === appName) || emptyAppDetails;
          let embedded = '-';
          if (appDetails.embedded === true) {
            embedded = t('Yes');
          } else if (appDetails.embedded === false) {
            embedded = t('No');
          }

          return (
            <Tr key={appName}>
              <Td dataLabel={t('Name')}>{appName}</Td>
              <Td dataLabel={t('Status')}>
                {appDetails.status ? <ApplicationStatus status={appDetails.status} /> : '-'}
              </Td>
              <Td dataLabel={t('Ready')}>{appDetails.ready}</Td>
              <Td dataLabel={t('Restarts')}>{appDetails.restarts}</Td>
              <Td dataLabel={t('Type')}>
                {appDetails.appType ? <Label variant="outline">{appDetails.appType}</Label> : '-'}
              </Td>
              <Td dataLabel={t('Embedded')}>{embedded}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No applications found')}</Bullseye>
  );
};

export default ApplicationsTable;
