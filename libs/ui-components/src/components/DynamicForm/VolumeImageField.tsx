import * as React from 'react';
import { Button, FormGroup, Split, SplitItem, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { CatalogIcon } from '@patternfly/react-icons/dist/js/icons/catalog-icon';
import cloneDeep from 'lodash/cloneDeep';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';

import type { CatalogItemRefSpec, ImagePullPolicy, ImageVolumeSource } from '@flightctl/types';
import { type CatalogItem, type CatalogItemVersion } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import { usePermissionsContext } from '../common/PermissionsContext';
import { RESOURCE, VERB } from '../../types/rbac';
import { buildCatalogItemRef, formatCatalogItemRef } from '../../utils/catalog';
import { useResolvedCatalogRef } from '../Catalog/useResolvedCatalogRef';
import CatalogRefCard from '../CatalogRef/CatalogRefCard';
import VolumeImagePullPolicy, { getPullPolicySchema } from './VolumeImagePullPolicy';
import VolumeImageSelectAssetModal from './VolumeImageSelectAssetModal';

export enum VolumeImageSourceMode {
  // Volume accepts only an image reference
  ImageOnly = 'imageOnly',
  // Volume accepts only a catalog item reference
  CatalogOnly = 'catalogOnly',
  // Volume accepts can use either
  Both = 'both',
}

/**
 * Regex for volume image object field IDs.
 * Matches IDs like: root_volumes_0_image, root_volumes_1_image, etc.
 */
export const ROOT_VOLUMES_IMAGE_FIELD_REGEX = /^root_volumes_(\d+)_image$/;

/** Schema fragment for catalogItemRef, injected when Both-mode schemas omit it. */
export const CATALOG_ITEM_REF_PROPERTY_SCHEMA: RJSFSchema = {
  type: 'object',
  title: 'Catalog data asset',
  description: 'Reference to a data catalog item (set via software catalog picker)',
  required: ['catalog', 'item', 'version'],
  properties: {
    catalog: { type: 'string' },
    item: { type: 'string' },
    version: { type: 'string' },
    channel: { type: 'string' },
  },
};

/** Resolve the shared volumes[].image schema from the form root schema. */
export const getVolumeImageSchema = (rootSchema: RJSFSchema | undefined): RJSFSchema | undefined => {
  const volumes = rootSchema?.properties?.volumes;
  if (!volumes || typeof volumes === 'boolean') {
    return undefined;
  }
  const items = Array.isArray(volumes.items) ? volumes.items[0] : volumes.items;
  if (!items || typeof items === 'boolean') {
    return undefined;
  }
  const image = items.properties?.image;
  return typeof image === 'object' ? image : undefined;
};

export const hasVolumeImageCatalogItemRefProperty = (imageSchema: RJSFSchema | undefined): boolean =>
  !!imageSchema?.properties && 'catalogItemRef' in imageSchema.properties;

export const getVolumeImageSourceMode = (rootSchema: RJSFSchema | undefined): VolumeImageSourceMode => {
  const volumeImageSchema = getVolumeImageSchema(rootSchema);
  const requiredList = Array.isArray(volumeImageSchema?.required) ? volumeImageSchema.required : [];
  if (requiredList.includes('catalogItemRef')) {
    return VolumeImageSourceMode.CatalogOnly;
  }
  if (requiredList.includes('reference')) {
    return VolumeImageSourceMode.ImageOnly;
  }
  return VolumeImageSourceMode.Both;
};

/**
 * For Both-mode volume image schemas that only declare `reference`, inject `catalogItemRef`
 * so catalog picks can live in RJSF formData (no side-channel state).
 */
export const enrichConfigSchemaForVolumeImages = (rootSchema: RJSFSchema): RJSFSchema => {
  const imageSchema = getVolumeImageSchema(rootSchema);
  if (!imageSchema) {
    return rootSchema;
  }
  if (getVolumeImageSourceMode(rootSchema) !== VolumeImageSourceMode.Both) {
    return rootSchema;
  }
  if (hasVolumeImageCatalogItemRefProperty(imageSchema)) {
    return rootSchema;
  }

  const enriched = cloneDeep(rootSchema);
  const enrichedImage = getVolumeImageSchema(enriched);
  if (!enrichedImage) {
    return rootSchema;
  }
  enrichedImage.properties = {
    ...(enrichedImage.properties || {}),
    catalogItemRef: CATALOG_ITEM_REF_PROPERTY_SCHEMA,
  };
  return enriched;
};

const catalogItemListPermission = [{ kind: RESOURCE.CATALOG_ITEM, verb: VERB.LIST }];

/** RJSF default-form-state may seed required catalogItemRef as {} or empty strings — ignore those. */
const isCompleteCatalogItemRef = (ref: unknown): ref is CatalogItemRefSpec => {
  if (!ref || typeof ref !== 'object') {
    return false;
  }
  const { catalog, item, version } = ref as CatalogItemRefSpec;
  return !!catalog && !!item && !!version;
};

/** Normalize formData: keep reference/pullPolicy, drop incomplete catalogItemRef placeholders. */
const getImageFormData = (formData: unknown): ImageVolumeSource => {
  if (!formData || typeof formData !== 'object') {
    return {};
  }
  const image = { ...(formData as ImageVolumeSource) };
  if (!isCompleteCatalogItemRef(image.catalogItemRef)) {
    delete image.catalogItemRef;
  }
  if (typeof image.reference !== 'string') {
    delete image.reference;
  }
  if (typeof image.pullPolicy !== 'string') {
    delete image.pullPolicy;
  }
  return image;
};

const getSourceLabel = (schema: RJSFSchema, name: string, id: string, mode: VolumeImageSourceMode) => {
  if (typeof schema.title === 'string' && schema.title) {
    return schema.title;
  }
  const properties = schema.properties || {};
  const preferredKey = mode === VolumeImageSourceMode.CatalogOnly ? 'catalogItemRef' : 'reference';
  const preferred = properties[preferredKey];
  if (preferred && typeof preferred === 'object' && typeof preferred.title === 'string' && preferred.title) {
    return preferred.title;
  }
  return name || id;
};

/** Apply reference XOR catalogItemRef and optional pullPolicy onto the image object. */
const buildImageFormData = (
  current: ImageVolumeSource,
  updates: {
    reference?: string;
    catalogItemRef?: CatalogItemRefSpec;
    pullPolicy?: ImagePullPolicy;
    /** When true, replace source from reference/catalogItemRef (possibly clearing both). */
    replaceSource?: boolean;
  },
): ImageVolumeSource => {
  const next: ImageVolumeSource = {};
  const pullPolicy = updates.pullPolicy ?? current.pullPolicy;
  if (pullPolicy) {
    next.pullPolicy = pullPolicy;
  }

  if (updates.replaceSource) {
    if (isCompleteCatalogItemRef(updates.catalogItemRef)) {
      next.catalogItemRef = updates.catalogItemRef;
    } else if (updates.reference) {
      next.reference = updates.reference;
    }
  } else if (isCompleteCatalogItemRef(current.catalogItemRef)) {
    next.catalogItemRef = current.catalogItemRef;
  } else if (current.reference) {
    next.reference = current.reference;
  }

  return next;
};

const SelectedVolumeDataAsset = ({
  displayName,
  imageRef,
  canUnselect,
  onUnselectAsset,
}: {
  displayName: string;
  imageRef: CatalogItemRefSpec;
  canUnselect: boolean;
  onUnselectAsset: VoidFunction;
}) => {
  const { t } = useTranslation();
  return (
    <Split hasGutter>
      <SplitItem isFilled>
        {displayName ? (
          <CatalogRefCard catalogItemRef={imageRef} headerTitle={displayName} showUpdateStatus={false} isCompact />
        ) : (
          t('Catalog item {{ catalogItemRef }}', {
            catalogItemRef: formatCatalogItemRef(imageRef),
          })
        )}
      </SplitItem>
      <SplitItem>
        <Button
          aria-label={t('Delete item')}
          variant="link"
          isDanger
          icon={<MinusCircleIcon />}
          iconPosition="start"
          isDisabled={!canUnselect}
          onClick={onUnselectAsset}
        />
      </SplitItem>
    </Split>
  );
};
/**
 * Custom field for volumes[].image: OCI reference and/or catalog item, plus pullPolicy.
 * Mounted on root_volumes_N_image. Writes XOR source + pullPolicy into formData.
 */
const VolumeImageField = ({
  idSchema,
  schema,
  name,
  formData,
  onChange,
  rawErrors,
  disabled,
  readonly,
  required,
  mode,
}: FieldProps & { mode: VolumeImageSourceMode }) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canListCatalogItems] = checkPermissions(catalogItemListPermission);
  const isCatalogOnly = mode === VolumeImageSourceMode.CatalogOnly;
  const image = getImageFormData(formData);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const catalogItem = useResolvedCatalogRef(image.catalogItemRef)?.item;
  const requiredList = Array.isArray(schema.required) ? schema.required : [];
  const sourceRequired = !!required || requiredList.includes('reference') || requiredList.includes('catalogItemRef');
  const sourceLabel = getSourceLabel(schema, name, idSchema.$id, mode);
  const pullPolicySchema = getPullPolicySchema(schema);
  const hasErrors = !!rawErrors?.length;

  const handleTextChange = (_event: React.FormEvent<HTMLInputElement>, newImgValue: string) => {
    onChange(buildImageFormData(image, { reference: newImgValue, replaceSource: true }));
  };

  const onSelect = (item: CatalogItem, version: CatalogItemVersion, channel: string) => {
    onChange(
      buildImageFormData(image, {
        catalogItemRef: buildCatalogItemRef({
          catalogItem: item,
          catalogItemVersion: version,
          channel,
        }),
        replaceSource: true,
      }),
    );
  };

  const onUnselectAsset = () => {
    onChange(buildImageFormData(image, { replaceSource: true }));
  };

  const isEditable = !disabled && !readonly;
  const canSelectFromCatalog = isEditable && canListCatalogItems && mode !== VolumeImageSourceMode.ImageOnly;

  let fieldContent: React.ReactNode;
  if (image.catalogItemRef) {
    fieldContent = (
      <SelectedVolumeDataAsset
        displayName={catalogItem?.spec.displayName || catalogItem?.metadata.name || ''}
        imageRef={image.catalogItemRef}
        canUnselect={isEditable}
        onUnselectAsset={onUnselectAsset}
      />
    );
  } else if (isCatalogOnly) {
    fieldContent = (
      <Button
        variant="secondary"
        icon={<CatalogIcon />}
        onClick={() => setIsAddModalOpen(true)}
        isDisabled={!canSelectFromCatalog}
      >
        {t('Add from software catalog')}
      </Button>
    );
  } else {
    fieldContent = (
      <Split hasGutter>
        <SplitItem isFilled>
          <TextInput
            id={idSchema.$id}
            value={image.reference || ''}
            onChange={handleTextChange}
            isDisabled={disabled}
            readOnlyVariant={readonly ? 'default' : undefined}
            validated={hasErrors ? 'error' : 'default'}
            placeholder={
              canSelectFromCatalog ? t('Enter image reference or choose from catalog') : t('Enter image reference')
            }
          />
        </SplitItem>
        {canSelectFromCatalog && (
          <SplitItem>
            <Button
              variant="secondary"
              icon={<CatalogIcon />}
              onClick={() => setIsAddModalOpen(true)}
              isDisabled={!canSelectFromCatalog}
            >
              {t('Add from software catalog')}
            </Button>
          </SplitItem>
        )}
      </Split>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup fieldId={idSchema.$id} label={sourceLabel} isRequired={sourceRequired}>
          {fieldContent}
        </FormGroup>
      </StackItem>
      {pullPolicySchema && (
        <StackItem>
          <VolumeImagePullPolicy
            id={`${idSchema.$id}_pullPolicy`}
            schema={pullPolicySchema}
            value={image.pullPolicy}
            isRequired={requiredList.includes('pullPolicy')}
            isDisabled={disabled || readonly}
            onChange={(pullPolicy) => {
              onChange(buildImageFormData(image, { pullPolicy }));
            }}
          />
        </StackItem>
      )}
      {isAddModalOpen && <VolumeImageSelectAssetModal onClose={() => setIsAddModalOpen(false)} onSelect={onSelect} />}
    </Stack>
  );
};

export default VolumeImageField;
