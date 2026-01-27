import * as React from 'react';
import { Bullseye, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';
import { getAppTypeLabel } from '../../../utils/apps';
import { RUN_AS_DEFAULT_USER } from '../../../types/deviceSpec';

type ApplicationsTableProps = {
  appsStatus: DeviceApplicationStatus[];
};

const ApplicationsTable = ({ appsStatus }: ApplicationsTableProps) => {
  const { t } = useTranslation();

  if (appsStatus.length === 0) {
    return <Bullseye>{t('No applications found')}</Bullseye>;
  }

  return (
    <Table aria-label={t('Device applications table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
          <Th modifier="wrap">{t('Ready')}</Th>
          <Th modifier="wrap">{t('Restarts')}</Th>
          <Th modifier="wrap">{t('Type')}</Th>
          <Th modifier="wrap">{t('Run as user')}</Th>
          <Th modifier="wrap">{t('Embedded')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {appsStatus.map((app) => {
          return (
            <Tr key={app.name}>
              <Td dataLabel={t('Name')}>{app.name}</Td>
              <Td dataLabel={t('Status')}>
                <ApplicationStatus status={app.status} />
              </Td>
              <Td dataLabel={t('Ready')}>{app.ready}</Td>
              <Td dataLabel={t('Restarts')}>{app.restarts}</Td>
              <Td dataLabel={t('Type')}>
                {app.appType ? <Label variant="outline">{getAppTypeLabel(app.appType, t)}</Label> : '-'}
              </Td>
              <Td dataLabel={t('Run as user')}>{app.runAs || RUN_AS_DEFAULT_USER}</Td>
              <Td dataLabel={t('Embedded')}>{app.embedded ? t('Yes') : t('No')}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ApplicationsTable;
