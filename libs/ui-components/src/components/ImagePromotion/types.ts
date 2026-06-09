import { ExportFormatType } from '@flightctl/types/imagebuilder';

export type ImagePromotionFormValues = {
  name: string;
  catalog: string;
  type: 'new' | 'existing';
  exportFormats: ExportFormatType[];
  additionalExportFormats?: ExportFormatType[];
  newItem: {
    name: string;
    displayName: string;
    version: string;
    readme: string;
  };
  existingItem: {
    name: string;
    version: string;
    replaces: string;
    skips: string;
    skipRange: string;
    readme: string;
  };
};
