import {
  AppType,
  type ApplicationVolume,
  type ImageMountVolumeProviderSpec,
  type ImageOrCatalogItemRefSpec,
  ImagePullPolicy,
  type ImageVolumeSource,
} from '@flightctl/types';

// A full application volume includes the image mount volume provider spec
export type FullAppVolume = ApplicationVolume & ImageMountVolumeProviderSpec;

export type ApplicationVolumeForm = {
  name: string;
  imageSpec: ImageOrCatalogItemRefSpec;
  imagePullPolicy: ImagePullPolicy;
  mountPath: string;
};

const toFormVolumeImageSpec = (image?: ImageVolumeSource): ImageOrCatalogItemRefSpec => {
  if (image?.catalogItemRef) {
    return { catalogItemRef: image.catalogItemRef };
  }
  return { image: image?.reference || '' };
};

/**
 * Converts form volumes to API volumes, ignoring fields that are not allowed for the given app type.
 * Quadlet/Compose apps --> can only be image volumes (mount is not allowed)
 * Container apps --> can either be mount or image mount volumes
 */
export const formVolumesToApi = (
  volumes: ApplicationVolumeForm[] | undefined,
  appType: AppType,
): ApplicationVolume[] => {
  if (!volumes) return [];
  return volumes.map((v) => {
    const vol: Partial<FullAppVolume> = {
      name: v.name || '',
    };

    const catalogRef = v.imageSpec?.catalogItemRef;
    const imageRef = v.imageSpec?.image;
    if (catalogRef || imageRef) {
      const pullPolicy = v.imagePullPolicy || ImagePullPolicy.PullIfNotPresent;
      vol.image = catalogRef ? { catalogItemRef: catalogRef, pullPolicy } : { reference: imageRef, pullPolicy };
    }
    if (v.mountPath && appType === AppType.AppTypeContainer) {
      vol.mount = { path: v.mountPath };
    }
    return vol as ApplicationVolume;
  });
};

export const toFormVolumes = (volumes?: ApplicationVolume[]): ApplicationVolumeForm[] => {
  if (!volumes) return [];
  return volumes.map((vol) => {
    const fullVolume = vol as FullAppVolume;
    return {
      name: fullVolume.name,
      imageSpec: toFormVolumeImageSpec(fullVolume.image),
      imagePullPolicy: fullVolume.image?.pullPolicy || ImagePullPolicy.PullIfNotPresent,
      mountPath: fullVolume.mount?.path || '',
    };
  });
};
