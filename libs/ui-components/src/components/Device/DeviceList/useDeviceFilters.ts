import { useTableTextSearch } from '../../../hooks/useTableTextSearch';
import { DeviceLikeResource } from '../../../types/extraTypes';

const getSearchText = (resource: DeviceLikeResource) => [resource.metadata.name, resource.metadata.labels?.alias];

export const useDeviceFilters = (resources: Array<DeviceLikeResource>) => {
  const { search, setSearch, filteredData } = useTableTextSearch(resources, getSearchText);

  return {
    filteredData,
    search,
    setSearch,
    hasFiltersEnabled: !!search,
  };
};
