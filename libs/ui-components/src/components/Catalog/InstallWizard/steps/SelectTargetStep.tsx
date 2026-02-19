import { Device, Fleet } from '@flightctl/types';
import { Stack, StackItem, Title, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { FormikErrors, useFormikContext } from 'formik';
import * as React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import Table from '../../../Table/Table';
import TablePagination from '../../../Table/TablePagination';
import TableTextSearch from '../../../Table/TableTextSearch';
import { getResourceId } from '../../../../utils/resource';
import { useFleets } from '../../../Fleet/useFleets';
import { getFleetTableColumns } from '../../../Fleet/FleetsPage';
import FleetRow from '../../../Fleet/FleetRow';
import { useDevicesPaginated } from '../../../Device/DevicesPage/useDevices';
import { getDeviceTableColumns } from '../../../Device/DevicesPage/EnrolledDevicesTable';
import EnrolledDeviceTableRow from '../../../Device/DevicesPage/EnrolledDeviceTableRow';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { InstallAppFormik, InstallOsFormik } from '../types';
import { ListAction } from '../../../ListPage/types';

export const isSelectTargetStepValid = (errors: FormikErrors<InstallAppFormik>) => {
  return !errors.device && !errors.fleet;
};

const noopListAction: ListAction = () => ({ title: '', onClick: () => {} });

const DeviceTarget = () => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<InstallOsFormik>();
  const [deviceNameFilter, setDeviceNameFilter] = React.useState('');

  const {
    devices,
    isLoading: devicesLoading,
    isUpdating: devicesUpdating,
    pagination: devicePagination,
  } = useDevicesPaginated({
    nameOrAlias: deviceNameFilter || undefined,
    onlyDecommissioned: false,
    onlyFleetless: true,
  });

  const handleDeviceSelect = React.useCallback(
    async (device: Device) => {
      await setFieldValue('device', device);
      await setFieldValue('fleet', undefined);
      await setFieldTouched('device', true);
    },
    [setFieldValue, setFieldTouched],
  );

  const deviceColumns = React.useMemo(() => getDeviceTableColumns(t).filter(({ id }) => id !== 'fleet'), [t]);

  const isDeviceSelected = React.useCallback(
    (device: Device) => values.device?.metadata.name === device.metadata.name,
    [values.device?.metadata.name],
  );

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Select device')}</Title>
        </StackItem>
        <StackItem>
          <Toolbar inset={{ default: 'insetNone' }}>
            <ToolbarContent>
              <ToolbarItem>
                <TableTextSearch
                  value={deviceNameFilter}
                  setValue={setDeviceNameFilter}
                  placeholder={t('Search by name or alias')}
                />
              </ToolbarItem>
              <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                <TablePagination pagination={devicePagination} isUpdating={devicesUpdating} />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Table
            aria-label={t('Enrolled devices table')}
            loading={devicesLoading || devicesUpdating}
            columns={deviceColumns}
            hasFilters={!!deviceNameFilter}
            emptyData={devices.length === 0}
            clearFilters={() => setDeviceNameFilter('')}
            variant="compact"
            singleSelect
          >
            <Tbody>
              {devices.map((device, index) => (
                <EnrolledDeviceTableRow
                  key={device.metadata.name || ''}
                  device={device}
                  onRowSelect={(device) => () => handleDeviceSelect(device)}
                  isRowSelected={isDeviceSelected}
                  rowIndex={index}
                  canEdit={false}
                  canDecommission={false}
                  decommissionAction={noopListAction}
                  canResume={false}
                  resumeAction={noopListAction}
                  singleSelect
                  hideActions
                  deviceColumns={deviceColumns}
                />
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

const FleetTarget = () => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<InstallOsFormik>();
  const [fleetNameFilter, setFleetNameFilter] = React.useState('');

  const {
    fleets,
    isLoading: fleetsLoading,
    isUpdating: fleetsUpdating,
    pagination: fleetPagination,
  } = useFleets({
    name: fleetNameFilter || undefined,
    addDevicesSummary: true,
  });

  const handleFleetSelect = React.useCallback(
    async (fleet: Fleet) => {
      await setFieldValue('fleet', fleet);
      await setFieldValue('device', undefined);
      await setFieldTouched('fleet', true);
    },
    [setFieldValue, setFieldTouched],
  );

  const fleetColumns = React.useMemo(() => getFleetTableColumns(t), [t]);

  const isFleetSelected = React.useCallback(
    (fleet: Fleet) => values.fleet?.metadata.name === fleet.metadata.name,
    [values.fleet?.metadata.name],
  );

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Select fleet')}</Title>
        </StackItem>
        <StackItem>
          <Toolbar inset={{ default: 'insetNone' }}>
            <ToolbarContent>
              <ToolbarItem>
                <TableTextSearch
                  value={fleetNameFilter}
                  setValue={setFleetNameFilter}
                  placeholder={t('Search by name')}
                />
              </ToolbarItem>
              <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                <TablePagination pagination={fleetPagination} isUpdating={fleetsUpdating} />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Table
            aria-label={t('Fleets table')}
            loading={fleetsLoading || fleetsUpdating}
            columns={fleetColumns}
            hasFilters={!!fleetNameFilter}
            emptyData={fleets.length === 0}
            clearFilters={() => setFleetNameFilter('')}
            variant="compact"
            singleSelect
          >
            <Tbody>
              {fleets.map((fleet, rowIndex) => (
                <FleetRow
                  key={getResourceId(fleet)}
                  fleet={fleet}
                  rowIndex={rowIndex}
                  canDelete={false}
                  onDeleteClick={() => {}}
                  isRowSelected={isFleetSelected}
                  onRowSelect={(fleet) => () => handleFleetSelect(fleet)}
                  canEdit={false}
                  singleSelect
                  hideActions
                />
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

const SelectTargetStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik>();
  if (!values.target || values.target === 'new-device') {
    return (
      <FlightCtlForm>
        <p>{t('Select target type in the previous step.')}</p>
      </FlightCtlForm>
    );
  }
  return values.target === 'fleet' ? <FleetTarget /> : <DeviceTarget />;
};

export default SelectTargetStep;
