import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Gallery,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { CubeIcon } from '@patternfly/react-icons/dist/js/icons/cube-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import type { FieldProps } from '@rjsf/utils';

import {
  type CatalogItem,
  type CatalogItemList,
  CatalogItemType,
  type CatalogItemVersion,
} from '@flightctl/types/alpha';

import { type DynamicFormContext } from './DynamicForm';
import { useTranslation } from '../../hooks/useTranslation';
import { usePermissionsContext } from '../common/PermissionsContext';
import { RESOURCE, VERB } from '../../types/rbac';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import {
  CatalogItemDetailsContent,
  CatalogItemDetailsHeader,
  getDefaultChannelAndVersion,
} from '../Catalog/CatalogItemDetails';
import FlightCtlForm from '../form/FlightCtlForm';
import { type PaginationDetails } from '../../hooks/useTablePagination';
import { getErrorMessage } from '../../utils/error';
import { buildCatalogItemRef, formatCatalogItemRef } from '../../utils/catalog';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import FlightCtlModal from '../common/FlightCtlModal';
import { InstallSpec } from '../Catalog/InstallWizard/steps/SpecificationsStep';
import CatalogItemTitle from '../Catalog/CatalogItemTitle';
import { type InstallSpecFormik } from '../Catalog/InstallWizard/types';
import { useCatalogItems } from '../Catalog/useCatalogItems';
import { useResolvedCatalogRef } from '../Catalog/useResolvedCatalogRef';
import CatalogItemCard from '../Catalog/CatalogItemCard';

/**
 * Regex for volume image reference field IDs.
 * Matches IDs like: root_volumes_0_image_reference, root_volumes_1_image_reference, etc.
 * Capture group 1 is the volume index.
 */
export const ROOT_VOLUMES_IMAGE_REFERENCE_FIELD_REGEX = /root_volumes_(\d+)_image_reference$/;

/**
 * Extract the volume index from the field ID.
 * Field ID format: "root_volumes_0_image_reference" -> extracts index 0
 */
export const getVolumeIndexFromId = (fieldId: string): number => {
  const match = fieldId.match(ROOT_VOLUMES_IMAGE_REFERENCE_FIELD_REGEX);
  return match ? parseInt(match[1], 10) : -1;
};

type SelectAssetModalProps = {
  onClose: VoidFunction;
  onSelect: (item: CatalogItem, version: CatalogItemVersion, channel: string) => void;
};

const assetItemTypeFilter = [CatalogItemType.CatalogItemTypeData];

