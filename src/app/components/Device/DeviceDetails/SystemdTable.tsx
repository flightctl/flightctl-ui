import { Bullseye, Button, Label, LabelGroup, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Device } from '@types';
import * as React from 'react';
import MatchPatternsModal from '../MatchPatternsModal/MatchPatternsModal';
import { PencilAltIcon } from '@patternfly/react-icons';

const SystemdTable = ({ device, refetch }: { device: Device; refetch: VoidFunction }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
              <Button variant="link" icon={<PencilAltIcon />} onClick={() => setIsModalOpen(true)}>
                Edit
              </Button>
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          {device.status?.systemdUnits?.length ? (
            <Table aria-label="Device systemd table">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th modifier="wrap">Loaded state</Th>
                  <Th modifier="wrap">Active state</Th>
                </Tr>
              </Thead>
              <Tbody>
                {device.status.systemdUnits.map((unit) => (
                  <Tr key={unit.name}>
                    <Td dataLabel="Name">{unit.name}</Td>
                    <Td dataLabel="Loaded state">{unit.loadState}</Td>
                    <Td dataLabel="Active state">{unit.activeState}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Bullseye>No systemd units found</Bullseye>
          )}
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
