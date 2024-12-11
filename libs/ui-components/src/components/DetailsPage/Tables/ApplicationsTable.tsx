import * as React from 'react';
import { Bullseye, Button, Spinner } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';

import { DeviceApplicationStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import ApplicationStatus from '../../Status/ApplicationStatus';
import WithTooltip from '../../common/WithTooltip';

import './ApplicationsTable.css';

type ApplicationsTableProps = {
  // Contains the statuses of all detected applications and systemdUnits
  appsStatus: DeviceApplicationStatus[];
  // List of apps as defined the device / fleet spec
  specApps: string[];
  // List of systemd units as defined in the device / fleet spec
  specSystemdUnits: string[];
  // Map: (systemdUnitName, timeItWasAdded)
  addedSystemdUnitDates: Record<string, number>;
  onSystemdDelete?: (deletedUnit: string) => void;
  isUpdating: boolean;
  canEdit: boolean;
};

const DELETE_SYSTED_TIMEOUT = 30000; // 30 seconds

const ApplicationsTable = ({
  appsStatus,
  specApps,
  specSystemdUnits,
  addedSystemdUnitDates,
  onSystemdDelete,
  isUpdating,
  canEdit,
}: ApplicationsTableProps) => {
  const { t } = useTranslation();

  // Required to be able to detect removed systemd units for their correct type.
  // It takes a bit for them to be removed from the applications list.
  const [deletedSystemdUnits, setDeletedSystemdUnits] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Remove a service from the deleted list if it was added back later
    const filtered = deletedSystemdUnits.filter((deletedUnit) => {
      if (addedSystemdUnitDates[deletedUnit]) {
        return false;
      }
      return true;
    });
    if (filtered.length < deletedSystemdUnits.length) {
      setDeletedSystemdUnits(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedSystemdUnitDates]);

  const appsAndSystemdUnits: string[] = [];
  specApps.forEach((app) => {
    appsAndSystemdUnits.push(app);
  });
  specSystemdUnits.forEach((systemdUnit) => {
    appsAndSystemdUnits.push(systemdUnit);
  });
  appsStatus.forEach((appStatus) => {
    if (!appsAndSystemdUnits.includes(appStatus.name)) {
      appsAndSystemdUnits.push(appStatus.name);
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
          const isDeletedSystemdUnit = deletedSystemdUnits.includes(appName);
          const isAddedSystemdUnit = !!addedSystemdUnitDates[appName];
          const isApp =
            specApps.includes(appName) ||
            !(specSystemdUnits.includes(appName) || isDeletedSystemdUnit || isAddedSystemdUnit);

          const deleteSystemdUnit = canEdit && !isDeletedSystemdUnit && onSystemdDelete && (
            <Button
              aria-label={t('Delete')}
              isDisabled={isUpdating}
              variant="plain"
              icon={<MinusCircleIcon />}
              onClick={() => {
                setDeletedSystemdUnits(deletedSystemdUnits.concat(appName));
                onSystemdDelete(appName);
              }}
            />
          );

          if (!appDetails) {
            // It's an app or a systemd unit which has not been reported yet
            const appAddedTime = addedSystemdUnitDates[appName] || 0;
            // For apps there are is no spinner since we don't when the app was added to the spec
            const showSpinner = !isApp && Date.now() - appAddedTime < DELETE_SYSTED_TIMEOUT;
            return (
              <Tr key={appName} className="applications-table__row">
                <Td dataLabel={t('Name')}>{appName}</Td>
                <Td dataLabel={t('Status')} colSpan={3}>
                  {showSpinner ? (
                    <>
                      <Spinner size="sm" /> {t('Waiting for service to be reported...')}
                    </>
                  ) : (
                    t('Information not available yet')
                  )}
                </Td>
                <Td dataLabel={t('Type')}>
                  {isApp ? (
                    <>{t('App')}</>
                  ) : (
                    <>
                      {t('Systemd')} {deleteSystemdUnit}
                    </>
                  )}
                </Td>
              </Tr>
            );
          }

          let typeColumnContent: React.ReactNode;

          if (isApp) {
            typeColumnContent = t('App');
          } else if (onSystemdDelete) {
            let extraContent: React.ReactNode;
            if (isDeletedSystemdUnit) {
              extraContent = (
                <WithTooltip
                  showTooltip
                  content={t('{{ appName }} is being removed, this may take some time.', { appName })}
                >
                  <Spinner size="sm" />
                </WithTooltip>
              );
            } else {
              extraContent = deleteSystemdUnit;
            }

            typeColumnContent = (
              <>
                {t('Systemd')} {extraContent}
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
