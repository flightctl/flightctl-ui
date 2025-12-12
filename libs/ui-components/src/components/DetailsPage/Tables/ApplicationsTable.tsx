import * as React from 'react';
import { Bullseye, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';

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
              <Td dataLabel={t('Type')}>{app.appType ? <Label variant="outline">{app.appType}</Label> : '-'}</Td>
              <Td dataLabel={t('Embedded')}>{app.embedded ? t('Yes') : t('No')}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ApplicationsTable;
