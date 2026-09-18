import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { CubeIcon } from '@patternfly/react-icons/dist/js/icons/cube-icon';

import {
  type CatalogItem,
  type CatalogItemList,
  CatalogItemType,
  type CatalogItemVersion,
} from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import { type PaginationDetails } from '../../hooks/useTablePagination';
import { getErrorMessage } from '../../utils/error';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import FlightCtlModal from '../common/FlightCtlModal';
import { useCatalogItems } from '../Catalog/useCatalogItems';
import CatalogItemGallery from '../Catalog/CatalogItemGallery';
import {
  CatalogItemDetailsContent,
  CatalogItemDetailsHeader,
  getDefaultChannelAndVersion,
} from '../Catalog/CatalogItemDetails';
import type { InstallSpecFormik } from '../Catalog/InstallWizard/types';
import FlightCtlForm from '../form/FlightCtlForm';
import { InstallSpec } from '../Catalog/InstallWizard/steps/SpecificationsStep';

const assetItemTypeFilter = [CatalogItemType.CatalogItemTypeData];

const DataAssetItemDetails = ({
  item,
  onBack,
  onCancel,
  onSelect,
}: {
  item: CatalogItem;
  onBack: VoidFunction;
  onCancel: VoidFunction;
  onSelect: (selectedVersion: CatalogItemVersion, channel: string) => void;
}) => {
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialValues = React.useMemo(() => getDefaultChannelAndVersion(item), []);

  const onSubmit = (values: InstallSpecFormik) => {
    const selectedVersion = item.spec.versions.find((v) => v.version === values.version);
    if (item && selectedVersion) {
      onSelect(selectedVersion, values.channel);
    }
  };

  return (
    <Formik<InstallSpecFormik> initialValues={initialValues} enableReinitialize onSubmit={onSubmit}>
      {({ submitForm }) => (
        <>
          <ModalHeader>
            <CatalogItemDetailsHeader item={item} />
          </ModalHeader>
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                <FlightCtlForm>
                  <InstallSpec catalogItem={item} hideReadmeLink />
                </FlightCtlForm>
              </StackItem>
              <StackItem>
                <Divider />
              </StackItem>
              <StackItem>
                <CatalogItemDetailsContent item={item} />
              </StackItem>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={onBack}>
              {t('Back')}
            </Button>
            <Button onClick={submitForm}>{t('Select')}</Button>
            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </>
      )}
    </Formik>
  );
};

type DataAssetsListProps = {
  assetCatalogItems: CatalogItem[];
  isLoading: boolean;
  isUpdating: boolean;
  error: unknown;
  pagination: PaginationDetails<CatalogItemList>;
  onSelect: (asset: CatalogItem) => void;
  onClose: VoidFunction;
  nameFilter: string;
  setNameFilter: (name: string) => void;
};

const DataAssetsList = ({
  assetCatalogItems,
  isLoading,
  isUpdating,
  error,
  pagination,
  onSelect,
  onClose,
  nameFilter,
  setNameFilter,
}: DataAssetsListProps) => {
  const { t } = useTranslation();
  const hasFilters = !!nameFilter?.trim();

  let modalContent = (
    <>
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
      {assetCatalogItems.length === 0 ? (
        hasFilters ? (
          <EmptyState headingLevel="h4" icon={SearchIcon} titleText={t('No results found')} variant="full">
            <EmptyStateBody>{t('Clear all filters and try again.')}</EmptyStateBody>
            <EmptyStateActions>
              <Button variant="link" onClick={() => setNameFilter('')}>
                {t('Clear all filters')}
              </Button>
            </EmptyStateActions>
          </EmptyState>
        ) : (
          <ResourceListEmptyState icon={CubeIcon} titleText={t('No assets available in catalog')}>
            <EmptyStateBody>
              {t('There are no asset catalog items to choose from. Add assets to your catalogs to select them here.')}
            </EmptyStateBody>
          </ResourceListEmptyState>
        )
      ) : (
        <CatalogItemGallery catalogItems={assetCatalogItems} onSelect={(asset) => onSelect(asset)} />
      )}
    </>
  );

  if (error) {
    modalContent = (
      <Alert variant="danger" title={t('An error occurred')} isInline>
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (isLoading) {
    modalContent = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <>
      <ModalHeader title={t('Choose asset from catalog')} />
      <ModalBody>{modalContent}</ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </>
  );
};

const VolumeImageSelectAssetModal = ({
  onClose,
  onSelect,
}: {
  onClose: VoidFunction;
  onSelect: (item: CatalogItem, version: CatalogItemVersion, channel: string) => void;
}) => {
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = React.useState<CatalogItem>();
  const [nameFilter, setNameFilter] = React.useState('');
  const [assetCatalogItems, isLoading, error, pagination, isUpdating] = useCatalogItems({
    catalogFilter: {
      itemType: assetItemTypeFilter,
      nameFilter,
    },
  });

  return (
    <FlightCtlModal isOpen onClose={onClose} variant="large" aria-label={t('Choose asset from catalog')}>
      {selectedAsset ? (
        <DataAssetItemDetails
          item={selectedAsset}
          onCancel={onClose}
          onBack={() => setSelectedAsset(undefined)}
          onSelect={(version, channel) => {
            onSelect(selectedAsset, version, channel);
            onClose();
          }}
        />
      ) : (
        <DataAssetsList
          onSelect={setSelectedAsset}
          onClose={onClose}
          assetCatalogItems={assetCatalogItems}
          isLoading={isLoading}
          isUpdating={isUpdating}
          error={error}
          pagination={pagination}
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
        />
      )}
    </FlightCtlModal>
  );
};

export default VolumeImageSelectAssetModal;
