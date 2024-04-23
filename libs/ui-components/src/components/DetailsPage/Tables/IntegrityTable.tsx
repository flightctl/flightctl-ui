import { Bullseye } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';

import './IntegrityTable.css';
import { useTranslation } from 'react-i18next';

type IntegrityTableProps = {
  measurements: Record<string, string> | undefined;
};

const IntegrityTable: React.FC<IntegrityTableProps> = ({ measurements }) => {
  const { t } = useTranslation();
  return measurements && Object.keys(measurements).length ? (
    <Table aria-label={t('System integrity table')}>
      <Thead>
        <Tr>
          <Th>{t('Type')}</Th>
          <Th modifier="truncate">{t('Status')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(measurements).map((key) => (
          <Tr key={key}>
            <Td dataLabel={t('Type')}>{key}</Td>
            <Td dataLabel={t('Status')} className="fctl-integrity-value">
              {measurements[key]}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Bullseye>{t('No system integrity measurements found.')}</Bullseye>
  );
};

export default IntegrityTable;
