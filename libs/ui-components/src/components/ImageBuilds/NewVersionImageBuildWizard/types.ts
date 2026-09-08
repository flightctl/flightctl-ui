import { type ExportFormatType } from '@flightctl/types/imagebuilder';
import { type ImagePromotionFormValues } from '../../ImagePromotion/types';

export type NewVersionWizardFormValues = ImagePromotionFormValues & {
  buildName: string;
  sourceImageTag: string;
  destinationImageTag: string;
  promoteToCatalog: boolean;
  exportFormats: ExportFormatType[];
};
