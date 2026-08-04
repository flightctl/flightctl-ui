import { ApiVersion, CatalogItem } from '@flightctl/types/alpha';
import {
  ExistingCatalogItemTarget,
  ImagePromotion,
  NewCatalogItemTarget,
  ResourceKind,
} from '@flightctl/types/imagebuilder';
import semver from 'semver';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { validImageBuildName } from '../../form/validations';
import { getImageTagValidationError } from '../CreateImageBuildWizard/utils';
import { defaultInitialValues, getImagePromotionValidationSchema } from '../../ImagePromotion/utils';
import { ImagePromotionFormValues } from '../../ImagePromotion/types';
import { NewVersionWizardFormValues } from './types';

const TESTING_CHANNEL = 'testing';

// Drop fields with empty string. Otherwise they're later detected as changed when the associated catalog item is updated.
const optionalTrimmed = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

export const getImagePromotion = (values: ImagePromotionFormValues, buildName: string): ImagePromotion => {
  let promotionTarget: NewCatalogItemTarget | ExistingCatalogItemTarget;
  if (values.type === 'new') {
    promotionTarget = {
      catalogItemName: values.newItem.name,
      catalogName: values.catalog,
      type: NewCatalogItemTarget.type.NEW_CATALOG_ITEM,
      version: values.newItem.version,
      readme: optionalTrimmed(values.newItem.readme),
      displayName: optionalTrimmed(values.newItem.displayName),
    } as NewCatalogItemTarget;
  } else {
    const skips =
      values.existingItem.skips || []
        ? values.existingItem.skips
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    promotionTarget = {
      type: ExistingCatalogItemTarget.type.EXISTING_CATALOG_ITEM,
      catalogItemName: values.existingItem.name,
      catalogName: values.catalog,
      version: values.existingItem.version,
      readme: optionalTrimmed(values.existingItem.readme),
      replaces: optionalTrimmed(values.existingItem.replaces),
      skipRange: optionalTrimmed(values.existingItem.skipRange),
      skips: skips.length ? skips : undefined,
    } as ExistingCatalogItemTarget;
  }

  const newImagePromotion: ImagePromotion = {
    apiVersion: ApiVersion.ApiVersionV1alpha1,
    kind: ResourceKind.IMAGE_PROMOTION,
    metadata: {
      name: values.name,
    },
    spec: {
      source: {
        imageBuildRef: buildName,
        exportFormats: values.exportFormats.length > 0 ? values.exportFormats : undefined,
      },
      target: promotionTarget,
    },
  };

  return newImagePromotion;
};

export const bumpImageTag = (tag: string): string => {
  const match = tag.match(/^(.*)-(\d+)$/);
  if (match) {
    return `${match[1]}-${parseInt(match[2], 10) + 1}`;
  }
  return `${tag}-1`;
};

const bumpPatchVersion = (version: string): string => semver.inc(version, 'patch') ?? version;

export const getLatestPromotion = (promotions: ImagePromotion[]): ImagePromotion | undefined => {
  if (promotions.length === 0) return undefined;
  return promotions.slice().sort((a, b) => {
    const aTime = a.metadata.creationTimestamp ? new Date(a.metadata.creationTimestamp).getTime() : 0;
    const bTime = b.metadata.creationTimestamp ? new Date(b.metadata.creationTimestamp).getTime() : 0;
    return bTime - aTime;
  })[0];
};

const getLatestTestingVersion = (catalogItem: CatalogItem): string | undefined => {
  const testingVersions = catalogItem.spec.versions.filter(
    (v) => v.channels.includes(TESTING_CHANNEL) && semver.valid(v.version),
  );
  if (testingVersions.length === 0) return undefined;
  return testingVersions.sort((a, b) => semver.rcompare(a.version, b.version))[0].version;
};

export const getCatalogInitialValues = (catalogItem: CatalogItem | undefined): ImagePromotionFormValues => {
  if (catalogItem) {
    const latestTestingVersion = getLatestTestingVersion(catalogItem);
    return {
      ...defaultInitialValues,
      catalog: catalogItem.metadata.catalog,
      type: 'existing' as const,
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

export const getValidationSchema = (t: TFunction) =>
  Yup.lazy((values: NewVersionWizardFormValues) => {
    const imageBuildSchema = Yup.object({
      buildName: validImageBuildName(t),
      sourceImageTag: Yup.string().test('oci-image-tag', function (value) {
        if (!value) return true;
        const error = getImageTagValidationError(value, t);
        return error ? this.createError({ message: error }) : true;
      }),
      destinationImageTag: Yup.string().test('oci-dst-image-tag', function (value) {
        if (!value) return true;
        const error = getImageTagValidationError(value, t);
        return error ? this.createError({ message: error }) : true;
      }),
    });

    if (values.promoteToCatalog) {
      return imageBuildSchema.concat(getImagePromotionValidationSchema(t));
    }

    return imageBuildSchema;
  });
