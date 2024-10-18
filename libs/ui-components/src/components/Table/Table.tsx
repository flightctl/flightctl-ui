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
  // "hasBackendFilters" used when only Backend filters are used
  // "emptyUiFilters used when some UI filters are used (To be removed when all filters are applied via the API)
  hasBackendFilters?: boolean;
  emptyUiFilters?: boolean;
  emptyData?: boolean;
  'aria-label': string;
  getSortParams: (columnIndex: number) => ThProps['sort'];
  onSelectAll?: (isSelected: boolean) => void;
  isAllSelected?: boolean;
};

type TableFC = <D>(props: TableProps<D>) => JSX.Element;

const Table: TableFC = ({
  columns,
  children,
  loading,
  hasBackendFilters,
  emptyUiFilters,
  emptyData,
  getSortParams,
  onSelectAll,
  isAllSelected,
  ...rest
}) => {
  const { t } = useTranslation();
  if (loading && emptyData) {
    return <Spinner size="md" />;
  }

  if ((emptyData && hasBackendFilters) || (emptyUiFilters && !emptyData)) {
    return (
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
              select={{
                onSelect: (_event, isSelecting) => onSelectAll(isSelecting),
                isSelected: !!isAllSelected,
              }}
            />
          )}
          {columns.map((c, index) => (
            <Th key={c.name} sort={getSortParams(index)} {...c.thProps}>
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
