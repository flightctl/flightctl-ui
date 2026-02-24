import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  FormGroup,
  FormHelperText,
  Gallery,
  HelperText,
  HelperTextItem,
  Modal,
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
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { CubeIcon } from '@patternfly/react-icons/dist/js/icons/cube-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { FieldProps } from '@rjsf/utils';
import { CatalogItem, CatalogItemList, CatalogItemType, CatalogItemVersion } from '@flightctl/types/alpha';

import PFCatalogItem from '../Catalog/CatalogItem';
import { getFullReferenceURI } from '../Catalog/utils';
import FieldErrors from './FieldErrors';
import { DynamicFormContext } from './DynamicForm';
import { useTranslation } from '../../hooks/useTranslation';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import {
  CatalogItemDetailsContent,
  CatalogItemDetailsHeader,
  getDefaultChannelAndVersion,
} from '../Catalog/CatalogItemDetails';
import { Formik } from 'formik';
import { InstallSpec, InstallSpecFormik } from '../Catalog/InstallWizard/steps/SpecificationsStep';
import FlightCtlForm from '../form/FlightCtlForm';
import { useCatalogItems } from '../Catalog/useCatalogs';
import { PaginationDetails } from '../../hooks/useTablePagination';
import { getErrorMessage } from '../../utils/error';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { CatalogItemTitle } from '../Catalog/InstalledSoftware';

/**
 * Regex for volume image field IDs.
 * Matches IDs like: root_volumes_0_image, root_volumes_1_image, etc.
 * Capture group 1 is the volume index.
 */
export const ROOT_VOLUMES_IMAGE_FIELD_REGEX = /root_volumes_(\d+)_image$/;

/**
 * Extract the volume index from the field ID.
 * Field ID format: "root_volumes_0_image" -> extracts index 0
 */
export const getVolumeIndexFromId = (fieldId: string): number => {
  const match = fieldId.match(ROOT_VOLUMES_IMAGE_FIELD_REGEX);
  return match ? parseInt(match[1], 10) : -1;
};

type SelectAssetModalProps = {
  onClose: VoidFunction;
  onSelect: (item: CatalogItem, version: CatalogItemVersion, channel: string) => void;
};

const SelectAssetModal = ({ onClose, onSelect }: SelectAssetModalProps) => {
  const [selectedAsset, setSelectedAsset] = React.useState<CatalogItem>();
  const [nameFilter, setNameFilter] = React.useState('');
  const { t } = useTranslation();
  const [assetCatalogItems, isLoading, error, pagination, isUpdating] = useCatalogItems({
    itemType: [CatalogItemType.CatalogItemTypeData],
    nameFilter: nameFilter || undefined,
  });

  return (
    <Modal isOpen onClose={onClose} variant="large" aria-label={t('Choose asset from catalog')}>
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
        <CatalogItemList
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
    </Modal>
  );
};

type CatalogItemListProps = {
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

const CatalogItemList = ({
  assetCatalogItems,
  isLoading,
  isUpdating,
  error,
  pagination,
  onSelect,
  onClose,
  nameFilter,
  setNameFilter,
}: CatalogItemListProps) => {
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
            <PFCatalogItem key={asset.metadata.name} catalogItem={asset} onSelect={() => onSelect(asset)} />
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
            <Button onClick={submitForm}>{t('Select')}</Button>
            <Button variant="secondary" onClick={onBack}>
              {t('Back')}
            </Button>
            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </>
      )}
    </Formik>
  );
};

type VolumeImageValue = {
  reference?: string;
};

/**
 * Custom field for rendering volume image selection via Asset catalog items.
 * Displays a text field for image.reference with a button to pick from Asset catalog.
 */
const VolumeImageField: React.FC<FieldProps> = ({
  idSchema,
  schema,
  formData,
  onChange,
  rawErrors,
  formContext,
  disabled,
  readonly,
  required,
}) => {
  const { t } = useTranslation();
  const { onAssetSelected, selectedAssets, onAssetCleared } = formContext as DynamicFormContext;
  const value = (formData as VolumeImageValue) || {};
  const volumeIndex = getVolumeIndexFromId(idSchema.$id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleTextChange = (_event: React.FormEvent<HTMLInputElement>, newReference: string) => {
    onChange({ ...value, reference: newReference });
  };

  const onSelect = (item: CatalogItem, version: CatalogItemVersion, channel: string) => {
    const reference = getFullReferenceURI(item.spec.reference.uri, version);
    onAssetSelected({
      volumeIndex,
      assetChannel: channel,
      assetVersion: version.version,
      assetItem: item,
      assetCatalog: item.metadata.catalog,
      assetItemName: item.metadata.name || '',
    });
    onChange({ ...value, reference });
  };

  const hasErrors = !!rawErrors?.length;

  const assetItem = selectedAssets[volumeIndex] && selectedAssets[volumeIndex].assetItem;

  return (
    <>
      <FormGroup fieldId={idSchema.$id} label={schema.title || t('Image')} isRequired={required}>
        {assetItem ? (
          <Split hasGutter>
            <SplitItem isFilled>
              <CatalogItemTitle
                item={assetItem}
                channel={selectedAssets[volumeIndex].assetChannel}
                version={selectedAssets[volumeIndex].assetVersion}
              />
            </SplitItem>
            <SplitItem>
              <Button
                aria-label={t('Delete item')}
                variant="link"
                icon={<MinusCircleIcon />}
                iconPosition="start"
                onClick={() => {
                  onAssetCleared(volumeIndex);
                  onChange({ ...value, reference: undefined });
                }}
              />
            </SplitItem>
          </Split>
        ) : (
          <Split hasGutter>
            <SplitItem isFilled>
              <TextInput
                id={idSchema.$id}
                value={value.reference || ''}
                onChange={handleTextChange}
                isDisabled={disabled}
                readOnlyVariant={readonly ? 'default' : undefined}
                validated={hasErrors ? 'error' : 'default'}
                placeholder={t('Enter image reference or choose from catalog')}
              />
            </SplitItem>
            <SplitItem>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)} isDisabled={disabled || readonly}>
                {t('Choose from catalog')}
              </Button>
            </SplitItem>
          </Split>
        )}
        {schema.description && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="default">{schema.description}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
        <FieldErrors errors={rawErrors} />
      </FormGroup>

      {isModalOpen && <SelectAssetModal onClose={() => setIsModalOpen(false)} onSelect={onSelect} />}
    </>
  );
};

export default VolumeImageField;
