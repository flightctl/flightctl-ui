import { Button, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItemList } from '@flightctl/types/alpha';

import TableTextSearch from '../Table/TableTextSearch';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { CatalogFilter } from './useCatalogFilter';
import TablePagination from '../Table/TablePagination';
import { PaginationDetails } from '../../hooks/useTablePagination';

type CatalogPageToolbarProps = CatalogFilter & {
  pagination: PaginationDetails<CatalogItemList>;
  isUpdating: boolean;
  showCatalogMgmt: boolean;
};

const CatalogPageToolbar: React.FC<CatalogPageToolbarProps> = ({
  nameFilter,
  setNameFilter,
  pagination,
  isUpdating,
  showCatalogMgmt,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Toolbar inset={{ default: 'insetNone' }}>
      <ToolbarContent>
        <ToolbarItem>
          <TableTextSearch value={nameFilter} setValue={setNameFilter} placeholder={t('Search by name')} />
        </ToolbarItem>
        {showCatalogMgmt && (
          <ToolbarItem>
            <Button variant="primary" onClick={() => navigate(ROUTE.CATALOG_ADD_ITEM)}>
              {t('Create item')}
            </Button>
          </ToolbarItem>
        )}
        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
          <TablePagination pagination={pagination} isUpdating={isUpdating} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default CatalogPageToolbar;
