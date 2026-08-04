import { TFunction } from 'react-i18next';
import * as Yup from 'yup';
import {
  ExistingCatalogItemTarget,
  ExportFormatType,
  ImagePromotion,
  ImagePromotionConditionReason,
  ImagePromotionConditionType,
  NewCatalogItemTarget,
} from '@flightctl/types/imagebuilder';
import { CatalogItem } from '@flightctl/types/alpha';
import semver from 'semver';

import { ImagePromotionFormValues } from './types';
import { validKubernetesDnsSubdomain } from '../form/validations';
import {
  isValidCatalogSingleSemver,
  optionalSemver,
  optionalSemverList,
  optionalSemverRange,
} from '../Catalog/AddCatalogItemWizard/utils';

const NON_EDITABLE_PROMOTION_REASONS = new Set<ImagePromotionConditionReason>([
  ImagePromotionConditionReason.ImagePromotionConditionReasonFailed,
  ImagePromotionConditionReason.ImagePromotionConditionReasonBuildFailed,
  ImagePromotionConditionReason.ImagePromotionConditionReasonBuildCanceled,
  ImagePromotionConditionReason.ImagePromotionConditionReasonPublishing,
]);

const getImagePromotionReadyReason = (promotion: ImagePromotion): ImagePromotionConditionReason | undefined => {
  const readyCondition = promotion.status?.conditions?.find(
    (c) => c.type === ImagePromotionConditionType.ImagePromotionConditionTypeReady,
  );
  return readyCondition?.reason as ImagePromotionConditionReason | undefined;
};

// Currently only true if additional export formats can be appended to the promotion.
export const canPromotionBeEdited = (promotion: ImagePromotion, availableFormats: ExportFormatType[]): boolean => {
  const reason = getImagePromotionReadyReason(promotion);
  if (reason && NON_EDITABLE_PROMOTION_REASONS.has(reason)) {
    return false;
  }
  const currentFormats = promotion.spec.source.exportFormats || [];
  return availableFormats.some((format) => !currentFormats.includes(format));
};

export const getPromotionEditDisabledReason = (
  promotion: ImagePromotion,
  availableFormats: ExportFormatType[],
  canEdit: boolean,
  t: TFunction,
): string | undefined => {
  if (!canEdit) {
    return t('You do not have permissions to update image promotions');
  }
  if (canPromotionBeEdited(promotion, availableFormats)) {
    return undefined;
  }

  const reason = getImagePromotionReadyReason(promotion);
  switch (reason) {
    case ImagePromotionConditionReason.ImagePromotionConditionReasonPublishing:
      return t('Image promotion cannot be edited while publishing is in progress');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonFailed:
      return t('Failed image promotions cannot be edited. Create a new image promotion to retry.');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildFailed:
      return t('Image promotions for failed image builds cannot be edited. Create a new image promotion to retry.');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildCanceled:
      return t('Image promotions for canceled image builds cannot be edited. Create a new image promotion to retry.');
    default:
      return t('All export formats from this image build are already included in this promotion');
  }
};

export const getEditInitialValues = (imagePromotion: ImagePromotion): ImagePromotionFormValues => {
  const target = imagePromotion.spec.target;
  const isExisting = target.type === ExistingCatalogItemTarget.type.EXISTING_CATALOG_ITEM;
  const existingTarget = target as ExistingCatalogItemTarget;
  const newTarget = target as NewCatalogItemTarget;

  return {
    name: (imagePromotion.metadata.name || '') as '',
    catalog: (isExisting ? existingTarget.catalogName : newTarget.catalogName) || '',
    type: isExisting ? 'existing' : 'new',
    exportFormats: imagePromotion.spec.source.exportFormats || [],
    existingItem: {
      name: existingTarget.catalogItemName || '',
      version: existingTarget.version || '',
      replaces: existingTarget.replaces || '',
      skips: (existingTarget.skips || []).join(', '),
      skipRange: existingTarget.skipRange || '',
      readme: existingTarget.readme || '',
    },
    newItem: {
      name: newTarget.catalogItemName || '',
      displayName: newTarget.displayName || '',
      version: newTarget.version || '',
      readme: newTarget.readme || '',
    },
  };
};

const TESTING_CHANNEL = 'testing';

const bumpPatchVersion = (version: string): string => semver.inc(version, 'patch') ?? version;

const getLatestTestingVersion = (catalogItem: CatalogItem): string | undefined => {
  const testingVersions = catalogItem.spec.versions.filter(
    (v) => v.channels.includes(TESTING_CHANNEL) && semver.valid(v.version),
  );
  if (testingVersions.length === 0) return undefined;
  return testingVersions.sort((a, b) => semver.rcompare(a.version, b.version))[0].version;
};

export const getInitialValues = (catalogItem: CatalogItem | undefined): ImagePromotionFormValues => {
  if (catalogItem) {
    const latestTestingVersion = getLatestTestingVersion(catalogItem);
    return {
      ...defaultInitialValues,
      catalog: catalogItem.metadata.catalog,
      type: 'existing',
      existingItem: {
        name: catalogItem.metadata.name || '',
        version: latestTestingVersion ? bumpPatchVersion(latestTestingVersion) : '',
        replaces: latestTestingVersion || '',
        skips: '',
        skipRange: '',
        readme: '',
      },
    };
  }

  return defaultInitialValues;
};

export const defaultInitialValues: ImagePromotionFormValues = {
  name: '',
  catalog: '',
  type: 'new',
  exportFormats: [],
  newItem: { name: '', displayName: '', version: '', readme: '' },
  existingItem: { name: '', version: '', replaces: '', skips: '', skipRange: '', readme: '' },
};

const requiredSemver = (t: TFunction) =>
  Yup.string()
    .required(t('Version is required'))
    .test(
      'valid-semver',
      t('Must be a valid semantic version (e.g. 1.0.0, 2.1.0-rc1). Leading "v" is not allowed.'),
      (value) => {
        if (!value) return true;
        return isValidCatalogSingleSemver(value);
      },
    );

export const getImagePromotionValidationSchema = (t: TFunction) =>
  Yup.object().shape({
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    catalog: Yup.string().required(t('Catalog is required')),
    newItem: Yup.object().when('type', {
      is: 'new',
      then: () =>
        Yup.object().shape({
          name: validKubernetesDnsSubdomain(t, { isRequired: true }),
          displayName: Yup.string(),
          version: requiredSemver(t),
          readme: Yup.string(),
        }),
      otherwise: () => Yup.object(),
    }),
    existingItem: Yup.object().when('type', {
      is: 'existing',
      then: () =>
        Yup.object().shape({
          name: Yup.string().required(t('Catalog item is required')),
          version: requiredSemver(t),
          replaces: optionalSemver(t),
          skips: optionalSemverList(t),
          skipRange: optionalSemverRange(t),
          readme: Yup.string(),
        }),
      otherwise: () => Yup.object(),
    }),
  });
