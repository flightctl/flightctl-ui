import { Device, Fleet } from '@flightctl/types';
import {
  Button,
  FormGroup,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { FormikErrors, useFormikContext } from 'formik';
import * as React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons';
import { CatalogItem, CatalogItemArtifact, CatalogItemArtifactType } from '@flightctl/types/alpha';
import { TFunction } from 'i18next';

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
import FormSelect from '../../../form/FormSelect';
import { getFullReferenceURI } from '../../utils';

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

const getArtifactLabel = (artifact: CatalogItemArtifact, t: TFunction) => {
  if (artifact.name) {
    return artifact.name;
  }
  switch (artifact.type) {
    case CatalogItemArtifactType.CatalogItemArtifactTypeQcow2:
      return t('OpenShift Virtualization ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeQcow2 });
    case CatalogItemArtifactType.CatalogItemArtifactTypeIso:
      return t('Bare Metal ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeIso });
    case CatalogItemArtifactType.CatalogItemArtifactTypeAmi:
      return t('Amazon Web Services ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeAmi });
    case CatalogItemArtifactType.CatalogItemArtifactTypeAnacondaIso:
      return t('Anaconda Installer ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeAnacondaIso });
    case CatalogItemArtifactType.CatalogItemArtifactTypeGce:
      return t('Google Cloud ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeGce });
    case CatalogItemArtifactType.CatalogItemArtifactTypeRaw:
      return t('KVM/custom cloud import ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeRaw });
    case CatalogItemArtifactType.CatalogItemArtifactTypeVhd:
      return t('Microsoft Hyper-V ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeVhd });
    case CatalogItemArtifactType.CatalogItemArtifactTypeVmdk:
      return t('VMware vSphere ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeVmdk });
    default:
      return t('Cloud native ({{type}})', { type: CatalogItemArtifactType.CatalogItemArtifactTypeContainer });
  }
};

type NewDeviceTargetProps = {
  catalogItem: CatalogItem;
};

const NewDeviceTarget = ({ catalogItem }: NewDeviceTargetProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<InstallOsFormik>();

  const artifacts = React.useMemo(() => {
    return catalogItem.spec.reference.artifacts?.sort((a, b) =>
      getArtifactLabel(a, t).localeCompare(getArtifactLabel(b, t)),
    );
  }, [catalogItem]);

  React.useEffect(() => {
    if (!values.deploymentTarget && artifacts?.length) {
      setFieldValue('deploymentTarget', artifacts[0].type || artifacts[0].name);
    }
  }, [values, artifacts]);

  const currentDeploymentTarget = values.deploymentTarget
    ? catalogItem.spec.reference.artifacts?.find(
        (a) => a.type === values.deploymentTarget || a.name === values.deploymentTarget,
      )
    : undefined;

  const currentVersion = catalogItem.spec.versions.find((v) => v.version === values.version);

  const artifactUrl =
    currentDeploymentTarget && currentVersion
      ? getFullReferenceURI(currentDeploymentTarget.uri, currentVersion)
      : undefined;

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Installation specifications')}</Title>
        </StackItem>
        <StackItem>
          <FormGroup title={t('Deployment target')} isRequired>
            <FormSelect
              name="deploymentTarget"
              items={
                artifacts
                  ? artifacts.reduce((acc, curr) => {
                      acc[curr.type || curr.name || ''] = {
                        label: getArtifactLabel(curr, t),
                      };
                      return acc;
                    }, {})
                  : {
                      'no-items': {
                        label: t('No items'),
                        isDisabled: true,
                      },
                    }
              }
            />
          </FormGroup>
        </StackItem>
        {artifactUrl && (
          <StackItem>
            <Button
              component="a"
              variant="link"
              isInline
              iconPosition="end"
              icon={<ExternalLinkAltIcon />}
              target="_blank"
              rel="noopener noreferrer"
              href={artifactUrl}
            >
              {artifactUrl}
            </Button>
          </StackItem>
        )}
      </Stack>
    </FlightCtlForm>
  );
};

type SelectTargetStepProps = {
  catalogItem: CatalogItem;
};

const SelectTargetStep = ({ catalogItem }: SelectTargetStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik>();

  switch (values.target) {
    case 'device':
      return <DeviceTarget />;
    case 'fleet':
      return <FleetTarget />;
    default:
      return <NewDeviceTarget catalogItem={catalogItem} />;
  }
};

export default SelectTargetStep;
