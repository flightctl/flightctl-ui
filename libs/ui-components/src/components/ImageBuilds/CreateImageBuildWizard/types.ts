import {
  BindingType,
  ImageBuildDestination,
  ImageBuildSource,
  ImageBuildUserConfiguration,
} from '@flightctl/types/imagebuilder';
import { ExportFormatType } from '@flightctl/types/imagebuilder';
import { CatalogStepValues } from './steps/CatalogStep';

export type ImageBuildFormValues = CatalogStepValues & {
  buildName: string;
  source: ImageBuildSource;
  destination: ImageBuildDestination;
  bindingType: BindingType;
  exportFormats: ExportFormatType[];
  remoteAccessEnabled: boolean;
  userConfiguration: ImageBuildUserConfiguration;
};

export type ImageBuildWizardError =
  | {
      type: 'build';
      error: unknown;
    }
  | {
      type: 'export';
      buildName: string;
      errors: Array<{ format: ExportFormatType; error: unknown }>;
    }
  | {
      type: 'promotion';
      error: unknown;
    };
