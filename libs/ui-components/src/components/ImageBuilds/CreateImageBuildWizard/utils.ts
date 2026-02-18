import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  ApiVersion,
  BindingType,
  ExportFormatType,
  ImageBuild,
  ImageBuildDestination,
  ImageBuildSource,
  ImageBuildUserConfiguration,
  ImageExport,
  ResourceKind,
} from '@flightctl/types/imagebuilder';
import { ImageBuildFormValues } from './types';
import { ImageBuildWithExports } from '../../../types/extraTypes';

export const PUBLIC_KEY_MAX_LENGTH = 8 * 1024; // (8 KB)
const VALID_SSH_PUBLIC_KEY_TYPES = [
  'ssh-rsa',
  'ssh-ed25519',
  'ecdsa-sha2-nistp256',
  'ecdsa-sha2-nistp384',
  'ecdsa-sha2-nistp521',
  'ssh-dss',
];

const SSH_PUBLIC_KEY_BASE64_DATA_REGEX = /^(?=.{50,}$)[A-Za-z0-9+/]+=*$/;
// Characters that could be used for injection attacks
const MALICIOUS_PUBLIC_KEY_CHARACTERS = /[;|&`()[\]{}<>"'\\\t$]/;

const getPublicKeyValidationError = (publicKey: string, t: TFunction): string | undefined => {
  if (publicKey.length > PUBLIC_KEY_MAX_LENGTH) {
    return t('SSH public key is too long');
  }

  // Allow newlines only at the end
  const trimmedKey = publicKey.replace(/[\r\n]+$/g, '');
  if (/[\r\n]/.test(trimmedKey)) {
    return t('A single public key can be provided only');
  }

  if (MALICIOUS_PUBLIC_KEY_CHARACTERS.test(trimmedKey)) {
    return t('Invalid SSH public key');
  }

  const parts = trimmedKey.trim().split(/\s+/);
  if (parts.length < 2) {
    return t('Invalid SSH public key format. Expected: "[TYPE] key [comment]"');
  }

  const keyType = parts[0];
  if (!VALID_SSH_PUBLIC_KEY_TYPES.includes(keyType)) {
    return t('Unsupported SSH public key type. Supported types: {{supportedTypes}}', {
      supportedTypes: VALID_SSH_PUBLIC_KEY_TYPES.join(', '),
    });
  }

  const base64Data = parts[1];
  if (!SSH_PUBLIC_KEY_BASE64_DATA_REGEX.test(base64Data)) {
    return t('Invalid SSH public key data');
  }

  return undefined;
};

export const getValidationSchema = (t: TFunction) => {
  return Yup.lazy((values: ImageBuildFormValues) =>
    Yup.object<ImageBuildFormValues>({
      source: Yup.object<ImageBuildSource>({
        repository: Yup.string().required(t('Source repository is required')),
        imageName: Yup.string().required(t('Image name is required')),
        imageTag: Yup.string().required(t('Image tag is required')),
      }).required(t('Source image is required')),
      destination: Yup.object<ImageBuildDestination>({
        repository: Yup.string().required(t('Target repository is required')),
        imageName: Yup.string().required(t('Image name is required')),
        imageTag: Yup.string().required(t('Image tag is required')),
      }).required(t('Target image is required')),
      bindingType: Yup.string<BindingType>().required(t('Binding type is required')),
      userConfiguration: Yup.object<ImageBuildUserConfiguration>({
        username: values.remoteAccessEnabled ? Yup.string().required(t('Username is required')) : Yup.string(),
        publickey: values.remoteAccessEnabled
          ? Yup.string()
              .required(t('SSH public key is required'))
              .test('flightctl-ssh-public-key', function (publicKey) {
                if (!publicKey) {
                  return true;
                }
                const error = getPublicKeyValidationError(publicKey, t);
                return error ? this.createError({ message: error }) : true;
              })
          : Yup.string(),
      }),
    }),
  );
};

// Returns an array with one item per format (VMDK, QCOW2, ISO), where each item is either
// undefined or the latest ImageExport for that format.
const getImageExportsByFormat = (
  imageExports?: ImageExport[],
): { imageExports: (ImageExport | undefined)[]; exportsCount: number } => {
  const formatMap: Partial<Record<ExportFormatType, ImageExport>> = {};

  imageExports?.forEach((ie) => {
    const format = ie.spec.format;
    const existing = formatMap[format];

    if (!existing) {
      formatMap[format] = ie;
    } else {
      // Compare creation timestamps to keep the most recent
      const existingTimestamp = existing.metadata.creationTimestamp || '';
      const currentTimestamp = ie.metadata.creationTimestamp;

      if (existingTimestamp && currentTimestamp) {
        const existingTime = new Date(existingTimestamp).getTime();
        const currentTime = new Date(currentTimestamp).getTime();
        if (currentTime > existingTime) {
          formatMap[format] = ie;
        }
      }
    }
  });

  return {
    imageExports: [
      formatMap[ExportFormatType.ExportFormatTypeISO],
      formatMap[ExportFormatType.ExportFormatTypeQCOW2DiskContainer],
      formatMap[ExportFormatType.ExportFormatTypeQCOW2],
      formatMap[ExportFormatType.ExportFormatTypeVMDK],
    ],
    exportsCount: imageExports?.length || 0,
  };
};

export const toImageBuildWithExports = (imageBuild: ImageBuild): ImageBuildWithExports => {
  const allExports = imageBuild.imageexports || [];
  const imageExportsByFormat = getImageExportsByFormat(allExports);
  const latestExports = [...imageExportsByFormat.imageExports];

  // Disable the rule as we want to omit the "imageexports" field
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { imageexports, ...imageBuildWithoutExports } = imageBuild;
  return {
    ...imageBuildWithoutExports,
    imageExports: latestExports,
    exportsCount: allExports.length,
  };
};

const getExistingImageData = (image: ImageBuildSource | ImageBuildDestination, repoIds: Set<string>) => {
  if (repoIds.has(image.repository)) {
    return image;
  }
  // When copying the image build, drop the reference to the repository if it doesn't exist anymore
  return {
    ...image,
    repository: '',
  };
};

export const getInitialValues = (
  imageBuild: ImageBuildWithExports | undefined,
  repoIds: Set<string>,
): ImageBuildFormValues => {
  if (imageBuild) {
    const exportFormats = imageBuild.imageExports
      .filter((ie): ie is ImageExport => ie !== undefined)
      .map((imageExport) => imageExport.spec.format);
    const userConfig = imageBuild.spec.userConfiguration;
    return {
      source: getExistingImageData(imageBuild.spec.source, repoIds),
      destination: getExistingImageData(imageBuild.spec.destination, repoIds),
      bindingType: imageBuild.spec.binding.type as BindingType,
      exportFormats: exportFormats || [],
      remoteAccessEnabled: !!(userConfig?.username || userConfig?.publickey),
      userConfiguration: userConfig || { username: '', publickey: '' },
    };
  }

  return {
    source: {
      repository: '',
      imageName: '',
      imageTag: '',
    },
    destination: {
      repository: '',
      imageName: '',
      imageTag: '',
    },
    bindingType: BindingType.BindingTypeEarly,
    exportFormats: [],
    remoteAccessEnabled: false,
    userConfiguration: {
      username: '',
      publickey: '',
    },
  };
};

// Generates a random 6-digit hex hash
const getHash = () =>
  Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, '0');

const generateBuildName = () => `imagebuild-${getHash()}`;
const generateExportName = (imageBuildName: string, format: ExportFormatType) => {
  const formatKey = format === ExportFormatType.ExportFormatTypeQCOW2DiskContainer ? 'qcow2-disk' : format;
  return `${imageBuildName}-${formatKey}-${getHash()}`;
};

export const getImageBuildResource = (values: ImageBuildFormValues): ImageBuild => {
  const name = generateBuildName();
  const spec: ImageBuild['spec'] = {
    source: values.source,
    destination: values.destination,
    binding: {
      type: values.bindingType,
    },
  };

  // Allow the user to uncheck the toggle without having cleared the fields
  const username = values.userConfiguration.username || '';
  const publickey = values.userConfiguration.publickey || '';
  if (values.remoteAccessEnabled && username && publickey) {
    spec.userConfiguration = {
      username,
      publickey,
    };
  }

  return {
    apiVersion: ApiVersion.ApiVersionV1alpha1,
    kind: ResourceKind.IMAGE_BUILD,
    metadata: {
      name,
    },
    spec,
  };
};

export const getImageExportResource = (imageBuildName: string, format: ExportFormatType): ImageExport => {
  const exportName = generateExportName(imageBuildName, format);

  return {
    apiVersion: ApiVersion.ApiVersionV1alpha1,
    kind: ResourceKind.IMAGE_EXPORT,
    metadata: {
      name: exportName,
    },
    spec: {
      source: {
        type: 'imageBuild',
        imageBuildRef: imageBuildName,
      },
      format,
    },
  };
};

export const getImageExportResources = (values: ImageBuildFormValues, imageBuildName: string): ImageExport[] => {
  if (!values.exportFormats || values.exportFormats.length === 0) {
    return [];
  }

  return values.exportFormats.map((format) => getImageExportResource(imageBuildName, format));
};
