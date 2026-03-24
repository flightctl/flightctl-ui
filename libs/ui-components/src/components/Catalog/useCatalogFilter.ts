import { CatalogItemType } from '@flightctl/types/alpha';
import * as React from 'react';

export type CatalogFilter = {
  nameFilter: string;
  setNameFilter: (name: string) => void;
  itemType: CatalogItemType[];
  setItemType: (type: CatalogItemType[]) => void;
  catalogs: string[];
  setCatalogs: React.Dispatch<React.SetStateAction<string[]>>;
};

export const useCatalogFilter = (): CatalogFilter => {
  const [nameFilter, setNameFilter] = React.useState('');
  const [itemType, setItemType] = React.useState<CatalogItemType[]>([]);
  const [catalogs, setCatalogs] = React.useState<string[]>([]);

  return {
    nameFilter,
    setNameFilter,
    itemType,
    setItemType,
    catalogs,
    setCatalogs,
  };
};
