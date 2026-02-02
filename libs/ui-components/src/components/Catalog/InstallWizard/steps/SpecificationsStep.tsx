import { CatalogItem } from '@flightctl/types/alpha';
import {
  Button,
  Content,
  EmptyState,
  FormGroup,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import * as semver from 'semver';
import ReactMarkdown from 'react-markdown';

import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import RadioField from '../../../form/RadioField';
import FormSelect from '../../../form/FormSelect';
import { PermissionCheck, usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';
import { useFleets } from '../../../Fleet/useFleets';
import { useDevicesPaginated } from '../../../Device/DevicesPage/useDevices';
import { applyInitialConfig, getInitialAppConfig } from '../utils';
import { InstallAppFormik } from '../types';

export const isSpecsStepValid = (errors: FormikErrors<InstallAppFormik>) => {
  return !errors.target && !errors.version && !errors.channel;
};

export type InstallSpecFormik = {
  version: string;
  channel: string;
};

export const InstallSpec = ({
  catalogItem,
  hideReadmeLink,
}: {
  catalogItem: CatalogItem;
  hideReadmeLink?: boolean;
}) => {
  const { t } = useTranslation();
  const [showReadme, setShowReadme] = React.useState(false);
  const { values, setFieldValue } = useFormikContext<InstallSpecFormik>();

  const channels = catalogItem.spec.versions.reduce((acc, v) => {
    v.channels.forEach((c) => (acc[c] = c));
    return acc;
  }, {});

  const versions = catalogItem.spec.versions.sort((v1, v2) => semver.compare(v2.version, v1.version));

  const channelVersions = versions.filter((v) => v.channels.includes(values.channel));

  const currentVersion = versions.find((v) => v.version === values.version);

  return (
    <>
      <Grid hasGutter style={{ alignItems: 'flex-end' }}>
        <GridItem span={4}>
          <FormGroup label={t('Channel')}>
            <FormSelect
              name="channel"
              items={channels}
              onChange={(val) => {
                const newChannelVersions = versions.filter((v) => v.channels.includes(val));
                if (!newChannelVersions.some((v) => v.version === values.version)) {
                  const newVersion = newChannelVersions.length ? newChannelVersions[0].version : undefined;
                  setFieldValue('version', newVersion, true);
                  const appConfig = getInitialAppConfig(catalogItem, newVersion);
                  applyInitialConfig(setFieldValue, appConfig);
                }
              }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={4}>
          <FormGroup label={t('Version')}>
            <FormSelect
              name="version"
              onChange={(val) => {
                const appConfig = getInitialAppConfig(catalogItem, val);
                applyInitialConfig(setFieldValue, appConfig);
              }}
              items={channelVersions.reduce((acc, v) => {
                return {
                  ...acc,
                  [v.version]: v.version,
                };
              }, {})}
            />
          </FormGroup>
        </GridItem>
        {!hideReadmeLink && !!currentVersion?.readme && (
          <GridItem span={4}>
            <Button onClick={() => setShowReadme(true)} variant="link">
              {t('Show readme')}
            </Button>
          </GridItem>
        )}
      </Grid>
      {showReadme && currentVersion?.readme && (
        <Modal isOpen onClose={() => setShowReadme(false)} variant="medium">
          <ModalBody>
            <Content>
              <ReactMarkdown>{currentVersion.readme}</ReactMarkdown>
            </Content>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

type SpecificationsStepProps = {
  catalogItem: CatalogItem;
  showNewDevice?: boolean;
};

const targetPermissions: PermissionCheck[] = [
  {
    kind: RESOURCE.FLEET,
    verb: VERB.PATCH,
  },
  {
    kind: RESOURCE.FLEET,
    verb: VERB.LIST,
  },
  {
    kind: RESOURCE.DEVICE,
    verb: VERB.PATCH,
  },
  {
    kind: RESOURCE.DEVICE,
    verb: VERB.LIST,
  },
];

const SpecificationsStep = ({ catalogItem, showNewDevice }: SpecificationsStepProps) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canEditFleet, canListFleet, canEditDevice, canListDevice] = checkPermissions(targetPermissions);

  const { fleets, isLoading: fleetsLoading } = useFleets({});
  const { devices, isLoading: devicesLoading } = useDevicesPaginated({
    onlyDecommissioned: false,
    onlyFleetless: true,
  });

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Install specifications')}</Title>
        </StackItem>
        <StackItem>
          <Grid>
            <GridItem span={6}>
              <InstallSpec catalogItem={catalogItem} />
            </GridItem>
          </Grid>
        </StackItem>
        <StackItem>
          {fleetsLoading || devicesLoading ? (
            <EmptyState titleText={t('Loading targets')} headingLevel="h4" icon={Spinner} />
          ) : (
            <>
              <FormGroup label={t('Target type')} isRequired />
              <Stack hasGutter>
                <StackItem>
                  <RadioField
                    id="fleet-radio"
                    name="target"
                    checkedValue="fleet"
                    label={t('Existing Fleet')}
                    description={t('Install to all devices in a fleet')}
                    isDisabled={!canEditFleet || !canListFleet || !fleets.length}
                  />
                </StackItem>
                <StackItem>
                  <RadioField
                    id="device-radio"
                    name="target"
                    checkedValue="device"
                    label={t('Existing Device')}
                    description={t('Install to a single fleetless device')}
                    isDisabled={!canEditDevice || !canListDevice || !devices.length}
                  />
                </StackItem>
                {showNewDevice && (
                  <StackItem>
                    <RadioField
                      id="new-device-radio"
                      name="target"
                      checkedValue="new-device"
                      label={t('New Device')}
                      description={t('Provision a brand new, unenrolled device')}
                    />
                  </StackItem>
                )}
              </Stack>
            </>
          )}
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

export default SpecificationsStep;
