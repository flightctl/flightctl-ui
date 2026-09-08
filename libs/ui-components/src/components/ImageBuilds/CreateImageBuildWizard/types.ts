import {
  type BindingType,
  type ImageBuildDestination,
  type ImageBuildSource,
  type ImageBuildUserConfiguration,
} from '@flightctl/types/imagebuilder';
import { type ExportFormatType } from '@flightctl/types/imagebuilder';
import { type CatalogStepValues } from './steps/CatalogStep';

export type ImageBuildFormValues = CatalogStepValues & {
  buildName: string;
  source: ImageBuildSource;
  destination: ImageBuildDestination;
  bindingType: BindingType;
  exportFormats: ExportFormatType[];
  onboarding: boolean;
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
