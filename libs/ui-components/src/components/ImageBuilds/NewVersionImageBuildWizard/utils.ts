import { ApiVersion, CatalogItem } from '@flightctl/types/alpha';
import { ExistingCatalogItemTarget, ImagePromotion, NewCatalogItemTarget } from '@flightctl/types/imagebuilder';
import semver from 'semver';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  getKubernetesDnsSubdomainErrors,
  validImageBuildName,
  validKubernetesDnsSubdomain,
} from '../../form/validations';
import { getImageTagValidationError } from '../CreateImageBuildWizard/utils';
import {
  isValidCatalogSingleSemver,
  optionalSemver,
  optionalSemverList,
  optionalSemverRange,
} from '../../Catalog/AddCatalogItemWizard/utils';
import { defaultInitialValues } from '../../ImagePromotion/utils';
import { ImagePromotionFormValues } from '../../ImagePromotion/types';

const TESTING_CHANNEL = 'testing';

export const getImagePromotion = (values: ImagePromotionFormValues, buildName: string): ImagePromotion => {
  let promotionTarget: NewCatalogItemTarget | ExistingCatalogItemTarget;
  if (values.type === 'new') {
    promotionTarget = {
      catalogItemName: values.new.name,
      catalogName: values.catalog,
      type: NewCatalogItemTarget.type.NEW_CATALOG_ITEM,
      version: values.new.version,
      readme: values.new.readme,
    } as NewCatalogItemTarget;
  } else {
    promotionTarget = {
      type: ExistingCatalogItemTarget.type.EXISTING_CATALOG_ITEM,
      catalogItemName: values.existing.name,
      catalogName: values.catalog,
      version: values.existing.version,
      readme: values.existing.readme,
      replaces: values.existing.replaces?.trim() || undefined,
      skipRange: values.existing.skipRange?.trim() || undefined,
      skips: values.existing.skips
        ? values.existing.skips
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    } as ExistingCatalogItemTarget;
  }

  const newImagePromotion: ImagePromotion = {
    apiVersion: ApiVersion.ApiVersionV1alpha1,
    kind: 'ImagePromotion',
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

export const getCatalogInitialValues = (catalogItem: CatalogItem | undefined) => {
  if (catalogItem) {
    const latestTestingVersion = getLatestTestingVersion(catalogItem);
    return {
      ...defaultInitialValues,
      catalog: catalogItem.metadata.catalog,
      type: 'existing' as const,
      existing: {
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

const validItemName = (t: TFunction) =>
  Yup.string()
    .required(t('Item name is required'))
    .test(
      'k8sDnsSubdomain',
      t(
        'Must start and end with a lowercase letter or number, and contain only lowercase letters, numbers, hyphens (-), or dots (.).',
      ),
      (value) => {
        if (!value) return true;
        return Object.keys(getKubernetesDnsSubdomainErrors(value)).length === 0;
      },
    );

export const getValidationSchema = (t: TFunction) =>
  Yup.object({
    buildName: validImageBuildName(t),
    sourceImageTag: Yup.string().test('oci-image-tag', function (value) {
      if (!value) return true;
      const error = getImageTagValidationError(value, t);
      return error ? this.createError({ message: error }) : true;
    }),
    destinationImageTag: Yup.string().test('oci-image-tag', function (value) {
      if (!value) return true;
      const error = getImageTagValidationError(value, t);
      return error ? this.createError({ message: error }) : true;
    }),
    name: Yup.string().when('promoteToCatalog', {
      is: true,
      then: () => validKubernetesDnsSubdomain(t, { isRequired: true }),
      otherwise: () => Yup.string(),
    }),
    catalog: Yup.string().when('promoteToCatalog', {
      is: true,
      then: () => Yup.string().required(t('Catalog is required')),
      otherwise: () => Yup.string(),
    }),
    new: Yup.object().when(['promoteToCatalog', 'type'], ([promoteToCatalog, type]) => {
      if (promoteToCatalog && type === 'new') {
        return Yup.object().shape({
          name: validItemName(t),
          displayName: Yup.string(),
          version: requiredSemver(t),
          readme: Yup.string(),
        });
      }
      return Yup.object();
    }),
    existing: Yup.object().when(['promoteToCatalog', 'type'], ([promoteToCatalog, type]) => {
      if (promoteToCatalog && type === 'existing') {
        return Yup.object().shape({
          name: Yup.string().required(t('Catalog item is required')),
          version: requiredSemver(t),
          replaces: optionalSemver(t),
          skips: optionalSemverList(t),
          skipRange: optionalSemverRange(t),
          readme: Yup.string(),
        });
      }
      return Yup.object();
    }),
  });
