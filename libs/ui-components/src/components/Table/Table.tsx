import * as React from 'react';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { Table as PFTable, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from '../../hooks/useTranslation';
import WithHelperText from '../common/WithHelperText';

export type ApiSortTableColumn = {
  name: string;
  sortableField?: string;
  defaultSort?: boolean;
  helperText?: string;
  thProps?: Omit<ThProps, 'sort'> & {
    ref?: React.Ref<HTMLTableCellElement> | undefined;
  };
};

export type TableColumn<D> = {
  name: string;
  onSort?: (data: D[]) => D[];
  defaultSort?: boolean;
  helperText?: string;
  thProps?: Omit<ThProps, 'sort'> & {
    ref?: React.Ref<HTMLTableCellElement> | undefined;
  };
};

type TableProps<D> = {
  columns: TableColumn<D>[];
  children: React.ReactNode;
  loading: boolean;
  emptyFilters?: boolean;
  emptyData?: boolean;
  'aria-label': string;
  // getSortParams: (columnIndex: number) => ThProps['sort'];
  onSelectAll?: (isSelected: boolean) => void;
  isAllSelected?: boolean;
};

type TableFC = <D>(props: TableProps<D>) => JSX.Element;

const Table: TableFC = ({
  columns,
  children,
  loading,
  emptyFilters,
  emptyData,
  onSelectAll,
  isAllSelected,
  ...rest
}) => {
  const { t } = useTranslation();
  if (emptyData && !emptyFilters) {
    return loading ? (
      <Spinner size="md" />
    ) : (
      <PageSection variant="light">
        <Bullseye>{t('No resources are matching the current filters.')}</Bullseye>
      </PageSection>
    );
  }

  return (
    <PFTable {...rest}>
      <Thead>
        <Tr>
          {!emptyData && onSelectAll && (
            <Th
              aria-label={t('Select all rows')}
              select={{
                onSelect: (_event, isSelecting) => onSelectAll(isSelecting),
                isSelected: !!isAllSelected,
              }}
            />
          )}
          {columns.map((c) => (
            <Th key={c.name} {...c.thProps} aria-label={c.name}>
              {c.helperText ? (
                <WithHelperText ariaLabel={c.name} showLabel content={c.helperText} triggerAction="hover" />
              ) : (
                c.name
              )}
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
