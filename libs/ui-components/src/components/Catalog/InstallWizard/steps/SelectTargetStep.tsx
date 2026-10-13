import * as React from 'react';
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
import type { TFunction } from 'react-i18next';
import { Tbody, Td } from '@patternfly/react-table';
import { type FormikErrors, useFormikContext } from 'formik';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import type { Device, Fleet, ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { type CatalogItem, CatalogItemType } from '@flightctl/types/alpha';

import { useAppLinks } from '../../../../hooks/useAppLinks';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getFullArtifactURI } from '../../../../utils/catalog';
import { getArtifactLabel } from '../../../../utils/catalogTypes';
import { getResourceId } from '../../../../utils/resource';
import { OS_EXCLUDE_PACKAGE_MODE_FILTERS } from '../../../../utils/status/devices';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { useDevicesPaginated } from '../../../Device/DevicesPage/useDevices';
import EnrolledDeviceTableRow from '../../../Device/DevicesPage/EnrolledDeviceTableRow';
import FleetRow from '../../../Fleet/FleetRow';
import { getFleetTableColumns } from '../../../Fleet/FleetsPage';
import { useFleets } from '../../../Fleet/useFleets';
import FlightCtlForm from '../../../form/FlightCtlForm';
import FormSelect from '../../../form/FormSelect';
import {
  getApplicationStatusHelperText,
  getDeviceStatusHelperText,
  getUpdateStatusHelperText,
} from '../../../Status/utils';
import Table from '../../../Table/Table';
import TablePagination from '../../../Table/TablePagination';
import TableTextSearch from '../../../Table/TableTextSearch';
import DeviceFeatureCompatibility from '../DeviceFeatureCompatibility';
import type { InstallAppFormik, InstallOsFormik, InstallSpecFormik, TargetPickerFormik } from '../types';
import { isSameCatalogRef } from '../utils';
import CatalogFeatureRequirements from '../../CatalogFeatureRequirements';

export const isSelectTargetStepValid = (errors: FormikErrors<InstallAppFormik>) => {
  return !errors.device && !errors.fleet;
};

type TargetSelectedFn = (targetSpec: ImageOrCatalogItemRefSpec | undefined) => void;

const getDeviceTableColumns = (t: TFunction) => [
  {
    id: 'alias',
    name: t('Alias'),
  },
  {
    id: 'name',
    name: t('Name'),
  },
  {
    id: 'compatibility',
    name: t('Compatibility'),
    helperText: t("Shows whether this device meets the catalog item's requirements."),
  },
  {
    id: 'appStatus',
    name: t('Application status'),
    helperText: getApplicationStatusHelperText(t),
  },
  {
    id: 'deviceStatus',
    name: t('Device status'),
    helperText: getDeviceStatusHelperText(t),
  },
  {
    id: 'updateStatus',
    name: t('Update status'),
    helperText: getUpdateStatusHelperText(t),
  },
];

const DeviceTarget = ({ isOsItem, onTargetSelected }: { isOsItem: boolean; onTargetSelected: TargetSelectedFn }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<InstallSpecFormik & TargetPickerFormik>();
  const [deviceNameFilter, setDeviceNameFilter] = React.useState('');

  const {
    devices,
    isLoading: devicesLoading,
    isUpdating: devicesUpdating,
    pagination: devicePagination,
  } = useDevicesPaginated({
    deviceNameFilter,
    selectedFeatures: isOsItem ? OS_EXCLUDE_PACKAGE_MODE_FILTERS : undefined,
  });

  const handleDeviceSelect = React.useCallback(
    async (device: Device) => {
      await setFieldValue('device', device);
      await setFieldValue('fleet', undefined);
      await setFieldTouched('device', true);
    },
    [setFieldValue, setFieldTouched],
  );

  const deviceColumns = React.useMemo(() => {
    return getDeviceTableColumns(t);
  }, [t]);

  const isDeviceSelected = React.useCallback(
    (device: Device) => values.device?.metadata.name === device.metadata.name,
    [values.device?.metadata.name],
  );

  return (
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
                onRowSelect={(device) => async () => {
                  await handleDeviceSelect(device);
                  onTargetSelected(device.spec?.os);
                }}
                isRowSelected={isDeviceSelected}
                rowIndex={index}
                singleSelect
                hideActions
                deviceColumns={deviceColumns}
              >
                <Td dataLabel={t('Compatibility')}>
                  <DeviceFeatureCompatibility device={device} featureRequirements={values.featureRequirements} />
                </Td>
              </EnrolledDeviceTableRow>
            ))}
          </Tbody>
        </Table>
      </StackItem>
    </Stack>
  );
};

