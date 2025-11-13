import * as React from 'react';
import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant, Label } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CogIcon } from '@patternfly/react-icons/dist/js/icons/cog-icon';
import { ClockIcon } from '@patternfly/react-icons/dist/js/icons/clock-icon';

import { SystemdUnitStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';

const serviceRegex = /\.service$/;
const timerRegex = /\.timer$/;

const SystemdUnitStatusIcon = ({ unitName }: { unitName: string }) => {
  if (serviceRegex.test(unitName)) {
    return <CogIcon className="pf-v5-u-mr-md" />;
  }
  if (timerRegex.test(unitName)) {
    return <ClockIcon className="pf-v5-u-mr-md" />;
  }
  return null;
};

type SystemdUnitsTableProps = {
  systemdUnitsStatus: SystemdUnitStatus[];
};

const SystemdUnitRow = ({ unitStatus }: { unitStatus: SystemdUnitStatus }) => {
  const { t } = useTranslation();

  return (
    <Tr key={unitStatus.unit}>
      <Td dataLabel={t('Name')}>
        <SystemdUnitStatusIcon unitName={unitStatus.unit} /> {unitStatus.unit}
      </Td>
      <Td dataLabel={t('Enable state')}>
        <Label color="blue" variant="outline">
          {unitStatus.enableState}
        </Label>
      </Td>
      <Td dataLabel={t('Load state')}>
        <Label color="blue" variant="outline">
          {unitStatus.loadState}
        </Label>
      </Td>
      <Td dataLabel={t('Active state')}>
        <Label color="blue" variant="outline">
          {unitStatus.activeState}
        </Label>
      </Td>
      <Td dataLabel={t('Sub state')}>
        <Label color="blue" variant="outline">
          {unitStatus.subState}
        </Label>
      </Td>
    </Tr>
  );
};

// Contrary to applications, we don't show the matchPatterns that were defined in the device spec.
// Since these may contain glob patterns, etc, we can't reliably translate the patterns to a list of units.
const SystemdUnitsTable = ({ systemdUnitsStatus }: SystemdUnitsTableProps) => {
  const { t } = useTranslation();

  return systemdUnitsStatus.length ? (
    <Table aria-label={t('System services table')}>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th modifier="wrap">{t('Enable state')}</Th>
          <Th modifier="wrap">{t('Load state')}</Th>
          <Th modifier="wrap">{t('Active state')}</Th>
          <Th modifier="wrap">{t('Sub state')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {systemdUnitsStatus.map((unitStatus) => {
          return <SystemdUnitRow key={unitStatus.unit} unitStatus={unitStatus} />;
        })}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateBody>
          <p>{t('No system services found')}</p>
          <p className="pf-v5-u-font-size-sm">{t('System services can be configured via the device specification')}</p>
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

export default SystemdUnitsTable;
