import { BindingType, ImageBuildDestination, ImageBuildSource } from '@flightctl/types/imagebuilder';
import { ExportFormatType } from '@flightctl/types/imagebuilder';

export type ImageBuildFormValues = {
  // name is autogenereated by us
  source: ImageBuildSource;
  destination: ImageBuildDestination;
  bindingType: BindingType;
  exportFormats: ExportFormatType[];
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
