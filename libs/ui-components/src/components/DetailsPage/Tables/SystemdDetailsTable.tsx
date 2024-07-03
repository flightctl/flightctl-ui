import * as React from 'react';
import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useTranslation } from '../../../hooks/useTranslation';
import SystemdStatus from '../../Status/SystemdStatus';

interface DeviceSystemdUnitStatus {
  name: string;
  status: string;
}

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
      status: '',
    };
  });
  systemdUnits?.forEach((unit) => {
    const name = unit.name;
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
                <SystemdStatus status={systemUnitState.status} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SystemdDetailsTable;
