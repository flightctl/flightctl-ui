import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import {
  Alert,
  Button,
  Content,
  EmptyState,
  FormGroup,
  Grid,
  GridItem,
  Label,
  Modal,
  ModalBody,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import * as semver from 'semver';
import ReactMarkdown from 'react-markdown';
import { TFunction } from 'react-i18next';

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
import WithTooltip from '../../../common/WithTooltip';

type VersionDropdownProps = {
  catalogItem: CatalogItem;
  versions: CatalogItemVersion[];
};

export const VersionDropdown = ({ catalogItem, versions }: VersionDropdownProps) => {
  const { setFieldValue } = useFormikContext<InstallSpecFormik>();
  const { t } = useTranslation();
  return (
    <FormSelect
      name="version"
      onChange={(val) => {
        const appConfig = getInitialAppConfig(catalogItem, val);
        applyInitialConfig(setFieldValue, appConfig);
      }}
      items={versions.reduce((acc, v) => {
        return {
          ...acc,
          [v.version]: {
            label: (
              <Split hasGutter>
                <SplitItem>{v.version}</SplitItem>
                {v.deprecation && (
                  <SplitItem>
                    <Label variant="outline" color="orange">
                      {t('Deprecated')}
                    </Label>
                  </SplitItem>
                )}
              </Split>
            ),
            selectedLabel: v.version,
          },
        };
      }, {})}
    />
  );
};

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
        {catalogItem.spec.deprecation && (
          <GridItem>
            <Alert isInline variant="warning" title={t('Deprecated')}>
              {catalogItem.spec.deprecation.message}
            </Alert>
          </GridItem>
        )}
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
            <VersionDropdown catalogItem={catalogItem} versions={channelVersions} />
          </FormGroup>
        </GridItem>
        {!hideReadmeLink && !!currentVersion?.readme && (
          <GridItem span={4}>
            <Button onClick={() => setShowReadme(true)} variant="link">
              {t('Show readme')}
            </Button>
          </GridItem>
        )}
        {currentVersion?.deprecation && (
          <GridItem>
            <Alert isInline variant="warning" title={t('This version is deprecated')}>
              {currentVersion.deprecation.message}
            </Alert>
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

const getFleetDisabledReason = (
  t: TFunction,
  { canEdit, canList, size }: { canEdit: boolean; canList: boolean; size: number },
) => {
  if (!canList) {
    return t('You do not have permissions to list fleets');
  }
  if (!canEdit) {
    return t('You do not have permissions to edit fleets');
  }
  if (size === 0) {
    return t('No fleet is available');
  }
  return undefined;
};

const getDeviceDisabledReason = (
  t: TFunction,
  { canEdit, canList, size }: { canEdit: boolean; canList: boolean; size: number },
) => {
  if (!canList) {
    return t('You do not have permissions to list devices');
  }
  if (!canEdit) {
    return t('You do not have permissions to edit devices');
  }
  if (size === 0) {
    return t('No device is available');
  }
  return undefined;
};

const SpecificationsStep = ({ catalogItem, showNewDevice }: SpecificationsStepProps) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canEditFleet, canListFleet, canEditDevice, canListDevice] = checkPermissions(targetPermissions);
  const fleetRadioRef = React.useRef<HTMLSpanElement>(null);
  const deviceRadioRef = React.useRef<HTMLSpanElement>(null);

  const { fleets, isLoading: fleetsLoading } = useFleets({});
  const { devices, isLoading: devicesLoading } = useDevicesPaginated({
    onlyDecommissioned: false,
    onlyFleetless: true,
  });

  const fleetDisabledReason = getFleetDisabledReason(t, {
    canEdit: canEditFleet,
    canList: canListFleet,
    size: fleets.length,
  });

  const deviceDisabledReason = getDeviceDisabledReason(t, {
    canEdit: canEditDevice,
    canList: canListDevice,
    size: devices.length,
  });

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Deployment specifications')}</Title>
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
              <FormGroup label={t('Target type')} isRequired>
                <Stack hasGutter>
                  <StackItem>
                    <WithTooltip
                      showTooltip={!!fleetDisabledReason}
                      content={fleetDisabledReason}
                      triggerRef={fleetRadioRef}
                    >
                      <RadioField
                        id="fleet-radio"
                        name="target"
                        checkedValue="fleet"
                        label={<span ref={fleetRadioRef}>{t('Existing Fleet')}</span>}
                        description={t('Deploy to all devices in a fleet')}
                        isDisabled={!!fleetDisabledReason}
                      />
                    </WithTooltip>
                  </StackItem>
                  <StackItem>
                    <WithTooltip
                      showTooltip={!!deviceDisabledReason}
                      content={deviceDisabledReason}
                      triggerRef={deviceRadioRef}
                    >
                      <RadioField
                        id="device-radio"
                        name="target"
                        checkedValue="device"
                        label={<span ref={deviceRadioRef}>{t('Existing Device')}</span>}
                        description={t('Deploy to a single fleetless device')}
                        isDisabled={!!deviceDisabledReason}
                      />
                    </WithTooltip>
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
              </FormGroup>
            </>
          )}
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

export default SpecificationsStep;
