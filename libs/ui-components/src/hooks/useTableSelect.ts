import { getResourceId } from '../utils/resource';
import { OnSelect } from '@patternfly/react-table';
import { ObjectMeta } from '@flightctl/types';
import * as React from 'react';

export const useTableSelect = <R extends { kind: string; metadata: ObjectMeta }>(resources: R[]) => {
  const [selectedResources, setSelectedResources] = React.useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isAllSelected) {
      setSelectedResources(resources.map((r) => getResourceId(r)));
    }
  }, [resources, isAllSelected]);

  const setAllSelected = (isSelected: boolean) => {
    setIsAllSelected(isSelected);
    !isSelected && setSelectedResources([]);
  };

  const onRowSelect =
    (resource: R): OnSelect =>
    (_, isSelecting) => {
      const resourceId = getResourceId(resource);
      if (isSelecting) {
        setSelectedResources([...selectedResources, resourceId]);
      } else {
        setSelectedResources(selectedResources.filter((id) => id !== resourceId));
        if (isAllSelected) {
          setAllSelected(false);
        }
      }
    };

  const isRowSelected = (resource: R) => isAllSelected || selectedResources.includes(getResourceId(resource));
  return {
    onRowSelect,
    selectedResources,
    isAllSelected,
    setAllSelected,
    isRowSelected,
  };
};
