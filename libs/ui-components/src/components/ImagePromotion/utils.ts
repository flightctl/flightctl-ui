import { TFunction } from 'react-i18next';
import * as Yup from 'yup';
import { ExistingCatalogItemTarget, ImagePromotion, NewCatalogItemTarget } from '@flightctl/types/imagebuilder';
import { CatalogItem } from '@flightctl/types/alpha';
import semver from 'semver';

import { ImagePromotionFormValues } from './types';
import { getKubernetesDnsSubdomainErrors, validKubernetesDnsSubdomain } from '../form/validations';
import {
  isValidCatalogSingleSemver,
  optionalSemver,
  optionalSemverList,
  optionalSemverRange,
} from '../Catalog/AddCatalogItemWizard/utils';

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
      displayName: '',
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
          name: validItemName(t),
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
