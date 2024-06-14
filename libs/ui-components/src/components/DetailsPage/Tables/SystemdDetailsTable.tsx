import * as React from 'react';
import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { DeviceSystemdUnitStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import SystemdStatus from '../../Device/DeviceDetails/SystemdStatus';

type SystemdDetailsTableProps = {
  matchPatterns?: Array<string>;
  systemdUnits: DeviceSystemdUnitStatus[] | undefined;
};

const SystemdDetailsTable = ({ matchPatterns, systemdUnits }: SystemdDetailsTableProps) => {
  const { t } = useTranslation();
  const hasPatterns = matchPatterns && matchPatterns.length > 0;
  const hasUnits = systemdUnits && systemdUnits.length > 0;

  if (!hasPatterns && !hasUnits) {
    return <Bullseye>{t('No systemd units found')}</Bullseye>;
  }

  const patterns: Record<string, DeviceSystemdUnitStatus> = {};
  matchPatterns?.forEach((pattern) => {
    patterns[pattern] = {
      name: pattern,
      loadState: '',
      activeState: '',
    };
  });
  systemdUnits?.forEach((unit) => {
    const name = unit.name as string;
    patterns[name] = unit;
  });

  return (
    <Table aria-label={t('Device systemd table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.entries(patterns).map(([patternName, systemUnitState]) => {
          return (
            <Tr key={patternName}>
              <Td dataLabel={t('Name')}>{patternName}</Td>
              <Td dataLabel={t('Status')}>
                <SystemdStatus status={systemUnitState.activeState} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SystemdDetailsTable;
