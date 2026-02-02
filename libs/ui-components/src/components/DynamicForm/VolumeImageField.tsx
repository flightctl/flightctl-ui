import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Content,
  ContentVariants,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Flex,
  FlexItem,
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
  Title,
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
import { getCatalogItemIcon, getFullReferenceURI } from '../Catalog/utils';
import FieldErrors from './FieldErrors';
import { DynamicFormContext } from './DynamicForm';
import { useTranslation } from '../../hooks/useTranslation';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import { CatalogItemDetailsContent, getDefaultChannelAndVersion } from '../Catalog/CatalogItemDetails';
import { Formik } from 'formik';
import { InstallSpec, InstallSpecFormik } from '../Catalog/InstallWizard/steps/SpecificationsStep';
import FlightCtlForm from '../form/FlightCtlForm';
import { useCatalogItems } from '../Catalog/useCatalogs';
import { PaginationDetails } from '../../hooks/useTablePagination';
import { getErrorMessage } from '../../utils/error';
import ResourceListEmptyState from '../common/ResourceListEmptyState';

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
            <Split hasGutter>
              <SplitItem>
                <img src={getCatalogItemIcon(item)} alt={`${item.metadata.name} icon`} style={{ maxWidth: '60px' }} />
              </SplitItem>
              <SplitItem>
                <Title headingLevel="h1">{item.spec.displayName || item.metadata.name}</Title>
                <Content component={ContentVariants.small}>
                  {t('Provided by {{provider}}', { provider: item.spec.provider })}
                </Content>
              </SplitItem>
            </Split>
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
 * Extract the volume index from the field ID.
 * Field ID format: "root_volumes_0_image" -> extracts index 0
 */
const getVolumeIndexFromId = (fieldId: string): number => {
  const match = fieldId.match(/_(\d+)_image$/);
  return match ? parseInt(match[1], 10) : -1;
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
      <FormGroup fieldId={idSchema.$id} label={schema.title || t('Image')}>
        {schema.description && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="default">{schema.description}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
        {assetItem ? (
          <Split hasGutter>
            <SplitItem isFilled>
              <Flex alignItems={{ default: 'alignItemsCenter' }} alignContent={{ default: 'alignContentCenter' }}>
                <FlexItem>
                  <img
                    src={getCatalogItemIcon(assetItem)}
                    alt={`${assetItem.metadata.name} icon`}
                    style={{ maxWidth: '30px' }}
                  />
                </FlexItem>
                <FlexItem>
                  <Stack>
                    <StackItem>
                      <Title headingLevel="h3">{assetItem.spec.displayName || assetItem.metadata.name}</Title>
                    </StackItem>
                    <StackItem>
                      <Content component={ContentVariants.small}>
                        Version: {selectedAssets[volumeIndex].assetVersion}, Channel{' '}
                        {selectedAssets[volumeIndex].assetChannel}
                      </Content>
                    </StackItem>
                  </Stack>
                </FlexItem>
              </Flex>
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
        <FieldErrors errors={rawErrors} />
      </FormGroup>

      {isModalOpen && <SelectAssetModal onClose={() => setIsModalOpen(false)} onSelect={onSelect} />}
    </>
  );
};

export default VolumeImageField;
