import * as React from 'react';
import { Bullseye, Button } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';

import './ApplicationsTable.css';

type ApplicationsTableProps = {
  appsStatus: DeviceApplicationStatus[];
  systemdUnits: string[];
  onSystemdDelete?: (deletedUnit: string) => void;
  isUpdating: boolean;
};

const ApplicationsTable = ({ appsStatus, systemdUnits, onSystemdDelete, isUpdating }: ApplicationsTableProps) => {
  const { t } = useTranslation();

  const appsAndSystemdUnits: string[] = [];
  appsStatus.forEach((app) => {
    appsAndSystemdUnits.push(app.name);
  });
  systemdUnits.forEach((systemdUnit) => {
    if (!appsAndSystemdUnits.includes(systemdUnit)) {
      appsAndSystemdUnits.push(systemdUnit);
    }
  });

  return appsAndSystemdUnits.length ? (
    <Table aria-label={t('Device applications table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
          <Th modifier="wrap">{t('Ready')}</Th>
          <Th modifier="wrap">{t('Restarts')}</Th>
          <Th modifier="wrap">{t('Type')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {appsAndSystemdUnits.map((appName) => {
          const appDetails = appsStatus.find((app) => app.name === appName);

          const deleteSystemdUnit = onSystemdDelete && (
            <Button
              aria-label={t('Delete')}
              isDisabled={isUpdating}
              variant="plain"
              icon={<MinusCircleIcon />}
              onClick={() => onSystemdDelete(appName)}
            />
          );

          if (!appDetails) {
            // If a systemd unit has not been detected yet by the agent, or it cannot be detected,
            // it will not be part of the list of applications
            return (
              <Tr key={appName} className="fctl-applications-table__row">
                <Td dataLabel={t('Name')}>{appName}</Td>
                <Td dataLabel={t('Status')} colSpan={3}>
                  {t('Information not available')}
                </Td>
                <Td dataLabel={t('Type')}>
                  {t('Systemd')} {deleteSystemdUnit}
                </Td>
              </Tr>
            );
          }

          let typeColumnContent: React.ReactNode;
          const isApp = !systemdUnits.includes(appName);
          if (isApp) {
            typeColumnContent = t('App');
          } else if (onSystemdDelete) {
            typeColumnContent = (
              <>
                {t('Systemd')} {deleteSystemdUnit}
              </>
            );
          } else {
            typeColumnContent = t('Systemd');
          }

          return (
            <Tr key={appName} className="fctl-applications-table__row">
              <Td dataLabel={t('Name')}>{appName}</Td>
              <Td dataLabel={t('Status')}>
                <ApplicationStatus status={appDetails.status} />
              </Td>
              <Td dataLabel={t('Ready')}>{appDetails.ready}</Td>
              <Td dataLabel={t('Restarts')}>{appDetails.restarts}</Td>
              <Td dataLabel={t('Type')}>{typeColumnContent}</Td>
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