const FleetTarget = ({ onTargetSelected }: { onTargetSelected: TargetSelectedFn }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<InstallSpecFormik & TargetPickerFormik>();

  const [fleetNameFilter, setFleetNameFilter] = React.useState('');
  const fleetName = values.fleet?.metadata.name as string;

  const {
    fleets,
    isLoading: fleetsLoading,
    isUpdating: fleetsUpdating,
    pagination: fleetPagination,
  } = useFleets({
    name: fleetNameFilter || undefined,
    onlyUnmanaged: true,
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

  const isFleetSelected = React.useCallback((fleet: Fleet) => fleetName === fleet.metadata.name, [fleetName]);

  return (
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
                onRowSelect={(fleet) => async () => {
                  await handleFleetSelect(fleet);
                  onTargetSelected(fleet.spec.template.spec?.os);
                }}
                singleSelect
                hideActions
              />
            ))}
          </Tbody>
        </Table>
      </StackItem>
    </Stack>
  );
};

const PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

type NewDeviceTargetProps = {
  catalogItem: CatalogItem;
};

const NewDeviceTarget = ({ catalogItem }: NewDeviceTargetProps) => {
  const { t } = useTranslation();
  const provisionDeviceLink = useAppLinks('provisionDevice');
  const { values, setFieldValue } = useFormikContext<InstallOsFormik>();

  const artifacts = React.useMemo(() => {
    const versionRefs = catalogItem.spec.versions.find((v) => v.version === values.version)?.references || {};
    const specArtifacts = catalogItem.spec.artifacts || [];
    return [...specArtifacts]
      .sort((a, b) => getArtifactLabel(t, a).localeCompare(getArtifactLabel(t, b)))
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

  const hasProtocol = PROTOCOL_REGEX.test(artifactUrl || '');

  return (
    <FlightCtlForm>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">{t('Deployment specifications')}</Title>
        </GridItem>
        <GridItem>
          <FormGroup label={t('Deployment target')} isRequired>
            <FormSelect
              name="deploymentTarget"
              items={
                artifacts.length
                  ? artifacts.reduce((acc, curr) => {
                      acc[curr.type] = {
                        label: getArtifactLabel(t, curr),
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
                href={hasProtocol ? artifactUrl : `docker://${artifactUrl}`}
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

const SelectTargetStepContent = ({
  catalogItem,
  target,
  onTargetSelected,
}: {
  catalogItem: CatalogItem;
  target: TargetPickerFormik['target'];
  onTargetSelected: TargetSelectedFn;
}) => {
  switch (target) {
    case 'device':
      return (
        <DeviceTarget
          isOsItem={catalogItem.spec.type === CatalogItemType.CatalogItemTypeOS}
          onTargetSelected={onTargetSelected}
        />
      );
    case 'fleet':
      return <FleetTarget onTargetSelected={onTargetSelected} />;
    default:
      return <NewDeviceTarget catalogItem={catalogItem} />;
  }
};

const SelectTargetStep = ({ catalogItem }: SelectTargetStepProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<InstallOsFormik>();

  const onTargetSelected = React.useCallback(
    (targetSpec: ImageOrCatalogItemRefSpec | undefined) => {
      setFieldValue(
        'isSpecUnchanged',
        isSameCatalogRef(targetSpec?.catalogItemRef, catalogItem, values.version, values.channel),
      );
    },
    [catalogItem, values.version, values.channel, setFieldValue],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title={t('Device requirements')}>
          <CatalogFeatureRequirements deviceFeatures={values.featureRequirements} />
        </Alert>
      </StackItem>
      <StackItem>
        <SelectTargetStepContent catalogItem={catalogItem} target={values.target} onTargetSelected={onTargetSelected} />
      </StackItem>
    </Stack>
  );
};

export default SelectTargetStep;
