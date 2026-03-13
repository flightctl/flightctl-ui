import {
  Alert,
  Bullseye,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Gallery,
  MenuToggle,
  PageSection,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { EllipsisVIcon } from '@patternfly/react-icons/dist/js/icons/ellipsis-v-icon';
import * as React from 'react';
import { Catalog, CatalogItem, CatalogItemCategory, CatalogItemType, CatalogList } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import CatalogItemCard from './CatalogItemCard';
import CatalogPageToolbar, { CreateCatalogItemBtn } from './CatalogPageToolbar';
import { CatalogFilter, useCatalogFilter } from './useCatalogFilter';
import CatalogItemDetails from './CatalogItemDetails';
import { appTypeIds, useCatalogItems } from './useCatalogs';
import ListPageBody from '../ListPage/ListPageBody';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import ListPage from '../ListPage/ListPage';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import DeleteCatalogModal from './DeleteCatalogModal';
import CreateCatalogModal from './AddCatalogItemWizard/CreateCatalogModal';
import WithTooltip from '../common/WithTooltip';
import ResourceSyncImportStatus from '../ResourceSync/ResourceSyncImportStatus';
import { getErrorMessage } from '../../utils/error';
import CatalogLandingPage from './CatalogLandingPage';

import './CatalogPage.css';

type CatalogPageContentProps = {
  canInstall: boolean;
  targetHasOwner?: boolean;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
  showCatalogMgmt?: boolean;
  canEditCatalog?: boolean;
  canDeleteCatalog?: boolean;
  targetSet?: boolean;
  catalogs: Catalog[];
  refetchCatalogs: VoidFunction;
};

type CatalogEmptyStateProps = {
  hasFilters: boolean;
  showCatalogMgmt: boolean;
  isUpdating: boolean;
};

const CatalogEmptyState = ({ hasFilters, showCatalogMgmt, isUpdating }: CatalogEmptyStateProps) => {
  const { t } = useTranslation();

  const noResults = hasFilters || isUpdating;

  return (
    <ResourceListEmptyState icon={SearchIcon} titleText={noResults ? t('No results found') : t('No catalog items yet')}>
      <EmptyStateBody>
        <Stack>
          {noResults ? (
            <StackItem>
              {t('No catalog items match the selected filters or search. Try adjusting the category or search.')}
            </StackItem>
          ) : (
            <>
              <StackItem>
                {t('Catalog items are applications and system images you can deploy to your devices.')}
              </StackItem>
            </>
          )}
        </Stack>
      </EmptyStateBody>
      {!noResults && !isUpdating && showCatalogMgmt && (
        <EmptyStateFooter>
          <EmptyStateActions>
            <CreateCatalogItemBtn />
          </EmptyStateActions>
        </EmptyStateFooter>
      )}
    </ResourceListEmptyState>
  );
};

const CatalogPageFilter = ({ catalogFilter }: { catalogFilter: CatalogFilter }) => {
  const { t } = useTranslation();

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, item: TreeViewDataItem) => {
    const id = item.id as string;

    if (id === CatalogItemCategory.CatalogItemCategoryApplication) {
      if (appTypeIds.every((id) => catalogFilter.itemType.includes(id))) {
        catalogFilter.setItemType(catalogFilter.itemType.filter((id) => !appTypeIds.includes(id)));
      } else {
        const newTypes = catalogFilter.itemType.filter((id) => !appTypeIds.includes(id));
        catalogFilter.setItemType([...newTypes, ...appTypeIds]);
      }
    } else {
      const newTypes = catalogFilter.itemType.includes(id as CatalogItemType)
        ? catalogFilter.itemType.filter((c) => c !== id)
        : [...catalogFilter.itemType, id as CatalogItemType];
      catalogFilter.setItemType(newTypes);
    }
  };

  const osTypeChecked = catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeOS);
  const anyAppTypeChecked = appTypeIds.some((t) => catalogFilter.itemType.includes(t));

  const filterData: TreeViewDataItem[] = [
    {
      name: t('Operating system'),
      id: CatalogItemType.CatalogItemTypeOS,
      checkProps: {
        checked: osTypeChecked,
      },
    },
    {
      name: t('Application'),
      id: CatalogItemCategory.CatalogItemCategoryApplication,
      checkProps: {
        checked: appTypeIds.every((id) => catalogFilter.itemType.includes(id))
          ? true
          : anyAppTypeChecked
            ? null
            : false,
      },
      defaultExpanded: true,
      children: [
        {
          name: t('Container'),
          id: CatalogItemType.CatalogItemTypeContainer,
          checkProps: {
            checked: catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeContainer),
          },
        },
        {
          name: t('Helm'),
          id: CatalogItemType.CatalogItemTypeHelm,
          checkProps: {
            checked: catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeHelm),
          },
        },
        {
          name: t('Quadlet'),
          id: CatalogItemType.CatalogItemTypeQuadlet,
          checkProps: {
            checked: catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeQuadlet),
          },
        },
        {
          name: t('Compose'),
          id: CatalogItemType.CatalogItemTypeCompose,
          checkProps: {
            checked: catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeCompose),
          },
        },
        {
          name: t('Data'),
          id: CatalogItemType.CatalogItemTypeData,
          checkProps: {
            checked: catalogFilter.itemType.includes(CatalogItemType.CatalogItemTypeData),
          },
        },
      ],
    },
  ];

  return <TreeView hasAnimations data={filterData} onCheck={handleCheck} hasCheckboxes />;
};