const SelectAssetModal = ({ onClose, onSelect }: SelectAssetModalProps) => {
  const [selectedAsset, setSelectedAsset] = React.useState<CatalogItem>();
  const [nameFilter, setNameFilter] = React.useState('');
  const { t } = useTranslation();
  const [assetCatalogItems, isLoading, error, pagination, isUpdating] = useCatalogItems({
    catalogFilter: {
      itemType: assetItemTypeFilter,
      nameFilter,
    },
  });

  return (
    <FlightCtlModal isOpen onClose={onClose} variant="large" aria-label={t('Choose asset from catalog')}>
      {selectedAsset ? (
        <CatalogItemDetails
          item={selectedAsset}
          onCancel={onClose}
          onBack={() => setSelectedAsset(undefined)}
          onSelect={(version, channel) => {
            onSelect(selectedAsset, version, channel);
            onClose();
          }}
        />
      ) : (
        <AssetsList
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

type AssetsListProps = {
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

const AssetsList = ({
  assetCatalogItems,
  isLoading,
  isUpdating,
  error,
  pagination,
  onSelect,
  onClose,
  nameFilter,
  setNameFilter,
}: AssetsListProps) => {
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
        <Gallery hasGutter>
          {assetCatalogItems.map((asset) => (
            <CatalogItemCard key={asset.metadata.name} catalogItem={asset} onSelect={() => onSelect(asset)} />
          ))}
        </Gallery>
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

const CatalogItemDetails = ({
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

const catalogItemListPermission = [{ kind: RESOURCE.CATALOG_ITEM, verb: VERB.LIST }];

// Setting "reference" to an empty string satisfies JSON Schema `required`, making the field valid.
const VALID_EMPTY_IMAGE_REFERENCE = '';
// Setting "reference" to undefined makes the field invalid, as required validation fails.
const INVALID_EMPTY_IMAGE_REFERENCE = undefined;

/**
 * Custom field for the volume image "reference" property.
 * Renders a text input plus "Choose from catalog" for Asset selection.
 * Used only when the field ID matches root_volumes_N_image_reference.
 * Catalog selections are tracked via "volumeSelection" and persisted as catalogItemRef on submit.
 */
const VolumeImageField = ({ idSchema, formData, onChange, rawErrors, formContext, disabled, readonly }: FieldProps) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canListCatalogItems] = checkPermissions(catalogItemListPermission);
  const { onVolumeSelected, volumeSelection, onVolumeCleared } = formContext as DynamicFormContext;
  const imageReference = typeof formData === 'string' ? formData : '';
  const volumeIndex = getVolumeIndexFromId(idSchema.$id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const currentVolumeSelection = volumeSelection.find((a) => a.volumeIndex === volumeIndex);
  const catalogRef = currentVolumeSelection?.catalogItemRef;
  const catalogItem = useResolvedCatalogRef(catalogRef)?.item;

  const handleTextChange = (_event: React.FormEvent<HTMLInputElement>, newImgValue: string) => {
    if (currentVolumeSelection) {
      onVolumeCleared(volumeIndex);
    }
    onChange(newImgValue === '' ? INVALID_EMPTY_IMAGE_REFERENCE : newImgValue);
  };

  const onSelect = (item: CatalogItem, version: CatalogItemVersion, channel: string) => {
    onVolumeSelected({
      volumeIndex,
      catalogItemRef: buildCatalogItemRef({
        catalogItem: item,
        catalogItemVersion: version,
        channel,
      }),
    });
    // Clear reference so submit path writes catalogItemRef exclusively
    onChange(VALID_EMPTY_IMAGE_REFERENCE);
  };

  const hasErrors = !!rawErrors?.length;

  // Render only the control content; parent FieldTemplate provides the FormGroup label and errors
  return (
    <>
      {catalogRef ? (
        <Split hasGutter>
          <SplitItem isFilled>
            {catalogItem ? (
              <CatalogItemTitle item={catalogItem} channel={catalogRef.channel || ''} version={catalogRef.version} />
            ) : (
              t('Catalog item {{ catalogItemRef }}', {
                catalogItemRef: formatCatalogItemRef(catalogRef),
              })
            )}
          </SplitItem>
          <SplitItem>
            <Button
              aria-label={t('Delete item')}
              variant="link"
              icon={<MinusCircleIcon />}
              iconPosition="start"
              isDisabled={disabled || readonly}
              onClick={() => {
                onVolumeCleared(volumeIndex);
                onChange(INVALID_EMPTY_IMAGE_REFERENCE);
              }}
            />
          </SplitItem>
        </Split>
      ) : (
        <Split hasGutter>
          <SplitItem isFilled>
            <TextInput
              id={idSchema.$id}
              value={imageReference}
              onChange={handleTextChange}
              isDisabled={disabled}
              readOnlyVariant={readonly ? 'default' : undefined}
              validated={hasErrors ? 'error' : 'default'}
              placeholder={t('Enter image reference or choose from catalog')}
            />
          </SplitItem>
          {canListCatalogItems && (
            <SplitItem>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)} isDisabled={disabled || readonly}>
                {t('Choose from catalog')}
              </Button>
            </SplitItem>
          )}
        </Split>
      )}
      {isModalOpen && <SelectAssetModal onClose={() => setIsModalOpen(false)} onSelect={onSelect} />}
    </>
  );
};

export default VolumeImageField;
