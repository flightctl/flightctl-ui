import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Gallery,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import * as React from 'react';
import { CatalogItemCategory, CatalogItemType } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import CatalogItem from './CatalogItem';
import CatalogPageToolbar from './CatalogPageToolbar';
import { CatalogFilter, useCatalogFilter } from './useCatalogFilter';
import CatalogItemDetails from './CatalogItemDetails';
import { appTypeIds, useCatalogItems } from './useCatalogs';
import ListPageBody from '../ListPage/ListPageBody';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import ListPage from '../ListPage/ListPage';

import './CatalogPage.css';

type CatalogPageContentProps = {
  canInstall: boolean;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
  selectedItem:
    | {
        catalog: string;
        itemName: string;
      }
    | undefined;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<
      | {
          itemName: string;
          catalog: string;
        }
      | undefined
    >
  >;
};

type CatalogEmptyStateProps = {
  hasFilters: boolean;
};

const CatalogEmptyState = ({ hasFilters }: CatalogEmptyStateProps) => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState
      icon={SearchIcon}
      titleText={hasFilters ? t('No results found') : t('No catalog items yet')}
    >
      <EmptyStateBody>
        <Stack>
          {hasFilters ? (
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
      {!hasFilters && (
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="link"
              component="a"
              href="https://docs.flightctl.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Learn about catalogs')}
            </Button>
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

export const CatalogPageContent = ({
  canInstall,
  onInstall,
  selectedItem,
  setSelectedItem,
}: CatalogPageContentProps) => {
  const { t } = useTranslation();

  const catalogFilter = useCatalogFilter();

  const [catalogItems, isLoading, error, pagination, isUpdating] = useCatalogItems(catalogFilter);

  const item = selectedItem
    ? catalogItems?.find(
        ({ metadata }) => metadata.name === selectedItem.itemName && metadata.catalog === selectedItem.catalog,
      )
    : undefined;

  const filterIsEmpty = !catalogFilter.itemType;

  return (
    <>
      <ListPageBody error={error} loading={isLoading}>
        <div>
          <CatalogPageToolbar {...catalogFilter} pagination={pagination} isUpdating={isUpdating} />
          <PageSection hasBodyWrapper={false} type="wizard">
            <Split hasGutter>
              <SplitItem className="fctl-catalog-page">
                <DescriptionList>
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
                  <CatalogEmptyState hasFilters={!filterIsEmpty || !!catalogFilter.nameFilter} />
                ) : (
                  <Gallery hasGutter>
                    {catalogItems.map((ci) => (
                      <CatalogItem
                        catalogItem={ci}
                        key={ci.metadata.name}
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
          onInstall={onInstall}
        />
      )}
    </>
  );
};

const catalogInstallPermissions = [
  { kind: RESOURCE.FLEET, verb: VERB.PATCH },
  { kind: RESOURCE.DEVICE, verb: VERB.PATCH },
];

const CatalogPage = () => {
  const [selectedItem, setSelectedItem] = React.useState<{ itemName: string; catalog: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canEditFleet, canEditDevice] = checkPermissions(catalogInstallPermissions);

  return (
    <ListPage title={t('Catalog')}>
      <CatalogPageContent
        canInstall={canEditFleet || canEditDevice}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
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
      />
    </ListPage>
  );
};

export default CatalogPage;
