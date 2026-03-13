import { Button, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItemList } from '@flightctl/types/alpha';

import TableTextSearch from '../Table/TableTextSearch';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { CatalogFilter } from './useCatalogFilter';
import TablePagination from '../Table/TablePagination';
import { PaginationDetails } from '../../hooks/useTablePagination';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';

const createItemPermissions = [
  { kind: RESOURCE.CATALOG, verb: VERB.LIST },
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.CREATE },
];

export const CreateCatalogItemBtn = () => {
  const { checkPermissions } = usePermissionsContext();
  const [canListCatalog, canCreate] = checkPermissions(createItemPermissions);
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    canCreate &&
    canListCatalog && (
      <Button variant="primary" onClick={() => navigate(ROUTE.CATALOG_ADD_ITEM)}>
        {t('Create item')}
      </Button>
    )
  );
};

const importPermissions = [
  { kind: RESOURCE.RESOURCE_SYNC, verb: VERB.CREATE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.LIST },
];

export const ImportCatalogBtn = () => {
  const { checkPermissions } = usePermissionsContext();
  const [canCreateRs, canListRepo] = checkPermissions(importPermissions);
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    canCreateRs &&
    canListRepo && (
      <Button variant="secondary" onClick={() => navigate(ROUTE.CATALOG_IMPORT)}>
        {t('Import catalogs')}
      </Button>
    )
  );
};

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
  return (
    <Toolbar inset={{ default: 'insetNone' }}>
      <ToolbarContent>
        <ToolbarItem>
          <TableTextSearch value={nameFilter} setValue={setNameFilter} placeholder={t('Search by name')} />
        </ToolbarItem>
        {showCatalogMgmt && (
          <>
            <ToolbarItem>
              <CreateCatalogItemBtn />
            </ToolbarItem>
            <ToolbarItem>
              <ImportCatalogBtn />
            </ToolbarItem>
          </>
        )}
        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
          <TablePagination pagination={pagination} isUpdating={isUpdating} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default CatalogPageToolbar;
