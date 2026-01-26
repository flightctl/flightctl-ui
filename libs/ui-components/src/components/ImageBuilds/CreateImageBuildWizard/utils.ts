import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  BindingType,
  ExportFormatType,
  ImageBuild,
  ImageBuildDestination,
  ImageBuildSource,
  ImageExport,
  ResourceKind,
} from '@flightctl/types/imagebuilder';
import { API_VERSION } from '../../../constants';
import { ImageBuildFormValues } from './types';
import { ImageBuildWithExports } from '../../../types/extraTypes';

export const getValidationSchema = (t: TFunction) => {
  return Yup.object<ImageBuildFormValues>({
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
  });
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

export const getInitialValues = (imageBuild?: ImageBuildWithExports): ImageBuildFormValues => {
  if (imageBuild) {
    const exportFormats = imageBuild.imageExports
      .filter((ie): ie is ImageExport => ie !== undefined)
      .map((imageExport) => imageExport.spec.format);
    const userConfig = imageBuild.spec.userConfiguration;
    const userConfiguration = userConfig
      ? {
          ...userConfig,
          enabled: !!(userConfig.username || userConfig.publickey),
        }
      : {
          username: '',
          publickey: '',
          enabled: false,
        };
    return {
      source: imageBuild.spec.source,
      destination: imageBuild.spec.destination,
      bindingType: imageBuild.spec.binding.type as BindingType,
      exportFormats: exportFormats || [],
      userConfiguration,
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
    userConfiguration: {
      username: '',
      publickey: '',
      enabled: false,
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
  return `${imageBuildName}-${format}-${getHash()}`;
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

  if (values.userConfiguration?.username && values.userConfiguration?.publickey) {
    spec.userConfiguration = {
      username: values.userConfiguration.username,
      publickey: values.userConfiguration.publickey,
    };
  }

  return {
    apiVersion: API_VERSION,
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
    apiVersion: API_VERSION,
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
