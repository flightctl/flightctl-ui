import { Bullseye, PageSection } from '@patternfly/react-core';
import { Table as PFTable, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';

export type TableColumn<D> = {
  name: string;
  onSort?: (data: D[]) => D[];
  defaultSort?: boolean;
};

type TableProps<D> = {
  columns: TableColumn<D>[];
  children: React.ReactNode;
  data: D[];
  'aria-label': string;
  getSortParams: (columnIndex: number) => ThProps['sort'];
};

type TableFC = <D>(props: TableProps<D>) => JSX.Element;

const Table: TableFC = ({ columns, children, data, getSortParams, ...rest }) => {
  if (!data.length) {
    return (
      <PageSection variant="light">
        <Bullseye>No resources are matching the current filters.</Bullseye>
      </PageSection>
    );
  }

  return (
    <PFTable {...rest}>
      <Thead>
        <Tr>
          {columns.map((c, index) => (
            <Th key={c.name} sort={getSortParams(index)}>
              {c.name}
            </Th>
          ))}
          <Td />
        </Tr>
      </Thead>
      {children}
    </PFTable>
  );
};

export default Table;
