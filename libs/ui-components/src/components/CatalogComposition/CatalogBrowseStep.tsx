import * as React from 'react';
import {
  Alert,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { type CatalogItem, CatalogItemType } from '@flightctl/types/alpha';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

import { useTranslation } from '../../hooks/useTranslation';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import FilterSelect, { FilterSelectGroup } from '../form/FilterSelect';
import { allCatalogTypeOptions } from '../../utils/catalogTypes';
import { appTypeIds, useCatalogItems } from '../Catalog/useCatalogItems';
import CatalogItemGallery from '../Catalog/CatalogItemGallery';

const applicationTypeOptions = appTypeIds.filter((type) => type !== CatalogItemType.CatalogItemTypeData);
const osTypeOptions = [CatalogItemType.CatalogItemTypeOS];

export type BrowseMode = 'apps' | 'os';

export type CatalogBrowseStepProps = {
  mode: BrowseMode;
  onSelect: (item: CatalogItem) => void;
};

type AppTypeFiltersProps = {
  selectedAppTypes: CatalogItemType[];
  onSelectAppType: (type: CatalogItemType) => void;
  isUpdating: boolean;
};

const AppTypeFilters = ({ selectedAppTypes, onSelectAppType, isUpdating }: AppTypeFiltersProps) => {
  const { t } = useTranslation();
  const typeOptions = allCatalogTypeOptions(t);
  return (
    <ToolbarItem>
      <FilterSelect
        placeholder={t('Filter by type')}
        selectedFilters={selectedAppTypes.length}
        isFilterUpdating={isUpdating}
      >
        <SelectList>
          <FilterSelectGroup label={t('Application type')}>
            {applicationTypeOptions.map((type) => (
              <SelectOption
                key={type}
                value={type}
                hasCheckbox
                isSelected={selectedAppTypes.includes(type)}
                onClick={() => onSelectAppType(type)}
              >
                {typeOptions[type] || t('Unknown')}
              </SelectOption>
            ))}
          </FilterSelectGroup>
        </SelectList>
      </FilterSelect>
    </ToolbarItem>
  );
};

const CatalogBrowseStep = ({ mode, onSelect }: CatalogBrowseStepProps) => {
  const { t } = useTranslation();
  const isAppsMode = mode === 'apps';

  const [nameFilter, setNameFilter] = React.useState('');
  const [selectedAppTypes, setSelectedAppTypes] = React.useState<CatalogItemType[]>([]);
  // Chips show filters from the last settled search, not live toolbar edits mid-debounce/fetch.
  const [appliedNameFilter, setAppliedNameFilter] = React.useState('');
  const [appliedAppTypes, setAppliedAppTypes] = React.useState<CatalogItemType[]>([]);

  const itemType = React.useMemo(() => {
    if (!isAppsMode) {
      return osTypeOptions;
    }
    return selectedAppTypes.length > 0 ? selectedAppTypes : applicationTypeOptions;
  }, [isAppsMode, selectedAppTypes]);

  const [catalogItems, loading, error, pagination, isUpdating] = useCatalogItems({
    catalogFilter: {
      itemType,
      nameFilter: nameFilter || undefined,
    },
  });

  React.useEffect(() => {
    if (!isUpdating) {
      setAppliedNameFilter(nameFilter);
      setAppliedAppTypes(selectedAppTypes);
    }
    // Commit only when a search settles; ignore live filter edits while updating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdating]);

  const toggleAppType = (type: CatalogItemType) => {
    setSelectedAppTypes((current) =>
      current.includes(type) ? current.filter((entry) => entry !== type) : [...current, type],
    );
  };

  const clearNameFilter = () => {
    setNameFilter('');
    setAppliedNameFilter('');
  };

  const clearAppTypes = () => {
    setSelectedAppTypes([]);
    setAppliedAppTypes([]);
  };

  const removeAppType = (type: CatalogItemType) => {
    setSelectedAppTypes((current) => current.filter((entry) => entry !== type));
    setAppliedAppTypes((current) => current.filter((entry) => entry !== type));
  };

  const clearAllFilters = () => {
    setNameFilter('');
    setSelectedAppTypes([]);
    setAppliedNameFilter('');
    setAppliedAppTypes([]);
  };

  const onNameFilterChange = (value: string) => {
    setNameFilter(value);
    if (value === '') {
      setAppliedNameFilter('');
    }
  };

  const hasTypeFilter = isAppsMode && appliedAppTypes.length > 0;
  const hasFilters = Boolean(appliedNameFilter || hasTypeFilter);
  const hasCatalogItems = catalogItems.length > 0;
  const catalogTypeOptions = allCatalogTypeOptions(t);

  return (
    <Stack>
      <StackItem>
        <Toolbar inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarItem>
              <TableTextSearch value={nameFilter} setValue={onNameFilterChange} placeholder={t('Search by name')} />
            </ToolbarItem>
            {isAppsMode && (
              <AppTypeFilters
                selectedAppTypes={selectedAppTypes}
                onSelectAppType={toggleAppType}
                isUpdating={isUpdating}
              />
            )}
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <TablePagination pagination={pagination} isUpdating={isUpdating} />
            </ToolbarItem>
          </ToolbarContent>
          {hasFilters && (
            <ToolbarItem className="pf-v6-u-mb-md">
              <Flex>
                {appliedNameFilter && (
                  <FlexItem>
                    <LabelGroup categoryName={t('Name')} isClosable onClick={clearNameFilter}>
                      <Label variant="outline" onClose={clearNameFilter}>
                        {appliedNameFilter}
                      </Label>
                    </LabelGroup>
                  </FlexItem>
                )}
                {hasTypeFilter && (
                  <FlexItem>
                    <LabelGroup categoryName={t('Application type')} isClosable onClick={clearAppTypes}>
                      {appliedAppTypes.map((type) => (
                        <Label variant="outline" key={type} onClose={() => removeAppType(type)}>
                          {catalogTypeOptions[type] || t('Unknown')}
                        </Label>
                      ))}
                    </LabelGroup>
                  </FlexItem>
                )}
                <FlexItem>
                  <Button variant="link" isInline onClick={clearAllFilters}>
                    {t('Clear all filters')}
                  </Button>
                </FlexItem>
              </Flex>
            </ToolbarItem>
          )}
        </Toolbar>
      </StackItem>

      {error != null && (
        <StackItem>
          <Alert variant="danger" title={t('Failed to load catalog items')} isInline />
        </StackItem>
      )}
      {(loading || (isUpdating && !hasCatalogItems)) && (
        <StackItem>
          <EmptyState
            titleText={isAppsMode ? t('Searching applications') : t('Searching operating systems')}
            headingLevel="h4"
            icon={Spinner}
          />
        </StackItem>
      )}
      {!loading && !hasCatalogItems && !isUpdating && (
        <StackItem>
          {hasFilters ? (
            <EmptyState headingLevel="h4" icon={SearchIcon} titleText={t('No results found')} variant="full">
              <EmptyStateBody>{t('Clear all filters and try again.')}</EmptyStateBody>
              <EmptyStateActions>
                <Button variant="link" onClick={clearAllFilters}>
                  {t('Clear all filters')}
                </Button>
              </EmptyStateActions>
            </EmptyState>
          ) : (
            <Alert variant="info" title={t('No items available')} isInline>
              {t('No catalog items are available in this category')}
            </Alert>
          )}
        </StackItem>
      )}
      {!loading && hasCatalogItems && (
        <StackItem>
          <CatalogItemGallery catalogItems={catalogItems} onSelect={onSelect} />
        </StackItem>
      )}
    </Stack>
  );
};

export default CatalogBrowseStep;
