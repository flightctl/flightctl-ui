import * as React from 'react';
import { Button, Label, LabelGroup, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { Device } from '@types';
import WithTooltip from '@app/components/common/WithTooltip';
import { getDeviceFleet } from '@app/utils/devices';

import MatchPatternsModal from '../MatchPatternsModal/MatchPatternsModal';
import SystemdDetailsTable from '../../DetailsPage/Tables/SystemdTable';

type SystemdTableProps = { device: Device; refetch: VoidFunction };

const SystemdTable: React.FC<SystemdTableProps> = ({ refetch, device }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const disabledEditReason = getDeviceFleet(device.metadata)
    ? 'The device is owned by a fleet and it cannot be edited'
    : '';
  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter>
            <SplitItem isFilled>
              <LabelGroup numLabels={5}>
                {device.spec.systemd?.matchPatterns?.map((pattern, index) => (
                  <Label key={index} id={`${index}`} color="blue">
                    {pattern}
                  </Label>
                ))}
              </LabelGroup>
            </SplitItem>
            <SplitItem>
              <Button
                variant="link"
                icon={<PencilAltIcon />}
                onClick={() => setIsModalOpen(true)}
                isAriaDisabled={!!disabledEditReason}
              >
                <WithTooltip showTooltip={!!disabledEditReason} content={disabledEditReason}>
                  <span>Edit</span>
                </WithTooltip>
              </Button>
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          <SystemdDetailsTable systemdUnits={device.status?.systemdUnits} />
        </StackItem>
      </Stack>
      {isModalOpen && (
        <MatchPatternsModal
          device={device}
          onClose={(reload) => {
            setIsModalOpen(false);
            reload && refetch();
          }}
        />
      )}
    </>
  );
};

export default SystemdTable;
