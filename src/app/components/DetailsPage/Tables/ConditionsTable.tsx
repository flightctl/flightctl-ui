import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Condition } from '@types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type ConditionsTableProps = {
  conditions: Array<Condition> | undefined;
  ariaLabel: string;
};

const ConditionsTable: React.FC<ConditionsTableProps> = ({ conditions, ariaLabel }) => {
  const { t } = useTranslation();
  return conditions?.length ? (
    <Table aria-label={ariaLabel}>
      <Thead>
        <Tr>
          <Th>{t('Type')}</Th>
          <Th modifier="wrap">{t('Status')}</Th>
          <Th modifier="wrap">{t('Reason')}</Th>
          <Th modifier="wrap">{t('Message')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map((condition) => (
          <Tr key={condition.type}>
            <Td dataLabel={t('Type')}>{condition.type}</Td>
            <Td dataLabel={t('Status')}>{condition.status}</Td>
            <Td dataLabel={t('Reason')}>{condition.reason || '-'}</Td>
            <Td dataLabel={t('Message')}>{condition.message || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No conditions found')}</Bullseye>
  );
};

export default ConditionsTable;
