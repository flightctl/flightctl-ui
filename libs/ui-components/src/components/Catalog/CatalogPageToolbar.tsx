import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import * as React from 'react';
import TableTextSearch from '../Table/TableTextSearch';
import { useTranslation } from '../../hooks/useTranslation';
import { CatalogFilter } from './useCatalogFilter';
import TablePagination from '../Table/TablePagination';
import { PaginationDetails } from '../../hooks/useTablePagination';
import { CatalogItemList } from '@flightctl/types/alpha';

type CatalogPageToolbarProps = CatalogFilter & {
  pagination: PaginationDetails<CatalogItemList>;
  isUpdating: boolean;
};

const CatalogPageToolbar: React.FC<CatalogPageToolbarProps> = ({
  nameFilter,
  setNameFilter,
  pagination,
  isUpdating,
}) => {
  const { t } = useTranslation();
  return (
    <Toolbar inset={{ default: 'insetNone' }}>
      <ToolbarContent>
        <ToolbarItem>
          <TableTextSearch value={nameFilter} setValue={setNameFilter} placeholder={t('Search by name')} />
        </ToolbarItem>
        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
          <TablePagination pagination={pagination} isUpdating={isUpdating} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default CatalogPageToolbar;
