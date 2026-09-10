import * as React from 'react';
import { ModalBody } from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';

import { useTranslation } from '../../../hooks/useTranslation';
import Table, { type ApiTableColumn } from '../../Table/Table';

type ListPreviewTableProps = {
  columns: ApiTableColumn[];
  isExpandable?: boolean;
};

export const ListPreviewTable = ({
  columns,
  isExpandable,
  children,
}: React.PropsWithChildren<ListPreviewTableProps>) => {
  const { t } = useTranslation();

  return (
    <ModalBody>
      <Table
        aria-label={t('Preview table')}
        loading={false}
        columns={columns}
        emptyData={false}
        variant="compact"
        isExpandable={isExpandable}
      >
        <Tbody>{children}</Tbody>
      </Table>
    </ModalBody>
  );
};
