import {
  BindingType,
  ImageBuildDestination,
  ImageBuildSource,
  ImageBuildUserConfiguration,
} from '@flightctl/types/imagebuilder';
import { ExportFormatType } from '@flightctl/types/imagebuilder';

type ImageBuildUserConfigurationForm = ImageBuildUserConfiguration & {
  enabled?: boolean;
};

export type ImageBuildFormValues = {
  // name is autogenereated by us
  source: ImageBuildSource;
  destination: ImageBuildDestination;
  bindingType: BindingType;
  exportFormats: ExportFormatType[];
  userConfiguration?: ImageBuildUserConfigurationForm;
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
    };
