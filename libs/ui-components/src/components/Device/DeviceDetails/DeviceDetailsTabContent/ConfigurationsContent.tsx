import * as React from 'react';
import { Alert, CardBody, CardTitle, Divider, Spinner, Stack, StackItem } from '@patternfly/react-core';

import type { Device, Fleet } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useDeviceOwnerFleet } from '../../../../hooks/useDeviceOwnerFleet';
import { hasPackageModeCapability } from '../../../../utils/capabilities';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import DetailsPageCard from '../../../DetailsPage/DetailsPageCard';
import DeviceOs from '../DeviceOs';

const DevicePackageModeOsImage = () => {
  const { t } = useTranslation();
  return (
    <CardBody>
      <Stack hasGutter>
        <StackItem className="pf-v6-u-text-color-subtle">{t('System image')}</StackItem>
        <StackItem>
          <Alert
            isInline
            isPlain
            variant="warning"
            title={t(
              "This device uses package-based OS management. The device cannot satisfy its fleet's spec and it will fail to update to newer fleet specs.",
            )}
          />
        </StackItem>
      </Stack>
    </CardBody>
  );
};

const DeviceRunningOsImage = ({
  ownerFleetError,
  specOsImage,
  statusOsImage,
}: {
  ownerFleetError: boolean;
  statusOsImage: string | undefined;
  specOsImage: string | undefined;
}) => {
  const { t } = useTranslation();

  return (
    <CardBody>
      <Stack hasGutter>
        {ownerFleetError ? (
          <StackItem>
            <Alert isInline variant="warning" title={t('OS image status not fully determined')}>
              {t('The device is bound to a fleet, but its OS image status could not be determined.')}
            </Alert>
          </StackItem>
        ) : null}

        <StackItem className="pf-v6-u-text-color-subtle">{t('System image (running)')}</StackItem>
        <StackItem>
          <DeviceOs desiredOsImage={specOsImage} renderedOsImage={statusOsImage} />
        </StackItem>
      </Stack>
    </CardBody>
  );
};

const DeviceOsImageCard = ({
  device,
  ownerFleet,
  ownerFleetError,
}: {
  device: Required<Device>;
  ownerFleet?: Fleet;
  ownerFleetError: unknown;
}) => {
  const deviceSpec = ownerFleet?.spec?.template?.spec || device.spec;
  const isPackageMode = hasPackageModeCapability(device);

  const showPackageModeInfo = isPackageMode && !ownerFleetError;
  if (showPackageModeInfo && !deviceSpec?.os?.image) {
    // There is no conflict since the device can fully satisfy its fleet spec
    return null;
  }

  let content: React.ReactNode = null;
  if (showPackageModeInfo) {
    // Only show this section when the fleet spec could be fetched and it defines an OS image
    content = <DevicePackageModeOsImage />;
  } else {
    content = (
      <DeviceRunningOsImage
        ownerFleetError={!!ownerFleetError}
        specOsImage={deviceSpec?.os?.image}
        statusOsImage={device.status?.os?.image}
      />
    );
  }
  return (
    <>
      {content}
      <Divider />
    </>
  );
};

const ConfigurationsContent = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();

  const configs = device.spec?.config || [];
  const [hasOwnerFleet, ownerFleet, ownerFleetLoading, ownerFleetError] = useDeviceOwnerFleet(device.metadata.owner);

  if (hasOwnerFleet && ownerFleetLoading) {
    return <Spinner />;
  }

  return (
    <DetailsPageCard>
      <CardTitle>{t('Configurations')}</CardTitle>
      <DeviceOsImageCard device={device} ownerFleet={ownerFleet} ownerFleetError={ownerFleetError} />
      <CardBody>
        <Stack hasGutter>
          <StackItem className="pf-v6-u-font-weight-bold">
            {t('Sources ({{size}})', { size: configs.length })}
          </StackItem>
          <StackItem>
            <RepositorySourceList configs={configs} dependencyStatus={device.status.dependencySync} />
          </StackItem>
        </Stack>
      </CardBody>
    </DetailsPageCard>
  );
};

export default ConfigurationsContent;
