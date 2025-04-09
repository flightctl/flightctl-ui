import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { Table as PFTable, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from '../../hooks/useTranslation';
import LabelWithHelperText from '../common/WithHelperText';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons';

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
  hasFilters?: boolean;
  emptyData?: boolean;
  clearFilters?: VoidFunction;
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
  hasFilters,
  emptyData,
  clearFilters,
  onSelectAll,
  isAllSelected,
  ...rest
}) => {
  const { t } = useTranslation();
  if (emptyData && hasFilters) {
    return loading ? (
      <Spinner size="md" />
    ) : (
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText={t('No results found')}
          icon={<EmptyStateIcon icon={SearchIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>{t('Clear all filters and try again.')}</EmptyStateBody>
        {clearFilters && (
          <EmptyStateActions>
            <Button variant="link" onClick={clearFilters}>
              {t('Clear all filters')}
            </Button>
          </EmptyStateActions>
        )}
      </EmptyState>
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
                <LabelWithHelperText label={c.name} content={c.helperText} triggerAction="hover" />
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