export const CatalogPageWithInit = (props: Omit<CatalogPageContentProps, 'catalogs' | 'refetchCatalogs'>) => {
  const [catalogList, loading, error, refetch] = useFetchPeriodically<CatalogList>({
    endpoint: 'catalogs',
  });

  const { t } = useTranslation();
  if (error) {
    return (
      <Alert variant="danger" title={t('An error occurred')} isInline>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!catalogList?.items.length) {
    return <CatalogLandingPage />;
  }

  return <CatalogPageContent {...props} catalogs={catalogList.items} refetchCatalogs={refetch} />;
};

const CatalogPageContent = ({
  canInstall,
  targetHasOwner,
  onInstall,
  showCatalogMgmt,
  canEditCatalog,
  canDeleteCatalog,
  targetSet,
  catalogs,
  refetchCatalogs,
}: CatalogPageContentProps) => {
  const [catalogMenuOpen, setCatalogMenuOpen] = React.useState<string>();
  const [selectedItem, setSelectedItem] = React.useState<{ itemName: string; catalog: string }>();
  const [catalogToEdit, setCatalogToEdit] = React.useState<Catalog>();
  const [catalogToDelete, setCatalogToDelete] = React.useState<Catalog>();
  const { t } = useTranslation();
  const catalogFilter = useCatalogFilter();

  const [catalogItems, isLoading, error, pagination, isUpdating, refetch] = useCatalogItems(catalogFilter);

  const item = selectedItem
    ? catalogItems?.find(
        ({ metadata }) => metadata.name === selectedItem.itemName && metadata.catalog === selectedItem.catalog,
      )
    : undefined;

  const filterIsEmpty = catalogFilter.itemType.length === 0;

  return (
    <>
      <ListPageBody error={error} loading={isLoading}>
        <div>
          <CatalogPageToolbar
            {...catalogFilter}
            pagination={pagination}
            isUpdating={isUpdating}
            showCatalogMgmt={!!showCatalogMgmt}
          />
          <PageSection hasBodyWrapper={false} type="wizard">
            <Split hasGutter>
              <SplitItem className="fctl-catalog-page fctl-catalog-page__filters">
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Catalog')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <TreeView
                        hasAnimations
                        onCheck={(_, item) => {
                          catalogFilter.catalogs.includes(item.id || '')
                            ? catalogFilter.setCatalogs((catalogs) => catalogs.filter((c) => c !== item.id || ''))
                            : catalogFilter.setCatalogs((catalogs) => [...catalogs, item.id || '']);
                        }}
                        hasCheckboxes
                        data={catalogs.map((c) => {
                          const canDelete = !c.metadata.owner && canDeleteCatalog;
                          return {
                            name: c.spec.displayName || c.metadata.name || '',
                            id: c.metadata.name || '',
                            checkProps: {
                              checked: !!c.metadata.name && catalogFilter.catalogs.includes(c.metadata.name),
                            },
                            action: showCatalogMgmt ? (
                              <Dropdown
                                isOpen={catalogMenuOpen === c.metadata.name}
                                onOpenChange={(isOpen) => {
                                  if (isOpen) {
                                    setCatalogMenuOpen(c.metadata.name);
                                  } else if (catalogMenuOpen === c.metadata.name) {
                                    setCatalogMenuOpen(undefined);
                                  }
                                }}
                                onSelect={() => setCatalogMenuOpen(undefined)}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    isExpanded={catalogMenuOpen === c.metadata.name}
                                    onClick={() => setCatalogMenuOpen(c.metadata.name)}
                                    variant="plain"
                                    icon={<EllipsisVIcon />}
                                    aria-label={t('Actions dropdown')}
                                  />
                                )}
                              >
                                <DropdownList>
                                  <DropdownItem onClick={() => setCatalogToEdit(c)}>
                                    {!!c.metadata.owner || !canEditCatalog ? t('View') : t('Edit')}
                                  </DropdownItem>
                                  <WithTooltip
                                    showTooltip={!!c.metadata.owner}
                                    content={t(
                                      'This catalog is managed by a resource sync and cannot be directly removed. Either remove the catalog definition from the resource sync configuration, or delete the resource sync first.',
                                    )}
                                  >
                                    <DropdownItem
                                      isAriaDisabled={!canDelete}
                                      onClick={canDelete ? () => setCatalogToDelete(c) : undefined}
                                    >
                                      {t('Remove')}
                                    </DropdownItem>
                                  </WithTooltip>
                                </DropdownList>
                              </Dropdown>
                            ) : undefined,
                          };
                        })}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Category')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <CatalogPageFilter catalogFilter={catalogFilter} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </SplitItem>
              <Divider
                orientation={{
                  default: 'vertical',
                }}
              />
              <SplitItem isFilled className="fctl-catalog-page">
                {!isLoading && catalogItems.length === 0 ? (
                  <CatalogEmptyState
                    hasFilters={!filterIsEmpty || !!catalogFilter.nameFilter}
                    showCatalogMgmt={!!showCatalogMgmt}
                    isUpdating={isUpdating}
                  />
                ) : (
                  <Gallery hasGutter>
                    {catalogItems.map((ci) => (
                      <CatalogItemCard
                        catalogItem={ci}
                        key={`${ci.metadata.catalog}/${ci.metadata.name}`}
                        onSelect={() =>
                          setSelectedItem((val) => {
                            if (!val || val.itemName !== ci.metadata.name || val.catalog !== ci.metadata.catalog) {
                              return {
                                itemName: ci.metadata.name || '',
                                catalog: ci.metadata.catalog,
                              };
                            } else {
                              return undefined;
                            }
                          })
                        }
                      />
                    ))}
                  </Gallery>
                )}
              </SplitItem>
            </Split>
          </PageSection>
        </div>
      </ListPageBody>
      {!!item && (
        <CatalogItemDetails
          onClose={() => setSelectedItem(undefined)}
          item={item}
          canInstall={canInstall}
          targetHasOwner={targetHasOwner}
          onInstall={onInstall}
          refetch={refetch}
          showCatalogMgmt={!!showCatalogMgmt}
          targetSet={!!targetSet}
        />
      )}
      {!!catalogToEdit && (
        <CreateCatalogModal
          catalog={catalogToEdit}
          onClose={() => setCatalogToEdit(undefined)}
          onSuccess={() => {
            setCatalogToEdit(undefined);
            refetchCatalogs();
          }}
        />
      )}
      {!!catalogToDelete && (
        <DeleteCatalogModal
          catalogId={catalogToDelete.metadata.name || ''}
          catalogDisplayName={catalogToDelete.spec.displayName || catalogToDelete.metadata.name || ''}
          onClose={() => setCatalogToDelete(undefined)}
          onDeleteSuccess={() => {
            setCatalogToDelete(undefined);
            refetchCatalogs();
            refetch();
          }}
        />
      )}
    </>
  );
};

const catalogPagePermissions = [
  { kind: RESOURCE.FLEET, verb: VERB.PATCH },
  { kind: RESOURCE.DEVICE, verb: VERB.PATCH },
  { kind: RESOURCE.CATALOG, verb: VERB.PATCH },
  { kind: RESOURCE.CATALOG, verb: VERB.DELETE },
];

const CatalogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canEditFleet, canEditDevice, canEditCatalog, canDeleteCatalog] = checkPermissions(catalogPagePermissions);

  return (
    <>
      <ResourceSyncImportStatus type="catalog" />
      <ListPage title={t('Software Catalog')}>
        <CatalogPageWithInit
          canInstall={canEditFleet || canEditDevice}
          canEditCatalog={canEditCatalog}
          canDeleteCatalog={canDeleteCatalog}
          onInstall={({ item, channel, version }) => {
            const params = new URLSearchParams({
              channel,
              version,
            });
            navigate({
              route: ROUTE.CATALOG_INSTALL,
              postfix: `${item.metadata.catalog}/${item.metadata.name}?${params.toString()}`,
            });
          }}
          showCatalogMgmt
        />
      </ListPage>
    </>
  );
};

export default CatalogPage;
