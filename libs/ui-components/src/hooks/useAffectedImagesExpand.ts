import * as React from 'react';

import type { TdProps } from '@patternfly/react-table';

export type UseAffectedImagesExpandArgs = {
  columnIndex: number;
};

export type UseAffectedImagesExpandResult = {
  expandedRowKey: string | null;
  isExpandedForRowKey: (rowExpansionKey: string) => boolean;
  getCompoundExpand: (rowExpansionKey: string, rowIndex: number) => TdProps['compoundExpand'] | undefined;
};

export const useAffectedImagesExpand = ({
  columnIndex,
}: UseAffectedImagesExpandArgs): UseAffectedImagesExpandResult => {
  const [expandedRowKey, setExpandedRowKey] = React.useState<string | null>(null);

  const getCompoundExpand = React.useCallback(
    (rowExpansionKey: string, rowIndex: number) => {
      return {
        isExpanded: expandedRowKey === rowExpansionKey,
        onToggle: () => setExpandedRowKey((current) => (current === rowExpansionKey ? null : rowExpansionKey)),
        expandId: `vuln-images-${rowExpansionKey}`,
        rowIndex,
        columnIndex,
      };
    },
    [columnIndex, expandedRowKey],
  );

  const isExpandedForRowKey = React.useCallback(
    (rowExpansionKey: string) => expandedRowKey === rowExpansionKey,
    [expandedRowKey],
  );

  return {
    expandedRowKey,
    getCompoundExpand,
    isExpandedForRowKey,
  };
};
