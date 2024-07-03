import * as React from 'react';
import { Button, Stack, StackItem } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';

import { Device, TemplateVersion } from '@flightctl/types';
import WithTooltip from '../../common/WithTooltip';
import { getDeviceFleet } from '../../../utils/devices';

import MatchPatternsModal from '../MatchPatternsModal/MatchPatternsModal';
import { useTranslation } from '../../../hooks/useTranslation';
import SystemdDetailsTable from '../../DetailsPage/Tables/SystemdDetailsTable';

type SystemdTableProps = {
  device: Device;
  onSystemdUnitsUpdate: VoidFunction;
  templateVersion?: TemplateVersion;
};

const SystemdTable: React.FC<SystemdTableProps> = ({ device, templateVersion, onSystemdUnitsUpdate }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const disabledEditReason = getDeviceFleet(device.metadata)
    ? t('The device is owned by a fleet and it cannot be edited')
    : '';

  const matchPatterns = templateVersion
    ? templateVersion?.status?.systemd?.matchPatterns
    : device.spec?.systemd?.matchPatterns;
  // There is no status information for systemdunits
  const systemdUnits = [];

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Button
            variant="link"
            icon={<PencilAltIcon />}
            onClick={() => setIsModalOpen(true)}
            isAriaDisabled={!!disabledEditReason}
          >
            <WithTooltip showTooltip={!!disabledEditReason} content={disabledEditReason}>
              <span>{t('Edit')}</span>
            </WithTooltip>
          </Button>
        </StackItem>
        <StackItem>
          <SystemdDetailsTable matchPatterns={matchPatterns} systemdUnits={systemdUnits} />
        </StackItem>
      </Stack>
      {isModalOpen && (
        <MatchPatternsModal
          device={device}
          onClose={(reload) => {
            setIsModalOpen(false);
            reload && onSystemdUnitsUpdate();
          }}
        />
      )}
    </>
  );
};

export default SystemdTable;
