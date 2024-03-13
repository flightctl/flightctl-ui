import { TableColumn } from '@app/components/Table/Table';
import { ThProps } from '@patternfly/react-table';
import * as React from 'react';

const getDefaultIndex = <D>(columns: TableColumn<D>[]) => {
  const defaultColumnIndex = columns.findIndex((c) => c.defaultSort);
  return defaultColumnIndex === -1 ? 0 : defaultColumnIndex;
};

export const useTableSort = <D>(data: D[], columns: TableColumn<D>[]) => {
  const [activeSortIndex, setActiveSortIndex] = React.useState<number>(getDefaultIndex(columns));
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const getSortParams = React.useCallback(
    (columnIndex: number): ThProps['sort'] =>
      columns[columnIndex].onSort
        ? {
            sortBy: {
              index: activeSortIndex,
              direction: activeSortDirection,
              defaultDirection: 'asc',
            },
            onSort: (_, index, direction) => {
              setActiveSortIndex(index);
              setActiveSortDirection(direction);
            },
            columnIndex,
          }
        : undefined,
    [activeSortIndex, activeSortDirection, columns]
  );

  const sortedData = React.useMemo(() => {
    const sorted = columns[activeSortIndex].onSort?.(data);
    if (activeSortDirection === 'desc') {
      sorted?.reverse();
    }
    return sorted || data;
  }, [columns, data, activeSortIndex, activeSortDirection]);

  return { getSortParams, sortedData };
};
