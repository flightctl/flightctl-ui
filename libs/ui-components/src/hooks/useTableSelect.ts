import { getResourceId } from '../utils/resource';
import { OnSelect } from '@patternfly/react-table';
import { ObjectMeta } from '@flightctl/types';
import * as React from 'react';

export const useTableSelect = <R extends { kind: string; metadata: ObjectMeta }>() => {
  const [isAllSelected, setIsAllSelected] = React.useState<boolean>(false);
  // The elements in this "selectedResourceIds" can either be:
  // - included in the selection, when "isAllSelected=false"
  // - excluded from the selection, when "isAllSelected=true"
  const [selectedResourceIds, setSelectedResourceIds] = React.useState<string[]>([]);

  const hasSelectedRows = isAllSelected || selectedResourceIds.length > 0;

  const setAllSelected = (isSelected: boolean) => {
    setIsAllSelected(isSelected);
    setSelectedResourceIds([]);
  };

  const onRowSelect =
    (resource: R): OnSelect =>
    (_, isSelecting) => {
      const resourceId = getResourceId(resource);

      const addElementToList = (isAllSelected && !isSelecting) || (!isAllSelected && isSelecting);
      if (addElementToList) {
        setSelectedResourceIds([...selectedResourceIds, resourceId]);
      } else {
        setSelectedResourceIds(selectedResourceIds.filter((id) => id !== resourceId));
      }
    };

  const isRowSelected = (resource: R) => {
    if (isAllSelected) {
      return !selectedResourceIds.includes(getResourceId(resource));
    } else {
      return selectedResourceIds.includes(getResourceId(resource));
    }
  };

  return {
    onRowSelect,
    hasSelectedRows,
    isAllSelected: isAllSelected && selectedResourceIds.length === 0,
    setAllSelected,
    isRowSelected,
  };
};
