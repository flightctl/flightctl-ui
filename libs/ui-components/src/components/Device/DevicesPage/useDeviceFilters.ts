import { Device } from '@flightctl/types';
import { useTableTextSearch } from '../../../hooks/useTableTextSearch';

const getSearchText = (device: Device) => [device.metadata.name, device.metadata.labels?.alias];

export const useDeviceFilters = (devices: Array<Device>) => {
  const { search, setSearch, filteredData } = useTableTextSearch(devices, getSearchText);

  return {
    filteredData,
    search,
    setSearch,
    hasFiltersEnabled: !!search,
  };
};
