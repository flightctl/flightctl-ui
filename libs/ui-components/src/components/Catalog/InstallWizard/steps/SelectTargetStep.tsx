import { Device, Fleet } from '@flightctl/types';
import {
  Alert,
  Button,
  FormGroup,
  Grid,
  GridItem,
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
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { CatalogItem } from '@flightctl/types/alpha';

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
import FormSelect from '../../../form/FormSelect';
import { getArtifactLabel, getFullArtifactURI } from '../../utils';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { useAppLinks } from '../../../../hooks/useAppLinks';

export const isSelectTargetStepValid = (errors: FormikErrors<InstallAppFormik>) => {
  return !errors.device && !errors.fleet;
};

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
                  isRowSelected={isFleetSelected}
                  onRowSelect={(fleet) => () => handleFleetSelect(fleet)}
                  singleSelect
                  hideActions
                  isSelectDisabled={!!fleet.metadata?.owner}
                />
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

type NewDeviceTargetProps = {
  catalogItem: CatalogItem;
};

const NewDeviceTarget = ({ catalogItem }: NewDeviceTargetProps) => {
  const { t } = useTranslation();
  const provisionDeviceLink = useAppLinks('provisionDevice');
  const { values, setFieldValue } = useFormikContext<InstallOsFormik>();

  const artifacts = React.useMemo(() => {
    const versionRefs = catalogItem.spec.versions.find((v) => v.version === values.version)?.references || {};
    return catalogItem.spec.artifacts
      ?.sort((a, b) => getArtifactLabel(t, a.type, a.name).localeCompare(getArtifactLabel(t, b.type, b.name)))
      .filter((a) => Object.keys(versionRefs).includes(a.type));
  }, [catalogItem, values.version, t]);

  React.useEffect(() => {
    if (!values.deploymentTarget && artifacts.length) {
      setFieldValue('deploymentTarget', artifacts[0].type);
    }
  }, [artifacts, values.deploymentTarget, setFieldValue]);

  const currentVersion = catalogItem.spec.versions.find((v) => v.version === values.version);

  const artifact = artifacts.find((a) => a.type === values.deploymentTarget);

  const artifactUrl = currentVersion && artifact ? getFullArtifactURI(artifact, currentVersion) : undefined;

  return (
    <FlightCtlForm>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">{t('Deployment specifications')}</Title>
        </GridItem>
        <GridItem lg={6} md={8} sm={12}>
          <FormGroup label={t('Deployment target')} isRequired>
            <FormSelect
              name="deploymentTarget"
              items={
                artifacts.length
                  ? artifacts.reduce((acc, curr) => {
                      acc[curr.type] = {
                        label: getArtifactLabel(t, curr.type, curr.name),
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
        </GridItem>
        {artifactUrl && (
          <>
            <GridItem>
              {t('Download your image at')}{' '}
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
            </GridItem>
            <GridItem>
              <Alert isInline variant="info" title={t('Learn more about provisioning devices')}>
                <LearnMoreLink link={provisionDeviceLink} />
              </Alert>
            </GridItem>
          </>
        )}
      </Grid>
    </FlightCtlForm>
  );
};

type SelectTargetStepProps = {
  catalogItem: CatalogItem;
};

const SelectTargetStep = ({ catalogItem }: SelectTargetStepProps) => {
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
