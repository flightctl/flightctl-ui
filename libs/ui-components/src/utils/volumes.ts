import {
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

export const buildApiVolume = (
  name: string,
  imageSpec: ImageOrCatalogItemRefSpec,
  imagePolicy: ImagePullPolicy | undefined,
  mountPath: string | undefined,
): ApplicationVolume => {
  const vol: Partial<FullAppVolume> = {
    name,
  };

  const catalogRef = imageSpec?.catalogItemRef;
  const imageRef = imageSpec?.image;
  if (catalogRef || imageRef) {
    const pullPolicy = imagePolicy || ImagePullPolicy.PullIfNotPresent;
    vol.image = catalogRef ? { catalogItemRef: catalogRef, pullPolicy } : { reference: imageRef, pullPolicy };
  }
  if (mountPath) {
    vol.mount = { path: mountPath };
  }
  return vol as ApplicationVolume;
};

export const formVolumesToApi = (volumes: ApplicationVolumeForm[] | undefined): ApplicationVolume[] => {
  if (!volumes) return [];
  return volumes.map((v) => buildApiVolume(v.name || '', v.imageSpec, v.imagePullPolicy, v.mountPath));
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
