import * as React from 'react';
import { Button, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getStringListPatches } from '../../../utils/patch';
import { getDeviceFleet } from '../../../utils/devices';
import SystemdUnitsModal from '../SystemdUnitsModal/SystemdUnitsModal';
import ApplicationsTable from '../../DetailsPage/Tables/ApplicationsTable';
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';

type DeviceDetailsTabProps = {
  device: Required<Device>;
  refetch: VoidFunction;
};

const DeviceApplications = ({ device, refetch }: React.PropsWithChildren<DeviceDetailsTabProps>) => {
  const { t } = useTranslation();
  const { patch } = useFetch();
  const [showSystemdModal, setShowSystemdModal] = React.useState<boolean>(false);
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
  const [addedSystemdDates, setAddedSystemdDates] = React.useState<Record<string, number>>({});

  const onClose = (hasChanges?: boolean, addedUnits?: string[]) => {
    if (hasChanges) {
      refetch();
    }
    if (addedUnits?.length) {
      const allAddedUnitDates = { ...addedSystemdDates };
      const addedDate = Date.now();
      addedUnits.forEach((newUnit) => {
        allAddedUnitDates[newUnit] = addedDate;
      });
      setAddedSystemdDates(allAddedUnitDates);
    }
    setShowSystemdModal(false);
  };

  const isManagedDevice = !!getDeviceFleet(device.metadata);
  const trackedSystemdUnits = device.spec?.systemd?.matchPatterns || [];
  const specApps = device.spec?.applications?.map((app) => app.name || app.image) || [];
  const apps = device.status.applications; // includes available systemdUnits

  const deleteSystemdUnit = isManagedDevice
    ? undefined
    : (removedUnit: string) => {
        const updateDeviceSpec = async () => {
          const patches = getStringListPatches(
            '/spec/systemd',
            trackedSystemdUnits,
            trackedSystemdUnits.filter((unit) => unit !== removedUnit),
            (units: string[]) => ({ matchPatterns: units }),
          );
          if (patches.length > 0) {
            setIsUpdating(true);
            await patch(`devices/${device.metadata.name}`, patches);
            refetch();
            setIsUpdating(false);
          }
        };
        void updateDeviceSpec();
      };

  return (
    <DetailsPageCard>
      <CardTitle>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>{t('Applications')}</FlexItem>
          {!isManagedDevice && (
            <FlexItem>
              <Button
                variant="link"
                isDisabled={isUpdating}
                onClick={() => {
                  setShowSystemdModal(true);
                }}
              >
                {t('Track systemd services')}
              </Button>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <DetailsPageCardBody>
        <ApplicationsTable
          appsStatus={apps}
          specApps={specApps}
          specSystemdUnits={trackedSystemdUnits}
          onSystemdDelete={deleteSystemdUnit}
          isUpdating={isUpdating}
          addedSystemdUnitDates={addedSystemdDates}
        />
        {showSystemdModal && <SystemdUnitsModal device={device} onClose={onClose} />}
      </DetailsPageCardBody>
    </DetailsPageCard>
  );
};

export default DeviceApplications;
