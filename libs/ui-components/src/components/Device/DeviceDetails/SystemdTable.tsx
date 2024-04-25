import * as React from 'react';
import { Alert, Button, Label, LabelGroup, Spinner, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';

import { Device } from '@flightctl/types';
import WithTooltip from '../../common/WithTooltip';
import { getDeviceFleet } from '../../../utils/devices';

import MatchPatternsModal from '../MatchPatternsModal/MatchPatternsModal';
import SystemdDetailsTable from '../../DetailsPage/Tables/SystemdTable';
import { getErrorMessage } from '../../../utils/error';
import { useTemplateVersion } from '../../../hooks/useTemplateVersion';
import { useTranslation } from '../../../hooks/useTranslation';

type SystemdTableProps = {
  device: Device;
  onSystemdUnitsUpdate: VoidFunction;
};

const SystemdTable: React.FC<SystemdTableProps> = ({ device, onSystemdUnitsUpdate }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [useTV, tv, isLoading, error] = useTemplateVersion(device);

  const disabledEditReason = getDeviceFleet(device.metadata)
    ? t('The device is owned by a fleet and it cannot be edited')
    : '';

  const matchPatterns = useTV ? tv?.status?.systemd?.matchPatterns : device.spec?.systemd?.matchPatterns;

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter>
            <SplitItem isFilled>
              {isLoading ? (
                <Spinner />
              ) : (
                <LabelGroup numLabels={5}>
                  {matchPatterns?.map((pattern, index) => (
                    <Label key={index} id={`${index}`} color="blue">
                      {pattern}
                    </Label>
                  ))}
                </LabelGroup>
              )}
            </SplitItem>
            <SplitItem>
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
            </SplitItem>
          </Split>
        </StackItem>
        {error ? (
          <StackItem>
            <Alert variant="danger" title={t(`Failed to obtain the systemd units's matchPatterns`)} isInline>
              {getErrorMessage(error)}
            </Alert>
          </StackItem>
        ) : null}
        <StackItem>
          <SystemdDetailsTable systemdUnits={device.status?.systemdUnits} />
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
